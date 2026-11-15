#!/usr/bin/env node
// Importador bíblico reproducible de Scriptura (Fase 2, §5.5).
// Ejecutar con Node 24+ (eliminación de tipos nativa):
//   DATABASE_URL=… node scripts/import-bible.ts [--file local.zip] [--publish]
// Proceso: obtiene la fuente → calcula huella → parsea USFM → valida
// (66 libros, 1.189 capítulos, 31.102 versículos, secuencia por capítulo,
// capítulos por libro según tabla canónica, texto no vacío) → importa en una
// transacción (sin duplicar) → registra el lote → opcionalmente publica.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import AdmZip from "adm-zip";
import {
  parseUsfm,
  USFM_TO_CATALOG,
  EXPECTED_CHAPTERS,
  EXPECTED_TOTAL_CHAPTERS,
  EXPECTED_TOTAL_VERSES,
  type ParsedBook,
} from "../src/bible/usfm.ts";

const DEFAULT_URL = "https://eBible.org/Scriptures/spaRV1909_usfm.zip";
const EDITION_ID = "spaRV1909";

const args = process.argv.slice(2);
const fileIdx = args.indexOf("--file");
const localFile = fileIdx >= 0 ? args[fileIdx + 1] : null;
const publish = args.includes("--publish");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: falta DATABASE_URL.");
    process.exit(1);
  }

  // 1. Obtener la fuente documentada (descarga o fichero local).
  let zipBytes: Buffer;
  if (localFile) {
    zipBytes = await readFile(localFile);
  } else {
    console.log(`Descargando ${DEFAULT_URL}…`);
    const res = await fetch(DEFAULT_URL);
    if (!res.ok) {
      console.error(`Error descargando la fuente: HTTP ${res.status}`);
      process.exit(1);
    }
    zipBytes = Buffer.from(await res.arrayBuffer());
  }
  const zipHash = createHash("sha256").update(zipBytes).digest("hex");
  console.log(`Fuente: ${(zipBytes.length / 1024 / 1024).toFixed(2)} MB · SHA-256 zip ${zipHash.slice(0, 16)}…`);

  // 2. Extraer y parsear los ficheros USFM.
  const zip = new AdmZip(zipBytes);
  const entries = zip.getEntries().filter((e) => e.entryName.endsWith(".usfm"));
  if (entries.length !== 66) {
    console.error(`Error: se esperaban 66 ficheros .usfm y hay ${entries.length}.`);
    process.exit(1);
  }
  const books: ParsedBook[] = entries.map((e) => parseUsfm(e.getData().toString("utf8")));

  // 3. Validaciones (§22.5).
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalChapters = 0;
  let totalVerses = 0;
  const contentParts: string[] = [];

  for (const book of books) {
    const code = USFM_TO_CATALOG[book.usfmId];
    if (!code) {
      errors.push(`libro USFM desconocido: ${book.usfmId}`);
      continue;
    }
    const expected = EXPECTED_CHAPTERS[code];
    if (book.chapters.length !== expected) {
      errors.push(`${code}: ${book.chapters.length} capítulos, esperados ${expected}`);
    }
    for (const ch of book.chapters) {
      totalChapters++;
      ch.verses.forEach((v, i) => {
        totalVerses++;
        if (v.verseNumber !== i + 1) {
          errors.push(`${code} ${ch.chapterNumber}: numeración no secuencial (${v.verseKey} en posición ${i + 1})`);
        }
        if (!v.text) {
          // Numeración inglesa sin texto en esta edición (§5.2): se conserva el
          // número con texto vacío y se registra como advertencia, no error.
          warnings.push(`${code} ${ch.chapterNumber}:${v.verseKey} sin texto en esta edición`);
        }
        contentParts.push(`${code}|${ch.chapterNumber}|${v.verseKey}|${v.text}`);
      });
    }
  }
  if (totalChapters !== EXPECTED_TOTAL_CHAPTERS) {
    errors.push(`total de capítulos ${totalChapters} ≠ ${EXPECTED_TOTAL_CHAPTERS}`);
  }
  if (totalVerses !== EXPECTED_TOTAL_VERSES) {
    errors.push(`total de versículos ${totalVerses} ≠ ${EXPECTED_TOTAL_VERSES}`);
  }
  const contentHash = createHash("sha256").update(contentParts.join("\n"), "utf8").digest("hex");

  if (errors.length > 0) {
    console.error(`Validación FALLIDA con ${errors.length} error(es):`);
    for (const e of errors.slice(0, 20)) console.error("  ✗", e);
    process.exit(1);
  }
  console.log(
    `Validación superada: 66 libros · ${totalChapters} capítulos · ${totalVerses} versículos · contenido SHA-256 ${contentHash.slice(0, 16)}…`
  );

  // 4. Importación transaccional e idempotente.
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    // Si ya está publicada con esta misma huella, no se toca nada.
    const existing = await client.query(
      "SELECT id, publication_status, integrity_hash FROM bible_editions WHERE identifier = $1",
      [EDITION_ID]
    );
    if (
      existing.rows.length > 0 &&
      existing.rows[0].publication_status === "published" &&
      existing.rows[0].integrity_hash === contentHash
    ) {
      console.log("La edición ya está publicada con exactamente esta huella: no se duplica nada.");
      await client.end();
      return;
    }

    await client.query("BEGIN");

    // 4a. Fuente con derechos documentados.
    const source = await client.query(
      `INSERT INTO bible_sources (name, publisher, url, license_status, license_evidence, verified_at)
       VALUES ($1, $2, $3, 'public_domain', $4, CURRENT_DATE)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ["eBible.org · spaRV1909", "eBible.org", "https://ebible.org/spaRV1909/", "Página del módulo: Public Domain (dominio público)"]
    );
    let sourceId: string;
    if (source.rows.length > 0) {
      sourceId = source.rows[0].id;
    } else {
      const found = await client.query("SELECT id FROM bible_sources WHERE url = $1", [
        "https://ebible.org/spaRV1909/",
      ]);
      sourceId = found.rows[0].id;
    }

    // 4b. Edición con metadatos completos (§5.4).
    const edition = await client.query(
      `INSERT INTO bible_editions (
         source_id, identifier, full_name, abbreviation, language, translator, year,
         canon_coverage, url, rights_status, verified_at, file_version, integrity_hash, publication_status
       ) VALUES ($1,$2,$3,$4,'es',$5,'1909',$6,$7,'public_domain',CURRENT_DATE,$8,$9,'draft')
       ON CONFLICT (identifier) DO UPDATE SET
         integrity_hash = EXCLUDED.integrity_hash,
         file_version = EXCLUDED.file_version,
         verified_at = EXCLUDED.verified_at,
         publication_status = 'draft'
       RETURNING id`,
      [
        sourceId,
        EDITION_ID,
        "Reina-Valera 1909",
        "RV1909",
        "Reina-Valera, revisión 1909",
        "66 libros (canon protestante)",
        "https://ebible.org/spaRV1909/",
        zipHash.slice(0, 16),
        contentHash,
      ]
    );
    const editionId = edition.rows[0].id;

    // 4c. Lote de importación (trazabilidad del proceso).
    const batch = await client.query(
      `INSERT INTO bible_import_batches (edition_id, source_url, status, books_count, chapters_count, verses_count, integrity_hash)
       VALUES ($1, $2, 'running', $3, $4, $5, $6) RETURNING id`,
      [editionId, DEFAULT_URL, books.length, totalChapters, totalVerses, contentHash]
    );
    const batchId = batch.rows[0].id;

    // 4d. Reemplazo limpio del contenido de la edición (idempotente).
    await client.query("DELETE FROM bible_chapters WHERE edition_id = $1", [editionId]);
    await client.query("DELETE FROM edition_books WHERE edition_id = $1", [editionId]);

    const catalogRows = await client.query<{ id: string; code: string }>(
      "SELECT id, code FROM biblical_books"
    );
    const bookIdByCode = new Map(catalogRows.rows.map((r) => [r.code, r.id]));

    let position = 0;
    for (const book of books) {
      const code = USFM_TO_CATALOG[book.usfmId];
      const bookId = bookIdByCode.get(code);
      if (!bookId) throw new Error(`libro del catálogo no encontrado: ${code}`);
      position++;
      await client.query(
        "INSERT INTO edition_books (edition_id, book_id, position) VALUES ($1, $2, $3)",
        [editionId, bookId, position]
      );
      for (const ch of book.chapters) {
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO bible_chapters (edition_id, book_id, chapter_number)
           VALUES ($1, $2, $3) RETURNING id`,
          [editionId, bookId, ch.chapterNumber]
        );
        const chapterId = inserted.rows[0].id;
        for (const v of ch.verses) {
          await client.query(
            "INSERT INTO bible_verses (chapter_id, verse_number, verse_key, text_content) VALUES ($1, $2, $3, $4)",
            [chapterId, v.verseNumber, v.verseKey, v.text]
          );
        }
      }
    }

    // 4e. Publicación solo si se solicita y todo ha validado.
    if (publish) {
      await client.query(
        "UPDATE bible_editions SET publication_status = 'published' WHERE id = $1",
        [editionId]
      );
    }

    await client.query(
      `UPDATE bible_import_batches
         SET status = 'completed', finished_at = now(),
             errors = $2::jsonb, warnings = $3::jsonb
       WHERE id = $1`,
      [batchId, JSON.stringify(errors), JSON.stringify(warnings)]
    );

    await client.query("COMMIT");
    console.log(
      publish
        ? `Importación completada y PUBLICADA (edición ${EDITION_ID}).`
        : `Importación completada en estado draft (usar --publish para publicar).`
    );
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Error de importación (transacción revertida):", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
