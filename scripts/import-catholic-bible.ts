#!/usr/bin/env node
// Importa de forma atómica una transcripción católica española ya cotejada.
// Uso: node scripts/import-catholic-bible.ts --file ruta/testigo.json [--check | --publish]
// No descarga páginas web, no aplica OCR ni genera/traduce versículos.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import {
  CATHOLIC_EDITION_ID,
  validateCatholicWitness,
  type CatholicWitness,
} from "../src/bible/catholic-import.ts";

async function main() {
  const args = process.argv.slice(2);
  const index = args.indexOf("--file");
  const filename = index < 0 ? undefined : args[index + 1];
  const check = args.includes("--check");
  const publish = args.includes("--publish");
  if (!filename || filename.startsWith("--") || (check && publish)) {
    throw new Error("Uso: --file testigo.json [--check | --publish]");
  }

  const bytes = await readFile(filename);
  const witness = JSON.parse(bytes.toString("utf8")) as CatholicWitness;
  const catalog = JSON.parse(
    await readFile(new URL("../src/bible/catalog.json", import.meta.url), "utf8")
  ) as { books: Array<{ code: string }> };
  const { books, chapters, verses } = validateCatholicWitness(
    witness, catalog.books.map(b => b.code)
  );

  // Se calcula sobre el contenido y numeración, independientemente de su JSON.
  const lines = witness.books.flatMap(book =>
    book.chapters.flatMap(ch =>
      ch.verses.map(v => [book.code, ch.number, v.key ?? v.number, v.text].join("|"))
    )
  );
  const hash = createHash("sha256").update(lines.join("\n")).digest("hex");
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  console.log(`Cotejo estructural OK: ${books} libros, ${chapters} capítulos, ${verses} versículos.`);
  console.log(`SHA-256 del testigo: ${fileHash} · del contenido: ${hash}`);
  if (check) return;

  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL; no se ha modificado ninguna edición.");
  }
  const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    await db.query("BEGIN");
    const { rows: previous } = await db.query<{
      id: string; integrity_hash: string | null; publication_status: string;
    }>("SELECT id, integrity_hash, publication_status FROM bible_editions WHERE identifier=$1 FOR UPDATE", [CATHOLIC_EDITION_ID]);

    if (previous[0]?.publication_status === "published") {
      if (previous[0].integrity_hash !== hash) {
        throw new Error("La edición publicada es inmutable: para una revisión cree un identificador nuevo.");
      }
      await db.query("COMMIT");
      console.log("Edición idéntica ya publicada; sin cambios.");
      return;
    }

    // La fuente de la traducción y la procedencia de la TRANSCRIPCIÓN son distintos.
    const { rows: sources } = await db.query<{ id: string }>(
      "SELECT id FROM bible_sources WHERE url=$1 ORDER BY created_at LIMIT 1",
      [witness.source.original_url]
    );
    let sourceId = sources[0]?.id;
    if (!sourceId) {
      const { rows } = await db.query<{ id: string }>(
        `INSERT INTO bible_sources
         (name,publisher,url,license_status,license_evidence,verified_at)
         VALUES ($1,$2,$3,'public_domain',$4,CURRENT_DATE) RETURNING id`,
        [witness.source.title, "Edición histórica de Félix Torres Amat",
         witness.source.original_url,
         `Traducción de dominio público; transcripción ${witness.source.transcription_url}; derechos de la transcripción: ${witness.source.transcription_rights}`]
      );
      sourceId = rows[0].id;
    }
    const { rows: editionRows } = await db.query<{ id: string }>(
      `INSERT INTO bible_editions
         (source_id,identifier,full_name,abbreviation,language,translator,year,
          canon_coverage,url,rights_status,verified_at,file_version,
          integrity_hash,publication_status)
       VALUES ($1,$2,$3,'TA','es','Félix Torres Amat',$4,
         '73 libros (canon católico)', $5,'public_domain',CURRENT_DATE,$6,$7,'draft')
       ON CONFLICT(identifier) DO UPDATE SET
         source_id=EXCLUDED.source_id, full_name=EXCLUDED.full_name,
         year=EXCLUDED.year, url=EXCLUDED.url, file_version=EXCLUDED.file_version,
         integrity_hash=EXCLUDED.integrity_hash,
         publication_status='draft'
       RETURNING id`,
      [sourceId,CATHOLIC_EDITION_ID,"La Sagrada Biblia — Félix Torres Amat",
       witness.source.edition_year,witness.source.original_url,fileHash.slice(0,16),hash]
    );
    const editionId = editionRows[0].id;
    const { rows: batchRows } = await db.query<{id:string}>(
      `INSERT INTO bible_import_batches
         (edition_id,source_url,books_count,chapters_count,verses_count,integrity_hash)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [editionId,witness.source.transcription_url,books,chapters,verses,hash]
    );
    const batchId = batchRows[0].id;

    const { rows: bookRows } = await db.query<{code:string;id:string}>(
      "SELECT code,id FROM biblical_books"
    );
    const ids = new Map(bookRows.map(b=>[b.code,b.id]));
    await db.query("DELETE FROM bible_chapters WHERE edition_id=$1", [editionId]);
    await db.query("DELETE FROM edition_books WHERE edition_id=$1", [editionId]);
    for (let i = 0; i < witness.books.length; i++) {
      const book = witness.books[i];
      const bookId = ids.get(book.code);
      if (!bookId) throw new Error(`No sembrado en biblical_books: ${book.code} (ejecute npm run db:seed)`);
      await db.query(
        "INSERT INTO edition_books(edition_id,book_id,position) VALUES($1,$2,$3)",
        [editionId,bookId,i+1]
      );
      for (const chapter of book.chapters) {
        const { rows: chRows } = await db.query<{ id: string }>(
          `INSERT INTO bible_chapters(edition_id,book_id,chapter_number)
            VALUES($1,$2,$3) RETURNING id`,
          [editionId,bookId,chapter.number]
        );
        const chId = chRows[0].id;
        // Inserción vectorizada por capítulo, con texto sin alteraciones.
        const values: unknown[] = [];
        const parameters = chapter.verses.map(v => {
          const j=values.length;
          values.push(chId,v.number,v.key ?? String(v.number),v.text);
          return `($${j+1},$${j+2},$${j+3},$${j+4})`;
        });
        await db.query(
          `INSERT INTO bible_verses(chapter_id,verse_number,verse_key,text_content)
           VALUES ${parameters.join(",")}`,values
        );
      }
    }
    if (publish) {
      await db.query("UPDATE bible_editions SET publication_status='published' WHERE id=$1",[editionId]);
    }
    await db.query(
      `UPDATE bible_import_batches
        SET status='completed',finished_at=now(),warnings='[]'::jsonb,errors='[]'::jsonb
       WHERE id=$1`,[batchId]
    );
    await db.query("COMMIT");
    console.log(publish ? "Canon católico publicado." : "Canon católico validado e importado como borrador.");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}
main().catch(error => {console.error(error);process.exitCode=1;});
