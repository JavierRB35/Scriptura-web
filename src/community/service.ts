// Servicio de comunidad (solo servidor): comentarios sobre pasajes reales,
// respuestas, likes, favoritos, debates con ciclo editorial, notificaciones y
// reputación con parámetros versionados (§7, §8, §9, §10, §14).
// Toda autorización se comprueba aquí, en el servidor (§18.6).

import "server-only";
import { query, db } from "@/shared/db";
import type { CurrentUser } from "@/auth/session";

// ─── Reputación ───────────────────────────────────────────────────────────────

interface RuleParams {
  points_per_comment: number;
  points_per_reply: number;
  points_per_like_received: number;
  daily_activity_points_cap: number;
}

async function activeRules(): Promise<RuleParams> {
  const { rows } = await query<{ params: RuleParams }>(
    "SELECT params FROM reputation_rules WHERE active ORDER BY version DESC LIMIT 1"
  );
  return rows[0].params;
}

/** Registra un evento de reputación respetando el tope diario de puntos. */
async function recordReputationEvent(client: pgClient, input: {
  userId: string;
  eventType: "comment_published" | "reply_published" | "like_received" | "like_removed" | "adjustment";
  basePoints: number;
  sourceType?: string;
  sourceId?: string;
  sourceUserId?: string;
}) {
  const rules = await activeRules();
  let points = input.basePoints;
  if (points > 0 && rules.daily_activity_points_cap > 0) {
    const { rows } = await client.query<{ today: number }>(
      `SELECT COALESCE(SUM(points_delta), 0)::int AS today
         FROM reputation_events
        WHERE user_id = $1 AND points_delta > 0
          AND created_at >= date_trunc('day', now())`,
      [input.userId]
    );
    points = Math.max(0, Math.min(points, rules.daily_activity_points_cap - rows[0].today));
  }
  await client.query(
    `INSERT INTO reputation_events (user_id, event_type, points_delta, source_type, source_id, source_user_id, rule_version)
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT version FROM reputation_rules WHERE active ORDER BY version DESC LIMIT 1))`,
    [input.userId, input.eventType, points, input.sourceType ?? null, input.sourceId ?? null, input.sourceUserId ?? null]
  );
  await recomputeLevel(client, input.userId);
}

/** Recalcula el total y concede el nivel alcanzado si es nuevo (§10.4). */
async function recomputeLevel(client: pgClient, userId: string) {
  const { rows } = await client.query<{ total: number }>(
    "SELECT COALESCE(SUM(points_delta), 0)::int AS total FROM reputation_events WHERE user_id = $1",
    [userId]
  );
  const total = rows[0].total;
  const { rows: level } = await client.query<{ id: string; name: string }>(
    `SELECT id, name FROM recognition_levels
      WHERE active AND min_points <= $1
      ORDER BY min_points DESC LIMIT 1`,
    [total]
  );
  if (level.length === 0) return;
  const { rows: already } = await client.query(
    "SELECT 1 FROM user_recognitions WHERE user_id = $1 AND level_id = $2",
    [userId, level[0].id]
  );
  if (already.length === 0) {
    await client.query(
      "INSERT INTO user_recognitions (user_id, level_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, level[0].id]
    );
    await client.query(
      `INSERT INTO notifications (recipient_id, type, title, link)
       VALUES ($1, 'recognition', $2, '/mi-espacio')`,
      [userId, `Has alcanzado el nivel «${level[0].name}»`]
    );
  }
}

type pgClient = import("pg").PoolClient;

export interface ReputationSummary {
  total: number;
  levelName: string;
  nextLevel: string | null;
  pointsToNext: number | null;
}

export async function getReputationSummary(userId: string): Promise<ReputationSummary> {
  const { rows } = await query<{ total: number }>(
    "SELECT COALESCE(SUM(points_delta), 0)::int AS total FROM reputation_events WHERE user_id = $1",
    [userId]
  );
  const total = rows[0].total;
  const { rows: current } = await query<{ name: string; min_points: number }>(
    "SELECT name, min_points FROM recognition_levels WHERE active AND min_points <= $1 ORDER BY min_points DESC LIMIT 1",
    [total]
  );
  const { rows: next } = await query<{ name: string; min_points: number }>(
    "SELECT name, min_points FROM recognition_levels WHERE active AND min_points > $1 ORDER BY min_points ASC LIMIT 1",
    [total]
  );
  return {
    total,
    levelName: current[0]?.name ?? "Explorador",
    nextLevel: next[0]?.name ?? null,
    pointsToNext: next[0] ? next[0].min_points - total : null,
  };
}

// ─── Validación de pasajes (§7.1) ─────────────────────────────────────────────

export async function passageExists(
  bookCode: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  editionId: string
): Promise<boolean> {
  const { rows } = await query<{ maxch: number | null; maxv: number | null }>(
    `SELECT (SELECT max(c.chapter_number) FROM bible_chapters c
              JOIN biblical_books b ON b.id = c.book_id
             WHERE c.edition_id = $1 AND b.code = $2) AS maxch,
            (SELECT max(v.verse_number) FROM bible_verses v
              JOIN bible_chapters c ON c.id = v.chapter_id
              JOIN biblical_books b ON b.id = c.book_id
             WHERE c.edition_id = $1 AND b.code = $2 AND c.chapter_number = $3) AS maxv`,
    [editionId, bookCode, chapter]
  );
  const { maxch, maxv } = rows[0];
  return (
    maxch != null && chapter >= 1 && chapter <= maxch &&
    maxv != null && verseStart >= 1 && verseEnd >= verseStart && verseEnd <= maxv
  );
}

// ─── Comentarios y respuestas (§7) ────────────────────────────────────────────

export interface CommentView {
  id: string;
  parentId: string | null;
  authorAlias: string;
  authorId: string;
  chapterNumber: number;
  verseStart: number;
  verseEnd: number;
  body: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
}

export async function listChapterComments(
  user: CurrentUser,
  bookCode: string,
  chapter: number,
  editionId: string
): Promise<CommentView[]> {
  const { rows } = await query<{
    id: string;
    parent_id: string | null;
    author_alias: string;
    author_id: string;
    chapter_number: number;
    verse_start: number;
    verse_end: number;
    body: string;
    created_at: Date;
    like_count: number;
    reply_count: number;
    liked_by_me: boolean;
  }>(
    `SELECT c.id, c.parent_id, p.alias AS author_alias, c.author_id,
            c.chapter_number, c.verse_start, c.verse_end, c.body, c.created_at,
            c.like_count, c.reply_count,
            EXISTS (SELECT 1 FROM comment_likes l WHERE l.comment_id = c.id AND l.user_id = $1) AS liked_by_me
       FROM comments c
       JOIN profiles p ON p.id = c.author_id
       JOIN biblical_books b ON b.id = c.book_id
      WHERE b.code = $2 AND c.chapter_number = $3
        AND c.edition_id = $4
        AND c.status = 'published' AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
      LIMIT 200`,
    [user.id, bookCode, chapter, editionId]
  );
  return rows.map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    authorAlias: r.author_alias,
    authorId: r.author_id,
    chapterNumber: r.chapter_number,
    verseStart: r.verse_start,
    verseEnd: r.verse_end,
    body: r.body,
    createdAt: r.created_at.toISOString(),
    likeCount: r.like_count,
    replyCount: r.reply_count,
    likedByMe: r.liked_by_me,
  }));
}

export async function createComment(user: CurrentUser, input: {
  bookCode: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  body: string;
  parentId?: string | null;
  editionId: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const body = input.body.trim();
  if (body.length < 1 || body.length > 4000) {
    return { ok: false, error: "La reflexión debe tener entre 1 y 4000 caracteres." };
  }
  if (!(await passageExists(input.bookCode, input.chapter, input.verseStart, input.verseEnd, input.editionId))) {
    return { ok: false, error: "El pasaje indicado no existe en esta edición." };
  }

  const client = await db().connect();
  try {
    await client.query("BEGIN");

    let parentAuthor: string | null = null;
    if (input.parentId) {
      const { rows: parent } = await client.query<{ author_id: string; book_id: string; chapter_number: number; parent_id: string | null }>(
        `SELECT c.author_id, c.book_id, c.chapter_number, c.parent_id
           FROM comments c JOIN biblical_books b ON b.id = c.book_id
          WHERE c.id = $1 AND c.edition_id = $2 AND b.code = $3`,
        [input.parentId, input.editionId, input.bookCode]
      );
      if (parent.length === 0) {
        await client.query("ROLLBACK");
        return { ok: false, error: "El comentario original ya no está disponible." };
      }
      if (parent[0].parent_id !== null || parent[0].chapter_number !== input.chapter) {
        await client.query("ROLLBACK");
        return { ok: false, error: "Solo se puede responder a un comentario raíz del mismo capítulo." };
      }
      parentAuthor = parent[0].author_id;
    }

    const { rows: book } = await client.query<{ id: string }>(
      "SELECT id FROM biblical_books WHERE code = $1", [input.bookCode]
    );
    const { rows: inserted } = await client.query<{ id: string }>(
      `INSERT INTO comments (author_id, parent_id, book_id, chapter_number, verse_start, verse_end, edition_id, body)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [user.id, input.parentId ?? null, book[0].id, input.chapter, input.verseStart, input.verseEnd, input.editionId, body]
    );
    const commentId = inserted[0].id;

    const rules = await activeRules();
    const isReply = input.parentId != null;
    await recordReputationEvent(client, {
      userId: user.id,
      eventType: isReply ? "reply_published" : "comment_published",
      basePoints: isReply ? rules.points_per_reply : rules.points_per_comment,
      sourceType: "comment",
      sourceId: commentId,
    });

    if (parentAuthor && parentAuthor !== user.id) {
      const { slugOf } = await import("@/bible/slug");
      await client.query(
        `INSERT INTO notifications (recipient_id, type, title, link)
         VALUES ($1, 'reply', $2, $3)`,
        [parentAuthor, `${user.alias} ha respondido a tu reflexión`,
         `/biblia/${slugOf(input.bookCode)}/${input.chapter}?v=${input.verseStart}-${input.verseEnd}`]
      );
    }

    await client.query("COMMIT");
    return { ok: true, id: commentId };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: "No se pudo publicar. Inténtalo de nuevo." };
  } finally {
    client.release();
  }
}

export async function removeOwnComment(user: CurrentUser, commentId: string) {
  await query(
    `UPDATE comments SET deleted_at = now()
      WHERE id = $1 AND author_id = $2 AND deleted_at IS NULL`,
    [commentId, user.id]
  );
}

// ─── Likes (§7.3) ─────────────────────────────────────────────────────────────

export async function toggleLike(
  user: CurrentUser,
  commentId: string
): Promise<{ ok: true; liked: boolean } | { ok: false; error: string }> {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const { rows: comment } = await client.query<{ author_id: string; status: string; deleted_at: string | null }>(
      "SELECT author_id, status, deleted_at FROM comments WHERE id = $1 FOR UPDATE",
      [commentId]
    );
    if (comment.length === 0 || comment[0].status !== "published" || comment[0].deleted_at) {
      await client.query("ROLLBACK");
      return { ok: false, error: "El comentario no está disponible." };
    }
    if (comment[0].author_id === user.id) {
      await client.query("ROLLBACK");
      return { ok: false, error: "No puedes valorar tu propia aportación." };
    }

    const { rows: existing } = await client.query(
      "SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      [commentId, user.id]
    );
    const rules = await activeRules();
    let liked: boolean;
    if (existing.length > 0) {
      await client.query("DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2", [commentId, user.id]);
      await recordReputationEvent(client, {
        userId: comment[0].author_id,
        eventType: "like_removed",
        basePoints: -rules.points_per_like_received,
        sourceType: "comment_like",
        sourceId: commentId,
        sourceUserId: user.id,
      });
      liked = false;
    } else {
      await client.query("INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)", [commentId, user.id]);
      await recordReputationEvent(client, {
        userId: comment[0].author_id,
        eventType: "like_received",
        basePoints: rules.points_per_like_received,
        sourceType: "comment_like",
        sourceId: commentId,
        sourceUserId: user.id,
      });
      liked = true;
    }
    await client.query("COMMIT");
    return { ok: true, liked };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: "No se pudo actualizar la valoración." };
  } finally {
    client.release();
  }
}

// ─── Favoritos de pasajes ─────────────────────────────────────────────────────

export interface FavoriteView {
  id: string;
  bookCode: string;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  note: string | null;
  createdAt: string;
}

export async function listFavorites(user: CurrentUser): Promise<FavoriteView[]> {
  const { rows } = await query<{
    id: string; book_code: string; book_name: string; chapter: number;
    verse_start: number; verse_end: number; note: string | null; created_at: Date;
  }>(
    `SELECT f.id, b.code AS book_code, b.name_es AS book_name, f.chapter_number AS chapter,
            f.verse_start, f.verse_end, f.note, f.created_at
       FROM passage_favorites f JOIN biblical_books b ON b.id = f.book_id
      WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
    [user.id]
  );
  return rows.map((r) => ({
    id: r.id,
    bookCode: r.book_code,
    bookName: r.book_name,
    chapter: r.chapter,
    verseStart: r.verse_start,
    verseEnd: r.verse_end,
    note: r.note,
    createdAt: r.created_at.toISOString(),
  }));
}

export async function toggleFavorite(user: CurrentUser, input: {
  bookCode: string; chapter: number; verseStart: number; verseEnd: number;
  editionId: string; note?: string;
}): Promise<{ ok: boolean; added: boolean }> {
  if (!(await passageExists(input.bookCode, input.chapter, input.verseStart, input.verseEnd, input.editionId))) {
    return { ok: false, added: false };
  }
  const { rows: book } = await query<{ id: string }>("SELECT id FROM biblical_books WHERE code = $1", [input.bookCode]);
  const { rows: existing } = await query<{ id: string }>(
    `SELECT id FROM passage_favorites
      WHERE user_id = $1 AND edition_id IS NOT DISTINCT FROM $2
        AND book_id = $3 AND chapter_number = $4 AND verse_start = $5 AND verse_end = $6`,
    [user.id, input.editionId, book[0].id, input.chapter, input.verseStart, input.verseEnd]
  );
  if (existing.length > 0) {
    await query("DELETE FROM passage_favorites WHERE id = $1", [existing[0].id]);
    return { ok: true, added: false };
  }
  await query(
    `INSERT INTO passage_favorites (user_id, book_id, chapter_number, verse_start, verse_end, edition_id, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.id, book[0].id, input.chapter, input.verseStart, input.verseEnd, input.editionId, input.note ?? null]
  );
  return { ok: true, added: true };
}

// ─── Debates (§8) ─────────────────────────────────────────────────────────────

export interface DebateView {
  id: string;
  title: string;
  mainQuestion: string;
  description: string;
  guidingQuestions: string[];
  status: string;
  publishedAt: string | null;
  contributionCount: number;
  passages: { bookCode: string; bookName: string; chapter: number; verseStart: number; verseEnd: number }[];
}

export async function listPublishedDebates(limit = 20): Promise<DebateView[]> {
  const { rows } = await query<{
    id: string; title: string; main_question: string; description: string;
    guiding_questions: string[]; status: string; published_at: Date | null;
    passages: DebateView["passages"];
  }>(
    `SELECT d.id, d.title, d.main_question, d.description, d.guiding_questions,
            d.status, d.published_at,
            COALESCE(
              (SELECT json_agg(json_build_object(
                 'bookCode', b.code, 'bookName', b.name_es,
                 'chapter', dp.chapter_number, 'verseStart', dp.verse_start, 'verseEnd', dp.verse_end)
                 ORDER BY dp.position)
               FROM debate_passages dp JOIN biblical_books b ON b.id = dp.book_id
              WHERE dp.debate_id = d.id), '[]'::json) AS passages
       FROM debates d
      WHERE d.status = 'published'
      ORDER BY d.published_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    mainQuestion: r.main_question,
    description: r.description,
    guidingQuestions: r.guiding_questions ?? [],
    status: r.status,
    publishedAt: r.published_at?.toISOString() ?? null,
    contributionCount: 0,
    passages: r.passages,
  }));
}

export async function getDebate(id: string): Promise<DebateView | null> {
  const { rows } = await query<{
    id: string; title: string; main_question: string; description: string;
    guiding_questions: string[]; status: string; published_at: Date | null;
    passages: DebateView["passages"];
  }>(
    `SELECT d.id, d.title, d.main_question, d.description, d.guiding_questions,
            d.status, d.published_at,
            COALESCE(
              (SELECT json_agg(json_build_object(
                 'bookCode', b.code, 'bookName', b.name_es,
                 'chapter', dp.chapter_number, 'verseStart', dp.verse_start, 'verseEnd', dp.verse_end)
                 ORDER BY dp.position)
               FROM debate_passages dp JOIN biblical_books b ON b.id = dp.book_id
              WHERE dp.debate_id = d.id), '[]'::json) AS passages
       FROM debates d WHERE d.id = $1 AND d.status IN ('published','archived')`,
    [id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id, title: r.title, mainQuestion: r.main_question, description: r.description,
    guidingQuestions: r.guiding_questions ?? [], status: r.status,
    publishedAt: r.published_at?.toISOString() ?? null, contributionCount: 0, passages: r.passages,
  };
}

export async function proposeDebate(user: CurrentUser, input: {
  title: string; mainQuestion: string; description: string; passages: unknown[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const title = input.title.trim();
  const question = input.mainQuestion.trim();
  const desc = input.description.trim();
  if (title.length < 5 || title.length > 200) return { ok: false, error: "El título debe tener entre 5 y 200 caracteres." };
  if (question.length < 10 || question.length > 500) return { ok: false, error: "La pregunta principal debe tener entre 10 y 500 caracteres." };
  if (desc.length < 10 || desc.length > 5000) return { ok: false, error: "La descripción debe tener entre 10 y 5000 caracteres." };
  await query(
    `INSERT INTO debate_proposals (user_id, title, main_question, description, suggested_passages)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [user.id, title, question, desc, JSON.stringify(input.passages)]
  );
  return { ok: true };
}

export async function listProposals(): Promise<{
  id: string; userAlias: string; title: string; mainQuestion: string;
  description: string; status: string; suggestedPassages: unknown[]; createdAt: string;
}[]> {
  const { rows } = await query<{
    id: string; user_alias: string; title: string; main_question: string;
    description: string; status: string; suggested_passages: unknown[]; created_at: Date;
  }>(
    `SELECT pr.id, p.alias AS user_alias, pr.title, pr.main_question, pr.description,
            pr.status, pr.suggested_passages, pr.created_at
       FROM debate_proposals pr JOIN profiles p ON p.id = pr.user_id
      ORDER BY (pr.status = 'submitted') DESC, pr.created_at DESC LIMIT 50`
  );
  return rows.map((r) => ({
    id: r.id, userAlias: r.user_alias, title: r.title, mainQuestion: r.main_question,
    description: r.description, status: r.status,
    suggestedPassages: r.suggested_passages ?? [], createdAt: r.created_at.toISOString(),
  }));
}

/** Publica un debate a partir de una propuesta aceptada (rol editor/admin). */
export async function acceptProposal(editor: CurrentUser, proposalId: string) {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const { rows: proposal } = await client.query<{
      id: string; user_id: string; title: string; main_question: string; description: string; suggested_passages: unknown[]; status: string;
    }>(
      "SELECT id, user_id, title, main_question, description, suggested_passages, status FROM debate_proposals WHERE id = $1 FOR UPDATE",
      [proposalId]
    );
    if (proposal.length === 0 || proposal[0].status !== "submitted") {
      await client.query("ROLLBACK");
      return { ok: false as const, error: "La propuesta no está pendiente." };
    }
    const pr = proposal[0];
    const { rows: debate } = await client.query<{ id: string }>(
      `INSERT INTO debates (title, main_question, description, author_id, status, published_at)
       VALUES ($1, $2, $3, $4, 'published', now()) RETURNING id`,
      [pr.title, pr.main_question, pr.description, editor.id]
    );
    const passages = Array.isArray(pr.suggested_passages) ? pr.suggested_passages : [];
    let pos = 0;
    for (const p of passages) {
      const pv = p as { bookCode?: string; chapter?: number; verseStart?: number; verseEnd?: number };
      if (!pv.bookCode || !pv.chapter || !pv.verseStart) continue;
      const { rows: book } = await client.query("SELECT id FROM biblical_books WHERE code = $1", [pv.bookCode]);
      if (book.length === 0) continue;
      pos++;
      await client.query(
        `INSERT INTO debate_passages (debate_id, book_id, chapter_number, verse_start, verse_end, position)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [debate[0].id, book[0].id, pv.chapter, pv.verseStart, pv.verseEnd ?? pv.verseStart, pos]
      );
    }
    await client.query(
      "UPDATE debate_proposals SET status = 'accepted', reviewed_by = $2, reviewed_at = now() WHERE id = $1",
      [proposalId, editor.id]
    );
    await client.query(
      `INSERT INTO notifications (recipient_id, type, title, link)
       VALUES ($1, 'proposal_status', 'Tu propuesta de debate ha sido aceptada y publicada', $2)`,
      [pr.user_id, `/debates/${debate[0].id}`]
    );
    await client.query("COMMIT");
    return { ok: true as const, debateId: debate[0].id };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false as const, error: "No se pudo publicar el debate." };
  } finally {
    client.release();
  }
}

export async function rejectProposal(editor: CurrentUser, proposalId: string, notes: string) {
  const { rows } = await query<{ user_id: string }>(
    "UPDATE debate_proposals SET status = 'rejected', reviewed_by = $2, reviewed_at = now(), editor_notes = $3 WHERE id = $1 AND status = 'submitted' RETURNING user_id",
    [proposalId, editor.id, notes]
  );
  if (rows.length > 0) {
    await query(
      `INSERT INTO notifications (recipient_id, type, title, link)
       VALUES ($1, 'proposal_status', 'Tu propuesta de debate no ha sido aceptada', '/debates')`,
      [rows[0].user_id]
    );
  }
}

export async function toggleFollow(user: CurrentUser, debateId: string): Promise<boolean> {
  const { rows: existing } = await query(
    "SELECT 1 FROM debate_follows WHERE debate_id = $1 AND user_id = $2",
    [debateId, user.id]
  );
  if (existing.length > 0) {
    await query("DELETE FROM debate_follows WHERE debate_id = $1 AND user_id = $2", [debateId, user.id]);
    return false;
  }
  await query("INSERT INTO debate_follows (debate_id, user_id) VALUES ($1, $2)", [debateId, user.id]);
  return true;
}

// ─── Intervenciones en debates ────────────────────────────────────────────────

export interface DebateCommentView {
  id: string; authorAlias: string; body: string; createdAt: string; status: string;
}

export async function listDebateComments(debateId: string): Promise<DebateCommentView[]> {
  const { rows } = await query<{
    id: string; author_alias: string; body: string; created_at: Date; status: string;
  }>(
    `SELECT dc.id, p.alias AS author_alias, dc.body, dc.created_at, dc.status
       FROM debate_comments dc JOIN profiles p ON p.id = dc.author_id
      WHERE dc.debate_id = $1 AND dc.status = 'published'
      ORDER BY dc.created_at ASC LIMIT 300`,
    [debateId]
  );
  return rows.map((r) => ({
    id: r.id, authorAlias: r.author_alias, body: r.body,
    createdAt: r.created_at.toISOString(), status: r.status,
  }));
}

export async function createDebateComment(user: CurrentUser, debateId: string, body: string) {
  const clean = body.trim();
  if (clean.length < 1 || clean.length > 4000) return { ok: false as const, error: "La intervención debe tener entre 1 y 4000 caracteres." };
  const { rows: debate } = await query<{ id: string; title: string }>(
    "SELECT id, title FROM debates WHERE id = $1 AND status = 'published'", [debateId]
  );
  if (debate.length === 0) return { ok: false as const, error: "El debate no está abierto." };
  await query(
    "INSERT INTO debate_comments (debate_id, author_id, body) VALUES ($1, $2, $3)",
    [debateId, user.id, clean]
  );
  // Notificar a quienes siguen el debate (§14), salvo al propio autor.
  await query(
    `INSERT INTO notifications (recipient_id, type, title, link)
     SELECT f.user_id, 'debate_activity', $2, $3
       FROM debate_follows f WHERE f.debate_id = $1 AND f.user_id <> $4`,
    [debateId, `Nueva intervención en el debate «${debate[0].title}»`, `/debates/${debateId}`, user.id]
  );
  return { ok: true as const };
}

// ─── Actividad y participantes (§9) ───────────────────────────────────────────

export interface RecentCommentView {
  id: string; authorAlias: string; bookCode: string; bookName: string;
  chapter: number; verseStart: number; verseEnd: number; excerpt: string; createdAt: string;
}

export async function recentComments(limit = 20): Promise<RecentCommentView[]> {
  const { rows } = await query<{
    id: string; alias: string; code: string; name: string; chapter: number;
    verse_start: number; verse_end: number; body: string; created_at: Date;
  }>(
    `SELECT c.id, p.alias, b.code, b.name_es AS name, c.chapter_number AS chapter,
            c.verse_start, c.verse_end, c.body, c.created_at
       FROM comments c
       JOIN profiles p ON p.id = c.author_id
       JOIN biblical_books b ON b.id = c.book_id
      WHERE c.status = 'published' AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id, authorAlias: r.alias, bookCode: r.code, bookName: r.name,
    chapter: r.chapter, verseStart: r.verse_start, verseEnd: r.verse_end,
    excerpt: r.body.slice(0, 160), createdAt: r.created_at.toISOString(),
  }));
}

export async function recognizedParticipants(limit = 6) {
  const { rows } = await query<{ alias: string; total: number; level: string }>(
    `SELECT p.alias, COALESCE(SUM(re.points_delta), 0)::int AS total,
            COALESCE((SELECT l.name FROM user_recognitions ur
                       JOIN recognition_levels l ON l.id = ur.level_id
                      WHERE ur.user_id = p.id
                      ORDER BY l.min_points DESC LIMIT 1), 'Explorador') AS level
       FROM profiles p
       JOIN reputation_events re ON re.user_id = p.id
      WHERE p.is_suspended = false
      GROUP BY p.alias
      ORDER BY total DESC, max(re.created_at) DESC
      LIMIT $1`,
    [limit]
  );
  return rows;
}

/** Historial de aportaciones propias (§4.4: visible en Mi espacio). */
export async function listMyComments(user: CurrentUser): Promise<RecentCommentView[]> {
  const { rows } = await query<{
    id: string; code: string; name: string; chapter: number;
    verse_start: number; verse_end: number; body: string; created_at: Date;
    deleted_at: Date | null;
  }>(
    `SELECT c.id, b.code, b.name_es AS name, c.chapter_number AS chapter,
            c.verse_start, c.verse_end, c.body, c.created_at, c.deleted_at
       FROM comments c JOIN biblical_books b ON b.id = c.book_id
      WHERE c.author_id = $1
      ORDER BY c.created_at DESC LIMIT 50`,
    [user.id]
  );
  return rows.map((r) => ({
    id: r.id, authorAlias: user.alias, bookCode: r.code, bookName: r.name,
    chapter: r.chapter, verseStart: r.verse_start, verseEnd: r.verse_end,
    excerpt: r.body.slice(0, 160), createdAt: r.created_at.toISOString(),
  }));
}

// ─── Notificaciones (§14) ─────────────────────────────────────────────────────

export interface NotificationView {
  id: string; type: string; title: string; link: string | null; readAt: string | null; createdAt: string;
}

export async function listNotifications(user: CurrentUser, limit = 30): Promise<NotificationView[]> {
  const { rows } = await query<{
    id: string; type: string; title: string; link: string | null; read_at: string | null; created_at: Date;
  }>(
    `SELECT id, type, title, link, read_at, created_at
       FROM notifications WHERE recipient_id = $1
      ORDER BY created_at DESC LIMIT $2`,
    [user.id, limit]
  );
  return rows.map((r) => ({
    id: r.id, type: r.type, title: r.title, link: r.link,
    readAt: r.read_at ? new Date(r.read_at).toISOString() : null,
    createdAt: r.created_at.toISOString(),
  }));
}

export async function markAllNotificationsRead(user: CurrentUser) {
  await query("UPDATE notifications SET read_at = now() WHERE recipient_id = $1 AND read_at IS NULL", [user.id]);
}
