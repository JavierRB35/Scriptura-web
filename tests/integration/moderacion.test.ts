// Pruebas de integración de moderación (Fase 4) contra PostgreSQL real:
// denuncia → medida → apelación → decisión, con auditoría y métricas.
// El servicio confía en que la capa de acciones verificó roles; aquí se
// prueban las reglas de negocio contra la base real.

import { beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { createReport, resolveReport, dismissReport, fileAppeal, decideAppeal, activeRestriction, adminMetrics, recentAuditEvents, listOpenAppeals } from "@/moderation/service";
import type { CurrentUser } from "@/auth/session";

const DATABASE_URL = process.env.DATABASE_URL;
const d = describe.skipIf(!DATABASE_URL);

let client: pg.Client;
let editionId: string;
let autora: CurrentUser; // publica el contenido denunciado
let moderador: CurrentUser; // tramita
let denunciante: CurrentUser;

function asUser(id: string, alias: string, roles: CurrentUser["roles"]): CurrentUser {
  return { id, email: null, alias, historyPublic: false, avatarUrl: null, joinedAt: new Date(), roles };
}

async function newUser(prefix: string) {
  const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@scriptura.test`;
  const { rows } = await client.query("INSERT INTO auth.users (email) VALUES ($1) RETURNING id", [email]);
  const { rows: p } = await client.query("SELECT alias FROM profiles WHERE id = $1", [rows[0].id]);
  return { id: rows[0].id as string, alias: p[0].alias as string };
}

beforeAll(async () => {
  client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  const { rows: ed } = await client.query("SELECT id FROM bible_editions WHERE identifier = 'spaRV1909'");
  editionId = ed[0].id;
  const a = await newUser("mautor");
  const m = await newUser("mmod");
  const r = await newUser("mden");
  autora = asUser(a.id, a.alias, []);
  moderador = asUser(m.id, m.alias, ["moderator"]);
  denunciante = asUser(r.id, r.alias, []);
});

d("flujo de denuncia y medida (§11)", () => {
  let commentId: string;
  let reportId: string;

  it("publica contenido y registra la denuncia sin duplicados del mismo denunciante", async () => {
    const { rows } = await client.query(
      `INSERT INTO comments (author_id, book_id, chapter_number, verse_start, verse_end, edition_id, body)
       SELECT $1, b.id, 1, 1, 1, $2, 'Comentario inapropiado de prueba'
        FROM biblical_books b WHERE b.code = 'Gn' RETURNING id`,
      [autora.id, editionId]
    );
    commentId = rows[0].id;

    const first = await createReport(denunciante, { targetType: "comment", targetId: commentId, reason: "insult" });
    expect(first.ok).toBe(true);
    reportId = (first as { ok: true; id: string }).id;

    const dup = await createReport(denunciante, { targetType: "comment", targetId: commentId, reason: "spam" });
    expect(dup.ok).toBe(false); // ya hay una abierta del mismo denunciante
    const bad = await createReport(denunciante, { targetType: "comment", targetId: commentId, reason: "motivo-inventado" });
    expect(bad.ok).toBe(false); // motivo fuera del catálogo
  });

  it("oculta con justificación, cierra la denuncia y audita; sin justificación corta rechaza", async () => {
    const short = await resolveReport(moderador, { reportId, action: "hide", justification: "no" });
    expect(short.ok).toBe(false);

    const res = await resolveReport(moderador, { reportId, action: "hide", justification: "Contenido insultoso verificado en contexto" });
    expect(res.ok).toBe(true);

    const { rows: c } = await client.query("SELECT status, moderation_reason FROM comments WHERE id = $1", [commentId]);
    expect(c[0].status).toBe("hidden");
    expect(c[0].moderation_reason).toContain("insultoso");

    const { rows: rep } = await client.query("SELECT status, handled_by FROM content_reports WHERE id = $1", [reportId]);
    expect(rep[0].status).toBe("resolved");
    expect(rep[0].handled_by).toBe(moderador.id);

    const { rows: acts } = await client.query(
      "SELECT action_type, justification FROM moderation_actions ORDER BY created_at DESC LIMIT 1"
    );
    expect(acts[0].action_type).toBe("hide");
    const { rows: audits } = await client.query(
      "SELECT action FROM audit_events WHERE entity_id = $1 AND action LIKE 'moderation_%'",
      [commentId]
    );
    expect(audits.length).toBeGreaterThanOrEqual(1);
  });

  it("el contenido oculto no es visible para otros miembros (política 0012)", async () => {
    const c = new pg.Client({ connectionString: DATABASE_URL });
    await c.connect();
    const claims = JSON.stringify({ sub: denunciante.id, role: "authenticated" });
    await c.query("BEGIN");
    await c.query("SET LOCAL ROLE authenticated");
    await c.query("SELECT set_config('request.jwt.claims', $1, true)", [claims]);
    const { rows } = await c.query("SELECT count(*)::int AS n FROM comments WHERE id = $1", [commentId]);
    expect(rows[0].n).toBe(0); // el autor ajeno no ve el oculto
    await c.query("ROLLBACK");
    // la autora SÍ ve el suyo (política: status published OR propio)
    const claims2 = JSON.stringify({ sub: autora.id, role: "authenticated" });
    await c.query("BEGIN");
    await c.query("SET LOCAL ROLE authenticated");
    await c.query("SELECT set_config('request.jwt.claims', $1, true)", [claims2]);
    const { rows: own } = await c.query("SELECT count(*)::int AS n FROM comments WHERE id = $1", [commentId]);
    expect(own[0].n).toBe(1);
    await c.query("ROLLBACK");
    await c.end();
  });

  it("restricción temporal: crea registro activo con fecha de fin y aviso", async () => {
    const { rows: rep } = await client.query(
      `INSERT INTO content_reports (reporter_id, target_type, target_id, reason)
       VALUES ($1, 'comment', $2, 'harassment') RETURNING id`,
      [denunciante.id, commentId]
    );
    const res = await resolveReport(moderador, {
      reportId: rep[0].id,
      action: "restrict",
      justification: "Reiteración tras ocultación previa del mismo contenido",
      restrictionDays: 7,
    });
    expect(res.ok).toBe(true);

    const restriction = await activeRestriction(autora.id);
    expect(restriction).not.toBeNull();
    expect(restriction?.type).toBe("muted");
    expect(restriction?.endsAt).not.toBeNull();
    const { rows: notif } = await client.query(
      "SELECT count(*)::int AS n FROM notifications WHERE recipient_id = $1 AND type = 'admin'",
      [autora.id]
    );
    expect(notif[0].n).toBeGreaterThanOrEqual(1);
  });

  it("apelación: exigida tras medida; estimada revoca contenido y restricción; desestimada mantiene", async () => {
    const weak = await fileAppeal(autora, "corta");
    expect(weak.ok).toBe(false);

    const filed = await fileAppeal(autora, "Creo que el comentario no insultaba a nadie y el contexto es de estudio.");
    expect(filed.ok).toBe(true);

    const { rows: appeals } = await client.query(
      "SELECT id, status FROM appeals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [autora.id]
    );
    expect(appeals[0].status).toBe("submitted");
    const openList = await listOpenAppeals();
    expect(openList.some((a) => a.id === appeals[0].id)).toBe(true);

    // decisión sin motivo suficiente rechaza
    const noReason = await decideAppeal(moderador, { appealId: appeals[0].id, uphold: false, reason: "ok" });
    expect(noReason.ok).toBe(false);

    // estimada → restaura y levanta restricción
    const overturned = await decideAppeal(moderador, {
      appealId: appeals[0].id,
      uphold: false,
      reason: "Revisado el contexto completo, el comentario no incumple las normas",
    });
    expect(overturned.ok).toBe(true);

    const { rows: c } = await client.query("SELECT status FROM comments WHERE id = $1", [commentId]);
    expect(c[0].status).toBe("published");
    const restriction = await activeRestriction(autora.id);
    expect(restriction).toBeNull();

    // segunda apelación sobre el mismo caso ya resuelto: nueva medida para probar desestimación
    const { rows: rep2 } = await client.query(
      `INSERT INTO content_reports (reporter_id, target_type, target_id, reason)
       VALUES ($1, 'comment', $2, 'spam') RETURNING id`,
      [denunciante.id, commentId]
    );
    await resolveReport(moderador, { reportId: rep2[0].id, action: "hide", justification: "Reincidencia confirmada de spam en pasajes" });
    const filed2 = await fileAppeal(autora, "Solicito revisión de esta segunda medida sobre el mismo comentario.");
    expect(filed2.ok).toBe(true);
    const { rows: ap2 } = await client.query(
      "SELECT id FROM appeals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [autora.id]
    );
    const upheld = await decideAppeal(moderador, {
      appealId: ap2[0].id,
      uphold: true,
      reason: "La reincidencia está acreditada; la medida se mantiene",
    });
    expect(upheld.ok).toBe(true);
    const { rows: c2 } = await client.query("SELECT status FROM comments WHERE id = $1", [commentId]);
    expect(c2[0].status).toBe("hidden");

    void openList;
  });

  it("descartar denuncia exige justificación y registra en auditoría", async () => {
    const { rows: rep } = await client.query(
      `INSERT INTO content_reports (reporter_id, target_type, target_id, reason)
       VALUES ($1, 'debate', $2, 'other') RETURNING id`,
      [denunciante.id, commentId]
    );
    const noJust = await dismissReport(moderador, rep[0].id, "corto");
    expect(noJust.ok).toBe(false);
    const ok = await dismissReport(moderador, rep[0].id, "El debate denunciado cumple las normas editoriales");
    expect(ok.ok).toBe(true);
    const { rows: audits } = await client.query(
      "SELECT action FROM audit_events WHERE action = 'report_dismissed' AND entity_id = $1",
      [rep[0].id]
    );
    expect(audits.length).toBe(1);
  });

  it("métricas admin reflejan datos reales y auditoría reciente funciona", async () => {
    const metrics = await adminMetrics();
    expect(metrics.users).toBeGreaterThanOrEqual(3);
    expect(metrics.openReports).toBe(0); // todas tramitadas/descartadas en este fichero
    expect(metrics.activeRestrictions).toBe(0); // ninguna activa al final
    const audit = await recentAuditEvents(10);
    expect(audit.length).toBeGreaterThan(0);
    expect(audit[0].action).toBeDefined();
  });

  it("limpieza de usuarios del fichero", async () => {
    const ids = [autora.id, moderador.id, denunciante.id];
    // performed_by/created_by son RESTRICT: borrar primero los artefactos de
    // moderación vinculados a estos usuarios de prueba.
    await client.query("DELETE FROM moderation_actions WHERE performed_by = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM user_restrictions WHERE user_id = ANY($1::uuid[]) OR created_by = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM appeals WHERE user_id = ANY($1::uuid[]) OR decided_by = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM moderation_cases WHERE assigned_to = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM content_reports WHERE reporter_id = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM audit_events WHERE actor = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM notifications WHERE recipient_id = ANY($1::uuid[])", [ids]);
    await client.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [ids]);
    const { rows } = await client.query(
      "SELECT count(*)::int AS n FROM profiles WHERE id = ANY($1::uuid[])",
      [ids]
    );
    expect(rows[0].n).toBe(0);
  });
});
