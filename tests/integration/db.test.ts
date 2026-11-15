// Pruebas de integración reales contra PostgreSQL (§22).
// Requieren DATABASE_URL; se omiten con aviso si no está definida.
// Ejecutan el runner y el sembrado REALES (scripts/migrate.mjs, scripts/seed-books.mjs).

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import pg from "pg";

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

const DATABASE_URL = process.env.DATABASE_URL;
const d = describe.skipIf(!DATABASE_URL);

async function script(name: string) {
  const { stdout } = await run("node", [path.join(ROOT, "scripts", name)], {
    env: { ...process.env, DATABASE_URL },
    cwd: ROOT,
  });
  return stdout;
}

let client: pg.Client;

beforeAll(async () => {
  // Idempotencia real: migrate + seed se ejecutan dos veces.
  await script("migrate.mjs");
  await script("seed-books.mjs");
  await script("migrate.mjs");
  await script("seed-books.mjs");
  client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
});

d("migraciones y siembra", () => {
  it("aplica las 11 migraciones sin duplicar registros", async () => {
    const { rows } = await client.query(
      "SELECT count(*)::int AS n FROM schema_migrations"
    );
    expect(rows[0].n).toBe(11);
  });

  it("siembra 73 libros y 2 cánones con membresías correctas", async () => {
    const books = await client.query("SELECT count(*)::int AS n FROM biblical_books");
    const canons = await client.query(
      "SELECT code FROM biblical_canons ORDER BY code"
    );
    const memberships = await client.query<{ code: string; n: number }>(
      `SELECT c.code, count(*)::int AS n
         FROM canon_books cb JOIN biblical_canons c ON c.id = cb.canon_id
        GROUP BY c.code ORDER BY c.code`
    );
    expect(books.rows[0].n).toBe(73);
    expect(canons.rows.map((r) => r.code)).toEqual(["catolica73", "protestante66"]);
    expect(Object.fromEntries(memberships.rows.map((r) => [r.code, r.n]))).toEqual({
      catolica73: 73,
      protestante66: 66,
    });
  });

  it("las posiciones de canon son consecutivas desde 1", async () => {
    const { rows } = await client.query<{ code: string; positions: number[] }>(
      `SELECT c.code, array_agg(cb.position ORDER BY cb.position) AS positions
         FROM canon_books cb JOIN biblical_canons c ON c.id = cb.canon_id
        GROUP BY c.code`
    );
    for (const row of rows) {
      expect(row.positions).toEqual(Array.from({ length: row.positions.length }, (_, i) => i + 1));
    }
  });
});

d("usuarios y perfiles (§4, §16.2)", () => {
  it("crea perfil con alias automático y preferencias al insertar usuario", async () => {
    const email = `test-${Date.now()}@example.test`;
    const { rows: userRows } = await client.query(
      "INSERT INTO auth.users (email) VALUES ($1) RETURNING id",
      [email]
    );
    const userId = userRows[0].id;

    const profile = await client.query(
      "SELECT alias, history_public FROM profiles WHERE id = $1",
      [userId]
    );
    expect(profile.rows).toHaveLength(1);
    expect(profile.rows[0].alias).toMatch(/^lector_[0-9a-f]{8}$/);
    expect(profile.rows[0].history_public).toBe(false); // privacidad por defecto (§18.3)

    const prefs = await client.query(
      "SELECT * FROM user_preferences WHERE user_id = $1",
      [userId]
    );
    expect(prefs.rows).toHaveLength(1);

    await client.query("DELETE FROM auth.users WHERE id = $1", [userId]);
  });

  it("rechaza alias duplicados", async () => {
    const email1 = `dup1-${Date.now()}@example.test`;
    const email2 = `dup2-${Date.now()}@example.test`;
    const { rows: u1 } = await client.query(
      "INSERT INTO auth.users (email) VALUES ($1) RETURNING id",
      [email1]
    );
    await expect(
      client.query("UPDATE profiles SET alias = 'alias_test_unico' WHERE id = $1", [u1[0].id])
    ).resolves.toBeDefined();

    const { rows: u2 } = await client.query(
      "INSERT INTO auth.users (email) VALUES ($1) RETURNING id",
      [email2]
    );
    await expect(
      client.query("UPDATE profiles SET alias = 'alias_test_unico' WHERE id = $1", [u2[0].id])
    ).rejects.toThrow();
    await client.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [
      [u1[0].id, u2[0].id],
    ]);
  });

  it("has_role refleja los roles acumulables", async () => {
    const email = `rol-${Date.now()}@example.test`;
    const { rows: u } = await client.query(
      "INSERT INTO auth.users (email) VALUES ($1) RETURNING id",
      [email]
    );
    const userId = u[0].id;

    const before = await client.query("SELECT public.has_role($1, 'editor') AS ok", [userId]);
    expect(before.rows[0].ok).toBe(false);

    await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'editor')", [userId]);
    const after = await client.query("SELECT public.has_role($1, 'editor') AS ok", [userId]);
    expect(after.rows[0].ok).toBe(true);

    await client.query("DELETE FROM auth.users WHERE id = $1", [userId]);
  });
});

d("comunidad: restricciones reales (§7)", () => {
  async function newUser(prefix: string) {
    const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`;
    const { rows } = await client.query(
      "INSERT INTO auth.users (email) VALUES ($1) RETURNING id",
      [email]
    );
    return rows[0].id as string;
  }
  async function bookId() {
    const { rows } = await client.query("SELECT id FROM biblical_books WHERE code = 'Jn'");
    return rows[0].id as string;
  }

  it("permite comentar un pasaje y responder, y mantiene los recuentos", async () => {
    const author = await newUser("autor");
    const replier = await newUser("revisor");
    const book = await bookId();

    const { rows: commentRows } = await client.query(
      `INSERT INTO comments (author_id, book_id, chapter_number, verse_start, verse_end, body)
       VALUES ($1, $2, 3, 16, 16, 'Reflexión de prueba sobre Jn 3,16') RETURNING id`,
      [author, book]
    );
    const commentId = commentRows[0].id;

    await client.query(
      `INSERT INTO comments (author_id, parent_id, book_id, chapter_number, verse_start, verse_end, body)
       VALUES ($1, $2, $3, 3, 16, 16, 'Respuesta de prueba')`,
      [replier, commentId, book]
    );

    const { rows } = await client.query(
      "SELECT reply_count FROM comments WHERE id = $1",
      [commentId]
    );
    expect(rows[0].reply_count).toBe(1);

    await client.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [[author, replier]]);
  });

  it("limita la profundidad de respuestas a un nivel", async () => {
    const author = await newUser("prof");
    const book = await bookId();

    const { rows: root } = await client.query(
      `INSERT INTO comments (author_id, book_id, chapter_number, verse_start, verse_end, body)
       VALUES ($1, $2, 1, 1, 1, 'Raíz') RETURNING id`,
      [author, book]
    );
    const { rows: reply } = await client.query(
      `INSERT INTO comments (author_id, parent_id, book_id, chapter_number, verse_start, verse_end, body)
       VALUES ($1, $2, $3, 1, 1, 1, 'Respuesta') RETURNING id`,
      [author, root[0].id, book]
    );

    await expect(
      client.query(
        `INSERT INTO comments (author_id, parent_id, book_id, chapter_number, verse_start, verse_end, body)
         VALUES ($1, $2, $3, 1, 1, 1, 'Nivel 3 prohibido')`,
        [author, reply[0].id, book]
      )
    ).rejects.toThrow();

    await client.query("DELETE FROM auth.users WHERE id = $1", [author]);
  });

  it("prohíbe autolikes y duplicados, y sincroniza like_count", async () => {
    const author = await newUser("like-a");
    const liker = await newUser("like-b");
    const book = await bookId();

    const { rows: c } = await client.query(
      `INSERT INTO comments (author_id, book_id, chapter_number, verse_start, verse_end, body)
       VALUES ($1, $2, 1, 1, 1, 'Con likes') RETURNING id`,
      [author, book]
    );
    const commentId = c[0].id;

    // Autolike prohibido.
    await expect(
      client.query("INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)", [commentId, author])
    ).rejects.toThrow();

    // Un like por usuario y aportación.
    await client.query("INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)", [commentId, liker]);
    await expect(
      client.query("INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)", [commentId, liker])
    ).rejects.toThrow();

    // like_count calculado desde registros reales.
    let row = await client.query("SELECT like_count FROM comments WHERE id = $1", [commentId]);
    expect(row.rows[0].like_count).toBe(1);

    // Retirar el like restaura el recuento.
    await client.query("DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2", [commentId, liker]);
    row = await client.query("SELECT like_count FROM comments WHERE id = $1", [commentId]);
    expect(row.rows[0].like_count).toBe(0);

    await client.query("DELETE FROM auth.users WHERE id = ANY($1::uuid[])", [[author, liker]]);
  });
});

d("reputación y correo: semillas e idempotencia (§10, §13)", () => {
  it("tiene exactamente una versión de reglas activa con parámetros", async () => {
    const { rows } = await client.query<{ n: number; params: Record<string, unknown> }>(
      `SELECT count(*)::int AS n,
              (SELECT params FROM reputation_rules WHERE active ORDER BY version DESC LIMIT 1) AS params
         FROM reputation_rules WHERE active`
    );
    expect(rows[0].n).toBe(1);
    expect(rows[0].params).toMatchObject({
      points_per_comment: 5,
      points_per_like_received: 1,
    });
  });

  it("define los 4 niveles de reconocimiento en progresión", async () => {
    const { rows } = await client.query<{ position: number; min_points: number }>(
      "SELECT position, min_points FROM recognition_levels ORDER BY position"
    );
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4]);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].min_points).toBeGreaterThan(rows[i - 1].min_points);
    }
  });

  it("prohíbe dos envíos diarios para la misma suscripción, fecha y versión", async () => {
    const email = `news-${Date.now()}@example.test`;
    const { rows: s } = await client.query(
      "INSERT INTO email_subscriptions (email_normalized, email_display) VALUES ($1, $1) RETURNING id",
      [email.toLowerCase()]
    );
    const subId = s[0].id;

    await client.query(
      `INSERT INTO daily_email_jobs (subscription_id, liturgical_date_local, content_version, scheduled_for)
       VALUES ($1, '2026-11-15', 'v1', now())`,
      [subId]
    );
    await expect(
      client.query(
        `INSERT INTO daily_email_jobs (subscription_id, liturgical_date_local, content_version, scheduled_for)
         VALUES ($1, '2026-11-15', 'v1', now())`,
        [subId]
      )
    ).rejects.toThrow();

    // Misma fecha con versión distinta sí se permite (reenvío corregido).
    await expect(
      client.query(
        `INSERT INTO daily_email_jobs (subscription_id, liturgical_date_local, content_version, scheduled_for)
         VALUES ($1, '2026-11-15', 'v2', now())`,
        [subId]
      )
    ).resolves.toBeDefined();

    await client.query("DELETE FROM email_subscriptions WHERE id = $1", [subId]);
  });

  it("normaliza la unicidad de suscripción por dirección", async () => {
    const email = `dup-${Date.now()}@example.test`;
    await client.query(
      "INSERT INTO email_subscriptions (email_normalized, email_display) VALUES ($1, $1)",
      [email.toLowerCase()]
    );
    await expect(
      client.query(
        "INSERT INTO email_subscriptions (email_normalized, email_display) VALUES ($1, $1)",
        [email.toLowerCase()]
      )
    ).rejects.toThrow();
    await client.query("DELETE FROM email_subscriptions WHERE email_normalized = $1", [
      email.toLowerCase(),
    ]);
  });
});
