#!/usr/bin/env node
// Siembra idempotente del catálogo de libros y cánones desde src/bible/catalog.json.
// No crea ediciones ni versículos: eso llega con el importador de la Fase 2.
// Uso: node scripts/seed-books.mjs  (requiere DATABASE_URL)

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG = path.join(__dirname, "..", "src", "bible", "catalog.json");
const PROTESTANT = "protestante66";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: falta DATABASE_URL en el entorno.");
    process.exit(1);
  }

  const { canons, books } = JSON.parse(await readFile(CATALOG, "utf8"));

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("BEGIN");

    const canonIds = {};
    for (const c of canons) {
      const { rows } = await client.query(
        `INSERT INTO biblical_canons (code, name, book_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, book_count = EXCLUDED.book_count
         RETURNING id`,
        [c.code, c.name, c.code === PROTESTANT ? 66 : books.length]
      );
      canonIds[c.code] = rows[0].id;
    }

    const bookIds = {};
    for (const b of books) {
      const { rows } = await client.query(
        `INSERT INTO biblical_books (code, name_es, testament, deuterocanonical, osis_code)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE
           SET name_es = EXCLUDED.name_es,
               testament = EXCLUDED.testament,
               deuterocanonical = EXCLUDED.deuterocanonical,
               osis_code = EXCLUDED.osis_code
         RETURNING id`,
        [b.code, b.name_es, b.testament, b.deuterocanonical, b.osis_code]
      );
      bookIds[b.code] = rows[0].id;
    }

    for (const c of canons) {
      const members = c.code === PROTESTANT ? books.filter((b) => !b.deuterocanonical) : books;
      await client.query("DELETE FROM canon_books WHERE canon_id = $1", [canonIds[c.code]]);
      for (let i = 0; i < members.length; i++) {
        await client.query(
          "INSERT INTO canon_books (canon_id, book_id, position) VALUES ($1, $2, $3)",
          [canonIds[c.code], bookIds[members[i].code], i + 1]
        );
      }
    }

    await client.query("COMMIT");
    console.log(
      `Catálogo sembrado: ${books.length} libros, ${canons.length} cánones (${Object.values(canonIds).length} membresías reconstruidas).`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al sembrar:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
