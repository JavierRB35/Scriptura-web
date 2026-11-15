#!/usr/bin/env node
// Runner de migraciones versionadas e idempotente.
// Aplica db/migrations/*.sql en orden lexicográfico dentro de una transacción por
// fichero y registra cada una en schema_migrations. Reejecutar no duplica nada.
// Uso: node scripts/migrate.mjs  (requiere DATABASE_URL)

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import crypto from "node:crypto";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "db", "migrations");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: falta DATABASE_URL en el entorno.");
    process.exit(1);
  }

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("Error: no hay migraciones en", MIGRATIONS_DIR);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now(),
        checksum   text NOT NULL
      )
    `);

    const { rows } = await client.query("SELECT filename FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.filename));
    let pending = 0;

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      console.log(`→ aplicando ${file}…`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
          [file, checksum]
        );
        await client.query("COMMIT");
        pending++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`✗ fallo en ${file}:`, err.message);
        process.exitCode = 1;
        return;
      }
    }

    console.log(
      pending === 0
        ? "Base de datos al día: no hay migraciones pendientes."
        : `Aplicadas ${pending} migración(es); total registrado: ${applied.size + pending}.`
    );
  } finally {
    await client.end();
  }
}

main();
