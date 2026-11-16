// Pruebas de integración de lecturas diarias (Fase 6, §13): doble opt-in,
// cola idempotente, envío con proveedor falso, omisión honesta sin lecturas
// editoriales y baja por token.

import { beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { subscribe, confirmSubscription, unsubscribeByToken, getUnsubscribeToken, enqueueForLocalDate, processPendingJobs, loadDayReadings, renderDailyEmail } from "@/email/service";
import type { EmailProvider } from "@/email/provider";

const DATABASE_URL = process.env.DATABASE_URL;
const d = describe.skipIf(!DATABASE_URL);

let client: pg.Client;
const TOKEN_EMAILS: { email: string; url: string }[] = [];

// Proveedor falso (solo pruebas): registra los envíos, nunca en producción.
function fakeProvider(failFirst = false): EmailProvider & { sent: { to: string; subject: string }[] } {
  const sent: { to: string; subject: string }[] = [];
  return {
    name: "fake",
    sent,
    async send(email) {
      if (failFirst && sent.length === 0) throw new Error("pánico simulado");
      sent.push({ to: email.to, subject: email.subject });
      return { id: `fake-${sent.length}` };
    },
  };
}

beforeAll(async () => {
  client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  // Aislamiento: limpiar restos de ejecuciones anteriores en la fecha de prueba.
  await client.query(
    `DELETE FROM liturgical_readings WHERE celebration_id IN
       (SELECT id FROM liturgical_celebrations WHERE celebration_date = '2031-05-12')`
  );
  await client.query("DELETE FROM liturgical_celebrations WHERE celebration_date = '2031-05-12'");
  await client.query("DELETE FROM email_subscriptions WHERE email_normalized LIKE '%@scriptura.test'");
});

d("suscripción con doble opt-in (§13.1)", () => {
  it("crea pendiente, envía token y confirma; duplicado confirmado rechaza", async () => {
    const email = `diario-${Date.now()}@scriptura.test`;
    const res = await subscribe({
      email,
      timezone: "Europe/Madrid",
      sendTokenEmail: async (to, url) => { TOKEN_EMAILS.push({ email: to, url }); },
    });
    expect(res.ok).toBe(true);

    const { rows: sub } = await client.query("SELECT id, status FROM email_subscriptions WHERE email_normalized = $1", [email]);
    expect(sub[0].status).toBe("pending");

    const dup = await subscribe({ email, timezone: "Europe/Madrid", sendTokenEmail: async (to, url) => { TOKEN_EMAILS.push({ email: to, url }); } });
    expect(dup.ok).toBe(true); // pendiente puede reintentar

    const token = TOKEN_EMAILS[TOKEN_EMAILS.length - 1].url.split("token=")[1];
    expect(await confirmSubscription(token)).toBe(true);
    const { rows: after } = await client.query("SELECT status FROM email_subscriptions WHERE id = $1", [sub[0].id]);
    expect(after[0].status).toBe("confirmed");

    const again = await subscribe({ email, timezone: "Europe/Madrid" });
    expect(again.ok).toBe(false);

    // zona horaria inválida rechazada
    const badTz = await subscribe({ email: `tz-${Date.now()}@scriptura.test`, timezone: "Marte/Olympus" });
    expect(badTz.ok).toBe(false);
  });
});

d("cola idempotente y omisión honesta (§13.3, §13.4)", () => {
  it("sin celebración editorial para la fecha, loadDayReadings devuelve null (no inventa)", async () => {
    expect(await loadDayReadings("2031-05-12")).toBeNull();
  });

  it("encola sin duplicar y procesa: sin lecturas → omitido con incidencia", { timeout: 60000 }, async () => {
    const email = `cola-${Date.now()}@scriptura.test`;
    TOKEN_EMAILS.length = 0;
    await subscribe({ email, timezone: "Europe/Madrid", sendTokenEmail: async (to, url) => { TOKEN_EMAILS.push({ email: to, url }); } });
    const token = TOKEN_EMAILS[0].url.split("token=")[1];
    await confirmSubscription(token);
    const { rows: colaSub } = await client.query("SELECT id FROM email_subscriptions WHERE email_normalized = $1", [email]);

    const first = await enqueueForLocalDate("2031-05-12", "test");
    expect(first.queued).toBeGreaterThanOrEqual(1);
    const second = await enqueueForLocalDate("2031-05-12", "test");
    expect(second.queued).toBe(0);
    expect(second.alreadyQueued).toBeGreaterThanOrEqual(1);

    const provider = fakeProvider();
    const processed = await processPendingJobs(provider, 50, colaSub[0].id);
    expect(processed.sent).toBe(0);
    expect(processed.skipped).toBeGreaterThanOrEqual(1);
    expect(provider.sent.length).toBe(0); // nada se envía sin contenido real

    const { rows: jobs } = await client.query(
      `SELECT j.status, j.last_error FROM daily_email_jobs j
         JOIN email_subscriptions s ON s.id = j.subscription_id
        WHERE s.email_normalized = $1 AND j.liturgical_date_local = '2031-05-12'`,
      [email]
    );
    expect(jobs[0].status).toBe("skipped");
    expect(jobs[0].last_error).toContain("lecturas editoriales pendientes");
  });

  it("con celebración y lecturas editoriales seed, envía con textos RV1909 y baja funciona", { timeout: 60000 }, async () => {
    // Datos editoriales de prueba propios (no inventados como leccionario real):
    const { rows: cal } = await client.query("SELECT id FROM liturgical_calendars WHERE code='espana_general'");
    const { rows: cele } = await client.query<{ id: string }>(
      `INSERT INTO liturgical_celebrations (calendar_id, celebration_date, celebration_name, celebration_rank, season, notes)
       VALUES ($1, '2031-05-12', 'Celebración de prueba (suite)', 'ferial', 'ordinary', 'Solo base de test')
       RETURNING id`,
      [cal[0].id]
    );
    const { rows: verse } = await client.query<{ id: string; text: string }>(
      `SELECT v.id, v.text_content FROM bible_verses v
         JOIN bible_chapters c ON c.id = v.chapter_id
         JOIN biblical_books b ON b.id = c.book_id
        WHERE b.code='Jn' AND c.chapter_number=3 AND v.verse_number=16`
    );
    await client.query(
      `INSERT INTO liturgical_readings (celebration_id, reading_order, reading_kind, label, book_id, chapter_number, verse_start, verse_end, display_ref, translation_note, rights_ok)
       SELECT $1, 1, 'gospel', 'Evangelio', b.id, 3, 16, 16, 'Jn 3,16', 'Reina-Valera 1909 (dominio público)', true
        FROM biblical_books b WHERE b.code='Jn'`,
      [cele[0].id]
    );

    const content = await loadDayReadings("2031-05-12");
    expect(content).not.toBeNull();
    expect(content!.celebration.name).toBe("Celebración de prueba (suite)");
    expect(content!.readings[0].ref).toBe("Jn 3,16");
    expect(content!.readings[0].text?.startsWith("Porque de tal manera amó Dios")).toBe(true);

    const email = `envio-${Date.now()}@scriptura.test`;
    TOKEN_EMAILS.length = 0;
    await subscribe({ email, timezone: "Europe/Madrid", sendTokenEmail: async (to, url) => { TOKEN_EMAILS.push({ email: to, url }); } });
    await confirmSubscription(TOKEN_EMAILS[0].url.split("token=")[1]);
    const { rows: envioSub } = await client.query("SELECT id FROM email_subscriptions WHERE email_normalized = $1", [email]);

    await enqueueForLocalDate("2031-05-12", "test2");
    const provider = fakeProvider();
    const processed = await processPendingJobs(provider, 50, envioSub[0].id);
    expect(processed.sent).toBeGreaterThanOrEqual(1);
    expect(provider.sent.some((s) => s.subject.includes("Celebración de prueba"))).toBe(true);
    expect(provider.sent.every((s) => !s.subject.includes("undefined"))).toBe(true);

    // intento registrado
    const { rows: attempts } = await client.query(
      `SELECT count(*)::int AS n FROM email_delivery_attempts a
         JOIN daily_email_jobs j ON j.id = a.job_id
         JOIN email_subscriptions s ON s.id = j.subscription_id
        WHERE s.email_normalized = $1 AND a.status = 'accepted'`,
      [email]
    );
    expect(attempts[0].n).toBeGreaterThanOrEqual(1);

    // token de baja incluido y operativo
    const { rows: sub } = await client.query("SELECT id FROM email_subscriptions WHERE email_normalized = $1", [email]);
    const unsubToken = await getUnsubscribeToken(sub[0].id);
    expect(unsubToken).not.toBeNull();
    expect(await unsubscribeByToken(unsubToken!)).toBe(true);
    const { rows: after } = await client.query("SELECT status FROM email_subscriptions WHERE id = $1", [sub[0].id]);
    expect(after[0].status).toBe("unsubscribed");

    // limpieza de datos de prueba
    await client.query("DELETE FROM email_subscriptions WHERE email_normalized IN ($1, $2)", [email, `cola-${email.slice(5)}`]);
    await client.query("DELETE FROM liturgical_readings WHERE celebration_id = $1", [cele[0].id]);
    await client.query("DELETE FROM liturgical_celebrations WHERE id = $1", [cele[0].id]);
    void verse;
  });
});
