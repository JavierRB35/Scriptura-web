// Servicio de moderación (solo servidor, Fase 4, §11, §15.3, §16.5):
// denuncias → cola → caso → medidas proporcionales → apelaciones.
// Toda actuación queda registrada con justificación y en audit_events (§11.3).

import "server-only";
import { query, db } from "@/shared/db";
import type { CurrentUser } from "@/auth/session";

type pgClient = import("pg").PoolClient;

/** Registro de auditoría técnico (§16.8): complementa audit_events de esquema. */
async function audit(client: pgClient, actor: string, action: string, entityType: string, entityId: string, details?: unknown) {
  await client.query(
    `INSERT INTO audit_events (actor, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actor, action, entityType, entityId, details ? JSON.stringify(details) : null]
  );
}

// ─── Denuncias (§11.2) ────────────────────────────────────────────────────────

export type ReportReason =
  | "insult" | "harassment" | "threat" | "spam" | "impersonation"
  | "reputation_manipulation" | "private_info" | "abuse" | "other";

const REPORT_REASONS: ReadonlySet<string> = new Set([
  "insult", "harassment", "threat", "spam", "impersonation",
  "reputation_manipulation", "private_info", "abuse", "other",
]);
const REPORT_TARGETS: ReadonlySet<string> = new Set([
  "comment", "debate_comment", "debate", "profile",
]);

export async function createReport(reporter: CurrentUser, input: {
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!REPORT_TARGETS.has(input.targetType)) return { ok: false, error: "Tipo de contenido no válido." };
  if (!REPORT_REASONS.has(input.reason)) return { ok: false, error: "Motivo no válido." };

  // No denunciar dos veces lo mismo (único por denunciante/objetivo abierto).
  const { rows: dup } = await query(
    `SELECT 1 FROM content_reports
      WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3 AND status = 'open'`,
    [reporter.id, input.targetType, input.targetId]
  );
  if (dup.length > 0) {
    return { ok: false, error: "Ya has denunciado este contenido; está pendiente de revisión." };
  }

  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO content_reports (reporter_id, target_type, target_id, reason, details)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [reporter.id, input.targetType, input.targetId, input.reason, input.details?.trim() || null]
    );
    await audit(client, reporter.id, "report_created", input.targetType, input.targetId, { reason: input.reason });
    await client.query("COMMIT");
    return { ok: true, id: rows[0].id };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: "No se pudo registrar la denuncia." };
  } finally {
    client.release();
  }
}

export interface ReportView {
  id: string;
  reporterAlias: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  createdAt: string;
  excerpt: string | null;
  authorAlias: string | null;
}

/** Contexto del contenido denunciado, sin exponer datos de más (§11.3). */
async function targetContext(targetType: string, targetId: string): Promise<{ excerpt: string | null; authorAlias: string | null }> {
  if (targetType === "comment") {
    const { rows } = await query<{ body: string; alias: string }>(
      `SELECT c.body, p.alias FROM comments c JOIN profiles p ON p.id = c.author_id WHERE c.id = $1`,
      [targetId]
    );
    if (rows.length === 0) return { excerpt: null, authorAlias: null };
    return { excerpt: rows[0].body.slice(0, 200), authorAlias: rows[0].alias };
  }
  if (targetType === "debate_comment") {
    const { rows } = await query<{ body: string; alias: string }>(
      `SELECT dc.body, p.alias FROM debate_comments dc JOIN profiles p ON p.id = dc.author_id WHERE dc.id = $1`,
      [targetId]
    );
    if (rows.length === 0) return { excerpt: null, authorAlias: null };
    return { excerpt: rows[0].body.slice(0, 200), authorAlias: rows[0].alias };
  }
  if (targetType === "debate") {
    const { rows } = await query<{ description: string; alias: string }>(
      `SELECT d.description, p.alias FROM debates d JOIN profiles p ON p.id = d.author_id WHERE d.id = $1`,
      [targetId]
    );
    if (rows.length === 0) return { excerpt: null, authorAlias: null };
    return { excerpt: rows[0].description.slice(0, 200), authorAlias: rows[0].alias };
  }
  return { excerpt: null, authorAlias: null };
}

export async function listOpenReports(limit = 30): Promise<ReportView[]> {
  const { rows } = await query<{
    id: string; alias: string; target_type: string; target_id: string;
    reason: string; details: string | null; created_at: Date;
  }>(
    `SELECT r.id, p.alias, r.target_type, r.target_id, r.reason, r.details, r.created_at
       FROM content_reports r JOIN profiles p ON p.id = r.reporter_id
      WHERE r.status = 'open'
      ORDER BY r.created_at ASC LIMIT $1`,
    [limit]
  );
  const views: ReportView[] = [];
  for (const r of rows) {
    const ctx = await targetContext(r.target_type, r.target_id);
    views.push({
      id: r.id, reporterAlias: r.alias, targetType: r.target_type,
      targetId: r.target_id, reason: r.reason, details: r.details,
      createdAt: r.created_at.toISOString(), excerpt: ctx.excerpt, authorAlias: ctx.authorAlias,
    });
  }
  return views;
}

// ─── Casos y medidas (§11.2, §11.3) ───────────────────────────────────────────

export type ModerationActionType = "hide" | "restore" | "restrict" | "warn" | "escalate";

/**
 * Tramita una denuncia: abre (o reutiliza) el caso, aplica la medida elegida y
 * registra todo. Las medidas sobre contenido ocultan/restauran el objetivo;
 * «restrict» crea una restricción temporal del autor.
 */
export async function resolveReport(moderator: CurrentUser, input: {
  reportId: string;
  action: ModerationActionType;
  justification: string;
  restrictionDays?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const justification = input.justification.trim();
  if (justification.length < 10) {
    return { ok: false, error: "La justificación es obligatoria (mínimo 10 caracteres)." };
  }
  const days = input.restrictionDays ?? 0;
  if (input.action === "restrict" && (days < 1 || days > 90)) {
    return { ok: false, error: "La restricción temporal debe ser de 1 a 90 días." };
  }

  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const { rows: report } = await client.query<{
      id: string; target_type: string; target_id: string; status: string;
    }>(
      "SELECT id, target_type, target_id, status FROM content_reports WHERE id = $1 FOR UPDATE",
      [input.reportId]
    );
    if (report.length === 0 || report[0].status !== "open") {
      await client.query("ROLLBACK");
      return { ok: false, error: "La denuncia ya no está abierta." };
    }
    const rep = report[0];

    // Caso: reutilizar uno abierto para el mismo objetivo o crear uno nuevo.
    let caseId: string;
    const { rows: openCase } = await client.query<{ id: string }>(
      `SELECT id FROM moderation_cases WHERE status IN ('open','under_review') LIMIT 1 FOR UPDATE SKIP LOCKED`
    );
    if (openCase.length > 0) {
      caseId = openCase[0].id;
      await client.query("UPDATE moderation_cases SET status = 'under_review' WHERE id = $1", [caseId]);
    } else {
      const { rows: newCase } = await client.query<{ id: string }>(
        `INSERT INTO moderation_cases (report_id, status, severity, assigned_to)
         VALUES ($1, 'under_review', $2, $3) RETURNING id`,
        [rep.id, input.action === "restrict" ? "high" : "medium", moderator.id]
      );
      caseId = newCase[0].id;
    }

    const authorOfTarget = async (): Promise<string | null> => {
      if (rep.target_type === "comment") {
        const { rows } = await client.query<{ author_id: string }>("SELECT author_id FROM comments WHERE id = $1", [rep.target_id]);
        return rows[0]?.author_id ?? null;
      }
      if (rep.target_type === "debate_comment") {
        const { rows } = await client.query<{ author_id: string }>("SELECT author_id FROM debate_comments WHERE id = $1", [rep.target_id]);
        return rows[0]?.author_id ?? null;
      }
      if (rep.target_type === "debate") {
        const { rows } = await client.query<{ author_id: string }>("SELECT author_id FROM debates WHERE id = $1", [rep.target_id]);
        return rows[0]?.author_id ?? null;
      }
      return null;
    };

    const targetAuthor = await authorOfTarget();

    // Aplicar la medida al contenido (§11.3: ocultar/restaurar).
    if (rep.target_type === "comment") {
      if (input.action === "hide") {
        await client.query(
          "UPDATE comments SET status = 'hidden', moderation_reason = $2 WHERE id = $1",
          [rep.target_id, justification]
        );
      } else if (input.action === "restore") {
        await client.query(
          "UPDATE comments SET status = 'published', moderation_reason = NULL WHERE id = $1",
          [rep.target_id]
        );
      }
    } else if (rep.target_type === "debate_comment") {
      if (input.action === "hide") {
        await client.query(
          "UPDATE debate_comments SET status = 'hidden', updated_at = now() WHERE id = $1",
          [rep.target_id]
        );
      } else if (input.action === "restore") {
        await client.query(
          "UPDATE debate_comments SET status = 'published' WHERE id = $1",
          [rep.target_id]
        );
      }
    }

    // Medida sobre la persona: restricción temporal con registro (§11.2).
    if (input.action === "restrict" && targetAuthor) {
      await client.query(
        `INSERT INTO user_restrictions (user_id, restriction_type, reason, ends_at, created_by)
         VALUES ($1, 'muted', $2, now() + make_interval(days => $3), $4)`,
        [targetAuthor, justification, days, moderator.id]
      );
    }

    await client.query(
      `INSERT INTO moderation_actions (case_id, action_type, justification, performed_by)
       VALUES ($1, $2, $3, $4)`,
      [caseId, input.action, justification, moderator.id]
    );

    await client.query(
      "UPDATE content_reports SET status = 'resolved', handled_by = $2, handled_at = now(), resolution = $3 WHERE id = $1",
      [rep.id, moderator.id, `${input.action}: ${justification}`]
    );

    // Cerrar el caso si no quedan más medidas pendientes para este objetivo.
    await client.query(
      "UPDATE moderation_cases SET status = 'actioned', closed_at = now() WHERE id = $1 AND report_id = $2",
      [caseId, rep.id]
    );

    // Aviso al autor del contenido moderado (medida proporcional y avisada).
    if (targetAuthor && (input.action === "hide" || input.action === "restrict")) {
      await client.query(
        `INSERT INTO notifications (recipient_id, type, title, link)
         VALUES ($1, 'admin', $2, '/apelar')`,
        [targetAuthor, "Se ha aplicado una medida de moderación a una de tus aportaciones"]
      );
    }

    await audit(client, moderator.id, `moderation_${input.action}`, rep.target_type, rep.target_id, {
      caseId, justification,
    });
    await client.query("COMMIT");
    return { ok: true };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: "No se pudo tramitar la denuncia." };
  } finally {
    client.release();
  }
}

/** Descarta una denuncia sin medida (contenido revisado, no procede). */
export async function dismissReport(moderator: CurrentUser, reportId: string, justification: string) {
  const clean = justification.trim();
  if (clean.length < 10) return { ok: false as const, error: "La justificación es obligatoria (mínimo 10 caracteres)." };
  const { rows } = await query<{ id: string }>(
    `UPDATE content_reports
        SET status = 'dismissed', handled_by = $2, handled_at = now(), resolution = $3
      WHERE id = $1 AND status = 'open' RETURNING id`,
    [reportId, moderator.id, `dismissed: ${clean}`]
  );
  if (rows.length === 0) return { ok: false as const, error: "La denuncia ya no está abierta." };
  await query(
    `INSERT INTO audit_events (actor, action, entity_type, entity_id, details)
     VALUES ($1, 'report_dismissed', 'content_report', $2, $3::jsonb)`,
    [moderator.id, reportId, JSON.stringify({ justification: clean })]
  );
  return { ok: true as const };
}

// ─── Sanciones activas de un usuario (consultable en servidor) ────────────────

export async function activeRestriction(userId: string): Promise<{ type: string; endsAt: Date | null } | null> {
  const { rows } = await query<{ restriction_type: string; ends_at: Date | null }>(
    `SELECT restriction_type, ends_at FROM user_restrictions
      WHERE user_id = $1 AND active AND (ends_at IS NULL OR ends_at > now())
      ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows.length > 0 ? { type: rows[0].restriction_type, endsAt: rows[0].ends_at } : null;
}

// ─── Apelaciones (§11.2) ──────────────────────────────────────────────────────

export async function fileAppeal(user: CurrentUser, statement: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = statement.trim();
  if (clean.length < 10 || clean.length > 4000) {
    return { ok: false, error: "La apelación debe tener entre 10 y 4000 caracteres." };
  }
  // Debe existir al menos una medida reciente sobre aportaciones suyas o una
  // restricción activa (§11.2: apelación tras medida).
  const { rows: moderated } = await query<{ id: string }>(
    `SELECT mc.id
       FROM moderation_cases mc
       JOIN moderation_actions ma ON ma.case_id = mc.id
      WHERE mc.status IN ('actioned','closed')
        AND ma.action_type IN ('hide','restrict')
        AND ma.created_at >= now() - interval '30 days'
        AND EXISTS (
          SELECT 1 FROM comments c
           WHERE c.author_id = $1
             AND c.moderation_reason IS NOT NULL
             AND c.created_at <= ma.created_at + interval '1 day'
        )
      ORDER BY ma.created_at DESC LIMIT 1`,
    [user.id]
  );
  const restriction = await activeRestriction(user.id);
  if (moderated.length === 0 && !restriction) {
    return { ok: false, error: "No constan medidas moderables recientes sobre tu cuenta." };
  }

  const client = await db().connect();
  try {
    await client.query("BEGIN");
    let caseId: string;
    if (moderated.length > 0) {
      caseId = moderated[0].id;
    } else {
      // Restricción sin caso vinculado: caso de oficio.
      const { rows: newCase } = await client.query<{ id: string }>(
        `INSERT INTO moderation_cases (status, severity, assigned_to, notes)
         VALUES ('actioned', 'low', NULL, $1::jsonb) RETURNING id`,
        [JSON.stringify([{ oficio: true, userId: user.id }])]
      );
      caseId = newCase[0].id;
    }
    const { rows: appeal } = await client.query<{ id: string }>(
      "INSERT INTO appeals (case_id, user_id, statement) VALUES ($1, $2, $3) RETURNING id",
      [caseId, user.id, clean]
    );
    await audit(client, user.id, "appeal_filed", "appeal", appeal[0].id);
    await client.query("COMMIT");
    return { ok: true };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: "No se pudo registrar la apelación." };
  } finally {
    client.release();
  }
}

export interface AppealView {
  id: string;
  userAlias: string;
  statement: string;
  status: string;
  createdAt: string;
  decisionReason: string | null;
}

export async function listOpenAppeals(limit = 30): Promise<AppealView[]> {
  const { rows } = await query<{
    id: string; alias: string; statement: string; status: string; created_at: Date; decision_reason: string | null;
  }>(
    `SELECT a.id, p.alias, a.statement, a.status, a.created_at, a.decision_reason
       FROM appeals a JOIN profiles p ON p.id = a.user_id
      WHERE a.status IN ('submitted','under_review')
      ORDER BY a.created_at ASC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id, userAlias: r.alias, statement: r.statement, status: r.status,
    createdAt: r.created_at.toISOString(), decisionReason: r.decision_reason,
  }));
}

/** Resuelve una apelación: mantener (upheld) o revocar (overturned). */
export async function decideAppeal(moderator: CurrentUser, input: {
  appealId: string;
  uphold: boolean;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const reason = input.reason.trim();
  if (reason.length < 10) return { ok: false, error: "El motivo de la decisión es obligatorio (mínimo 10 caracteres)." };

  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const { rows: appeal } = await client.query<{ id: string; user_id: string; case_id: string; status: string }>(
      "SELECT id, user_id, case_id, status FROM appeals WHERE id = $1 FOR UPDATE",
      [input.appealId]
    );
    if (appeal.length === 0 || (appeal[0].status !== "submitted" && appeal[0].status !== "under_review")) {
      await client.query("ROLLBACK");
      return { ok: false, error: "La apelación ya está resuelta." };
    }

    await client.query(
      `UPDATE appeals SET status = $2, decided_by = $3, decided_at = now(), decision_reason = $4 WHERE id = $1`,
      [input.appealId, input.uphold ? "upheld" : "overturned", moderator.id, reason]
    );

    if (!input.uphold) {
      // Revocar: restaurar contenido oculto del autor y levantar restricciones.
      await client.query(
        `UPDATE comments SET status = 'published', moderation_reason = NULL
          WHERE author_id = $1 AND status = 'hidden'`,
        [appeal[0].user_id]
      );
      await client.query(
        `UPDATE debate_comments SET status = 'published' WHERE author_id = $1 AND status = 'hidden'`,
        [appeal[0].user_id]
      );
      await client.query(
        "UPDATE user_restrictions SET active = false WHERE user_id = $1 AND active",
        [appeal[0].user_id]
      );
    }

    await client.query(
      `INSERT INTO notifications (recipient_id, type, title, link)
       VALUES ($1, 'admin', $2, '/mi-espacio')`,
      [
        appeal[0].user_id,
        input.uphold
          ? "Tu apelación ha sido revisada: la medida se mantiene"
          : "Tu apelación ha sido estimada: la medida queda revocada",
      ]
    );
    await audit(client, moderator.id, input.uphold ? "appeal_upheld" : "appeal_overturned", "appeal", input.appealId, { reason });
    await client.query("COMMIT");
    return { ok: true };
  } catch {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: "No se pudo resolver la apelación." };
  } finally {
    client.release();
  }
}

// ─── Métricas administrativas reales (§15.4) ─────────────────────────────────

export interface AdminMetrics {
  users: number;
  comments: number;
  replies: number;
  debates: number;
  openReports: number;
  openAppeals: number;
  activeRestrictions: number;
  subscriptions: number;
  aiEvents: number;
  emailJobs: { sent: number; failed: number; pending: number };
}

export async function adminMetrics(): Promise<AdminMetrics> {
  const { rows } = await query<{
    users: number; comments: number; replies: number; debates: number;
    open_reports: number; open_appeals: number; active_restrictions: number;
    subscriptions: number; ai_events: number;
    email_sent: number; email_failed: number; email_pending: number;
  }>(
    `SELECT
       (SELECT count(*)::int FROM profiles) AS users,
       (SELECT count(*)::int FROM comments WHERE parent_id IS NULL AND deleted_at IS NULL AND status = 'published') AS comments,
       (SELECT count(*)::int FROM comments WHERE parent_id IS NOT NULL AND deleted_at IS NULL AND status = 'published') AS replies,
       (SELECT count(*)::int FROM debates WHERE status = 'published') AS debates,
       (SELECT count(*)::int FROM content_reports WHERE status = 'open') AS open_reports,
       (SELECT count(*)::int FROM appeals WHERE status IN ('submitted','under_review')) AS open_appeals,
       (SELECT count(*)::int FROM user_restrictions WHERE active AND (ends_at IS NULL OR ends_at > now())) AS active_restrictions,
       (SELECT count(*)::int FROM email_subscriptions WHERE status = 'confirmed') AS subscriptions,
       (SELECT count(*)::int FROM ai_usage_events) AS ai_events,
       (SELECT count(*)::int FROM daily_email_jobs WHERE status = 'sent') AS email_sent,
       (SELECT count(*)::int FROM daily_email_jobs WHERE status = 'failed') AS email_failed,
       (SELECT count(*)::int FROM daily_email_jobs WHERE status IN ('pending','processing')) AS email_pending`
  );
  const r = rows[0];
  return {
    users: r.users, comments: r.comments, replies: r.replies, debates: r.debates,
    openReports: r.open_reports, openAppeals: r.open_appeals,
    activeRestrictions: r.active_restrictions, subscriptions: r.subscriptions,
    aiEvents: r.ai_events,
    emailJobs: { sent: r.email_sent, failed: r.email_failed, pending: r.email_pending },
  };
}

/** Últimos eventos de auditoría para la vista admin (§15.1). */
export async function recentAuditEvents(limit = 15) {
  const { rows } = await query<{
    id: number; action: string; entity_type: string | null; entity_id: string | null; created_at: Date; actor_alias: string | null;
  }>(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at, p.alias AS actor_alias
       FROM audit_events a LEFT JOIN profiles p ON p.id = a.actor
      ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id, action: r.action, entityType: r.entity_type, entityId: r.entity_id,
    createdAt: r.created_at.toISOString(), actorAlias: r.actor_alias,
  }));
}
