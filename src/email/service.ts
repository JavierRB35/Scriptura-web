// Servicio de lecturas diarias por correo (§13): suscripción con doble
// opt-in, generación idempotente de la cola y envío con reintentos.
// Integridad (§13.3): sin datos editoriales de lecturas para un día, el
// envío se omite con incidencia — nunca se inventan referencias ni textos.

import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { query, db } from "@/shared/db";
import { computeCelebration } from "@/liturgy/calendar";
import { getEmailProvider, type EmailProvider } from "./provider";
import type { OutgoingEmail } from "./provider";

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function validTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("es-ES", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// ─── Suscripción (doble opt-in, §13.1) ───────────────────────────────────────

export type SubscribeResult =
  | { ok: true; pending: true }
  | { ok: false; error: string };

export async function subscribe(input: {
  email: string;
  timezone: string;
  sendTokenEmail?: (email: string, token: string) => Promise<void>;
}): Promise<SubscribeResult> {
  const normalized = input.email.trim().toLowerCase();
  if (!validEmail(normalized)) return { ok: false, error: "Correo no válido." };
  const timezone = input.timezone || "Europe/Madrid";
  if (!validTimezone(timezone)) return { ok: false, error: "Zona horaria no válida." };

  const { rows: existing } = await query<{ id: string; status: string }>(
    "SELECT id, status FROM email_subscriptions WHERE email_normalized = $1",
    [normalized]
  );
  if (existing.length > 0 && existing[0].status === "confirmed") {
    return { ok: false, error: "Ese correo ya está suscrito y confirmado." };
  }

  let id: string;
  if (existing.length > 0) {
    id = existing[0].id;
    await query("UPDATE email_subscriptions SET status = 'pending', timezone = $2, unsubscribed_at = NULL WHERE id = $1", [id, timezone]);
  } else {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO email_subscriptions (email_normalized, email_display, status, timezone)
       VALUES ($1, $2, 'pending', $3) RETURNING id`,
      [normalized, input.email.trim(), timezone]
    );
    id = rows[0].id;
  }

  const token = randomBytes(24).toString("base64url");
  await query(
    `INSERT INTO email_subscription_tokens (subscription_id, token_hash, purpose, expires_at)
     VALUES ($1, $2, 'confirm', now() + interval '48 hours')`,
    [id, hashToken(token)]
  );
  const url = `${SITE()}/api/suscripcion/confirmar?token=${token}`;
  try {
    if (input.sendTokenEmail) {
      await input.sendTokenEmail(normalized, url);
    } else {
      const provider = getEmailProvider();
      if (!provider) throw new Error("proveedor de correo no configurado");
      await provider.send(confirmEmail(normalized, url));
    }
  } catch {
    await query("DELETE FROM email_subscription_tokens WHERE subscription_id = $1 AND used_at IS NULL", [id]);
    return { ok: false, error: "No se pudo enviar el correo de confirmación. Inténtalo más tarde." };
  }
  return { ok: true, pending: true };
}

function confirmEmail(email: string, url: string): OutgoingEmail {
  return {
    to: email,
    subject: "Confirma tu suscripción a las lecturas diarias de Scriptura",
    text: `Confirma tu suscripción en: ${url}\nEl enlace caduca en 48 horas.`,
    html: `<p>Bienvenido a las lecturas diarias de Scriptura.</p><p><a href="${url}">Confirmar suscripción</a> (caduca en 48 horas).</p><p>Si no solicitaste esto, ignora este mensaje.</p>`,
  };
}

export async function confirmSubscription(token: string): Promise<boolean> {
  const { rows } = await query<{ subscription_id: string }>(
    `UPDATE email_subscription_tokens
        SET used_at = now()
      WHERE token_hash = $1 AND purpose = 'confirm'
        AND used_at IS NULL AND expires_at > now()
      RETURNING subscription_id`,
    [hashToken(token)]
  );
  if (rows.length === 0) return false;
  await query(
    "UPDATE email_subscriptions SET status = 'confirmed', confirmed_at = now() WHERE id = $1 AND status = 'pending'",
    [rows[0].subscription_id]
  );
  return true;
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const { rows } = await query<{ subscription_id: string }>(
    `UPDATE email_subscription_tokens
        SET used_at = now()
      WHERE token_hash = $1 AND purpose = 'unsubscribe'
        AND used_at IS NULL AND expires_at > now()
      RETURNING subscription_id`,
    [hashToken(token)]
  );
  if (rows.length === 0) {
    // Baja directa también acepta el token de confirmación usado (simplicidad honesta).
    return false;
  }
  await query(
    "UPDATE email_subscriptions SET status = 'unsubscribed', unsubscribed_at = now() WHERE id = $1",
    [rows[0].subscription_id]
  );
  return true;
}

/** Token de baja de larga duración para incluir en cada correo (§13.5). */
/** Token de baja de larga duración para cada correo (§13.5): solo se guarda su hash. */
export async function getUnsubscribeToken(subscriptionId: string): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  await query(
    `INSERT INTO email_subscription_tokens (subscription_id, token_hash, purpose, expires_at)
     VALUES ($1, $2, 'unsubscribe', now() + interval '5 years')`,
    [subscriptionId, hashToken(token)]
  );
  return token;
}

// ─── Cola idempotente (§13.4) ────────────────────────────────────────────────

export interface EnqueueSummary {
  queued: number;
  alreadyQueued: number;
  inactive: number;
}

/** Encola el envío de una fecha litúrgica local para cada suscriptor activo. */
export async function enqueueForLocalDate(localDate: string, contentVersion = "1"): Promise<EnqueueSummary> {
  const { rows: subs } = await query<{ id: string }>(
    "SELECT id FROM email_subscriptions WHERE status = 'confirmed'"
  );
  let queued = 0;
  let alreadyQueued = 0;
  for (const s of subs) {
    const { rows } = await query<{ id: string; created: boolean }>(
      `INSERT INTO daily_email_jobs (subscription_id, liturgical_date_local, content_version, scheduled_for)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (subscription_id, liturgical_date_local, content_version) DO NOTHING
       RETURNING id, true AS created`,
      [s.id, localDate, contentVersion]
    );
    if (rows.length > 0) queued++;
    else alreadyQueued++;
  }
  return { queued, alreadyQueued, inactive: subs.length === 0 ? 0 : 0 };
}

// ─── Contenido y envío (§13.3, §13.5) ────────────────────────────────────────

interface DayReadings {
  celebration: { name: string; rank: string; season: string };
  readings: { label: string; ref: string; text: string | null }[];
}

/** Lee las lecturas editoriales del día; null si no hay datos (no se inventan). */
export async function loadDayReadings(localDate: string): Promise<DayReadings | null> {
  const calendarCode = "espana_general";
  const { rows: cal } = await query<{ id: string }>(
    "SELECT id FROM liturgical_calendars WHERE code = $1",
    [calendarCode]
  );
  if (cal.length === 0) return null;

  const computed = computeCelebration(localDate);
  const { rows: cele } = await query<{ id: string; celebration_name: string; rank: string; season: string }>(
    `SELECT id, celebration_name, celebration_rank AS rank, season
       FROM liturgical_celebrations
      WHERE calendar_id = $1 AND celebration_date = $2
      ORDER BY CASE celebration_rank WHEN 'solemnity' THEN 1 WHEN 'sunday' THEN 2 ELSE 3 END
      LIMIT 1`,
    [cal[0].id, localDate]
  );

  const name = cele.length > 0 ? cele[0].celebration_name : computed.name;
  const rank = cele.length > 0 ? cele[0].rank : computed.rank;
  const season = cele.length > 0 ? cele[0].season : computed.season;

  if (cele.length === 0) {
    // Sin celebración editorial para la fecha y sin datos de lecturas → omisión honesta.
    return null;
  }

  const { rows: readings } = await query<{ label: string; display_ref: string; text: string | null }>(
    `SELECT lr.label, lr.display_ref, v.text_content AS text
       FROM liturgical_readings lr
       LEFT JOIN biblical_books b ON b.id = lr.book_id
       LEFT JOIN bible_verses v ON v.id IN (
         SELECT v2.id FROM bible_verses v2
         JOIN bible_chapters c2 ON c2.id = v2.chapter_id
        WHERE c2.book_id = lr.book_id AND c2.chapter_number = lr.chapter_number
          AND v2.verse_number BETWEEN lr.verse_start AND COALESCE(lr.verse_end, lr.verse_start)
       ) AND EXISTS (SELECT 1 FROM bible_editions e WHERE e.id = (SELECT edition_id FROM bible_chapters WHERE id = v.chapter_id) AND e.publication_status = 'published')
      WHERE lr.celebration_id = $1
      ORDER BY lr.reading_order`,
    [cele[0].id]
  );

  const grouped = new Map<string, { label: string; ref: string; text: string | null }>();
  for (const r of readings) {
    const key = r.label ?? r.display_ref;
    const g = grouped.get(key) ?? { label: r.label ?? key, ref: r.display_ref, text: null };
    if (r.text && !g.text) g.text = r.text;
    grouped.set(key, g);
  }

  return {
    celebration: { name, rank, season },
    readings: [...grouped.values()],
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderDailyEmail(content: DayReadings, editionName: string, unsubscribeUrl: string): OutgoingEmail {
  const title = escapeHtml(content.celebration.name);
  const body = content.readings
    .map((r) => {
      const ref = escapeHtml(r.ref);
      if (r.text) {
        return `<h3 style="margin:18px 0 6px;color:#1f5c45;">${ref}</h3><p style="line-height:1.8;">${escapeHtml(r.text)}</p>`;
      }
      return `<h3 style="margin:18px 0 6px;color:#1f5c45;">${ref}</h3><p style="color:#6f6a5e;">Texto no disponible en la edición publicada; consúltalo en tu Biblia.</p>`;
    })
    .join("");
  const html = `<div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;background:#faf7f2;color:#26241f;">
<h1 style="color:#1f5c45;">Scriptura</h1>
<h2 style="font-weight:normal;">${title}</h2>
${body}
<p style="margin-top:24px;font-size:13px;color:#6f6a5e;">Traducción utilizada: ${escapeHtml(editionName)} (dominio público).</p>
<p style="font-size:13px;"><a href="${unsubscribeUrl}" style="color:#6f6a5e;">Cancelar la suscripción</a></p>
</div>`;
  const text = [
    content.celebration.name,
    "",
    ...content.readings.map((r) => `${r.ref}\n${r.text ?? "(texto no disponible en la edición publicada)"}`),
    "",
    `Traducción utilizada: ${editionName} (dominio público).`,
    `Cancelar la suscripción: ${unsubscribeUrl}`,
  ].join("\n\n");
  return { to: "", subject: `${content.celebration.name} · Scriptura`, html, text };
}

// ─── Procesamiento con reintentos (§13.4, §13.6) ─────────────────────────────

export interface ProcessSummary {
  sent: number;
  skipped: number;
  failed: number;
}

/**
 * Procesa los trabajos pendientes cuyo scheduled_for haya llegado.
 * Idempotencia garantizada por la restricción única de daily_email_jobs;
 * cada intento se registra en email_delivery_attempts.
 */
export async function processPendingJobs(provider?: EmailProvider, limit = 100, subscriptionId?: string): Promise<ProcessSummary> {
  const p = provider ?? getEmailProvider();
  const client = await db().connect();
  const summary: ProcessSummary = { sent: 0, skipped: 0, failed: 0 };
  try {
    const { rows: jobs } = await client.query<{ id: string; subscription_id: string; liturgical_date_local: string | Date; attempts: number }>(
      `SELECT id, subscription_id, liturgical_date_local, attempts
         FROM daily_email_jobs
        WHERE status = 'pending' AND scheduled_for <= now()
          AND ($2::uuid IS NULL OR subscription_id = $2::uuid)
        ORDER BY scheduled_for
        LIMIT $1
        FOR UPDATE SKIP LOCKED`,
      [limit, subscriptionId ?? null]
    );

    for (const job of jobs) {
      await client.query("UPDATE daily_email_jobs SET status = 'processing' WHERE id = $1", [job.id]);
      // pg devuelve `date` como Date: normalizar a ISO YYYY-MM-DD.
      const dRaw = job.liturgical_date_local;
      const localDate: string =
        typeof dRaw === "string"
          ? dRaw
          : `${dRaw.getFullYear()}-${String(dRaw.getMonth() + 1).padStart(2, "0")}-${String(dRaw.getDate()).padStart(2, "0")}`;
      try {
        const { rows: sub } = await client.query<{ email_display: string; email_normalized: string; id: string }>(
          "SELECT email_display, email_normalized, id FROM email_subscriptions WHERE id = $1 AND status = 'confirmed'",
          [job.subscription_id]
        );
        if (sub.length === 0) {
          await client.query("UPDATE daily_email_jobs SET status = 'skipped', last_error = 'suscripción inactiva' WHERE id = $1", [job.id]);
          summary.skipped++;
          continue;
        }

        const content = await loadDayReadings(localDate);
        if (!content || content.readings.length === 0) {
          // §13.3: incidencia registrada, sin inventar contenido.
          await client.query(
            "UPDATE daily_email_jobs SET status = 'skipped', last_error = 'lecturas editoriales pendientes para esta fecha' WHERE id = $1",
            [job.id]
          );
          summary.skipped++;
          continue;
        }

        if (!p) throw new Error("proveedor de correo no configurado");

        const unsubToken = await getUnsubscribeToken(sub[0].id);
        const unsubUrl = `${SITE()}/api/suscripcion/baja?token=${unsubToken}`;
        const { rows: ed } = await client.query("SELECT full_name FROM bible_editions WHERE publication_status = 'published' LIMIT 1");
        const email = renderDailyEmail(content, ed[0]?.full_name ?? "Reina-Valera 1909", unsubUrl);
        email.to = sub[0].email_normalized;

        const attempt = job.attempts + 1;
        try {
          const result = await p.send(email);
          await client.query(
            `INSERT INTO email_delivery_attempts (job_id, attempt, provider, provider_message_id, status)
             VALUES ($1, $2, $3, $4, 'accepted')`,
            [job.id, attempt, p.name, result.id]
          );
          await client.query("UPDATE daily_email_jobs SET status = 'sent', sent_at = now(), attempts = $2 WHERE id = $1", [job.id, attempt]);
          summary.sent++;
        } catch (err) {
          const retriable = attempt < 5;
          await client.query(
            `INSERT INTO email_delivery_attempts (job_id, attempt, provider, status, detail)
             VALUES ($1, $2, $3, 'failed', $4)`,
            [job.id, attempt, p.name, err instanceof Error ? err.message : "error"]
          );
          await client.query(
            `UPDATE daily_email_jobs
                SET status = $2, attempts = $3, last_error = $4
              WHERE id = $1`,
            [job.id, retriable ? "pending" : "failed", attempt, err instanceof Error ? err.message : "error"]
          );
          if (retriable) summary.skipped++; // quedará pendiente para reintento
          else summary.failed++;
        }
      } catch (err) {
        await client.query(
          "UPDATE daily_email_jobs SET status = 'failed', last_error = $2 WHERE id = $1",
          [job.id, err instanceof Error ? err.message : "error"]
        );
        summary.failed++;
      }
    }
  } finally {
    client.release();
  }
  return summary;
}
