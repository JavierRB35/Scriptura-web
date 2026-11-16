// Consultas de lectura bíblica (solo servidor). La Biblia publicada es
// pública (D06): no requiere sesión.

import "server-only";
import { connection } from "next/server";
import { query } from "@/shared/db";
import type { ParsedReference } from "./reference";
import { CHAPTER_VERSES_SQL } from "./verse-query";

export interface EditionInfo {
  id: string;
  identifier: string;
  fullName: string;
  abbreviation: string;
  language: string;
  canonCoverage: string;
  url: string | null;
}

export interface VerseRow {
  verseNumber: number;
  verseKey: string;
  text: string;
}

export interface ChapterInfo {
  edition: EditionInfo;
  bookCode: string;
  bookName: string;
  chapterNumber: number;
  chapterCount: number;
  verses: VerseRow[];
  prev: { slug: string; chapter: number; label: string } | null;
  next: { slug: string; chapter: number; label: string } | null;
}

/** Edición preferente: Torres Amat católica solo tras publicación íntegra; RV1909 como respaldo. */
export async function getPublishedEdition(): Promise<EditionInfo | null> {
  await connection(); // datos por petición: nunca prerenderizados ni cacheados
  const { rows } = await query<{
    id: string;
    identifier: string;
    full_name: string;
    abbreviation: string;
    language: string;
    canon_coverage: string;
    url: string | null;
  }>(
    `SELECT id, identifier, full_name, abbreviation, language, canon_coverage, url
       FROM bible_editions WHERE publication_status = 'published'
      ORDER BY CASE WHEN identifier = 'spaTorresAmat1835' THEN 0 ELSE 1 END, created_at LIMIT 1`
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    identifier: r.identifier,
    fullName: r.full_name,
    abbreviation: r.abbreviation,
    language: r.language,
    canonCoverage: r.canon_coverage,
    url: r.url,
  };
}

/** Libros incluidos en una edición, con número de capítulos reales. */
export async function getEditionBooks(editionId: string) {
  const { rows } = await query<{
    code: string;
    name_es: string;
    testament: "AT" | "NT";
    chapters: number;
    position: number;
  }>(
    `SELECT b.code, b.name_es, b.testament,
            count(DISTINCT ch.chapter_number)::int AS chapters,
            eb.position
       FROM edition_books eb
       JOIN biblical_books b ON b.id = eb.book_id
       LEFT JOIN bible_chapters ch ON ch.book_id = b.id AND ch.edition_id = eb.edition_id
      WHERE eb.edition_id = $1
      GROUP BY b.code, b.name_es, b.testament, eb.position
      ORDER BY eb.position`,
    [editionId]
  );
  return rows;
}

/** Capítulo completo con navegación anterior/siguiente real. */
export async function getChapter(
  bookCode: string,
  chapterNumber: number,
  editionId: string
): Promise<ChapterInfo | null> {
  await connection();
  const { rows } = await query<{
    edition_id: string;
    identifier: string;
    full_name: string;
    abbreviation: string;
    language: string;
    canon_coverage: string;
    url: string | null;
    book_name: string;
    chapter_count: number;
  }>(
    `SELECT e.id AS edition_id, e.identifier, e.full_name, e.abbreviation,
            e.language, e.canon_coverage, e.url,
            b.name_es AS book_name,
            (SELECT count(*)::int FROM bible_chapters c2
              WHERE c2.edition_id = e.id AND c2.book_id = b.id) AS chapter_count
       FROM bible_chapters ch
       JOIN bible_editions e ON e.id = ch.edition_id
       JOIN biblical_books b ON b.id = ch.book_id
      WHERE b.code = $1 AND ch.chapter_number = $2 AND ch.edition_id = $3
      LIMIT 1`,
    [bookCode, chapterNumber, editionId]
  );
  if (rows.length === 0) return null;
  const head = rows[0];

  const verses = await query<VerseRow>(
    CHAPTER_VERSES_SQL,
    [editionId, bookCode, chapterNumber]
  );

  // Anterior/siguiente sobre la rejilla real de capítulos de la edición.
  const { rows: nav } = await query<{
    prev_ch: number | null;
    prev_book: string | null;\n    prev_code: string | null;
    next_ch: number | null;
    next_book: string | null;\n    next_code: string | null;
  }>(
    `WITH grid AS (
       SELECT b.code, b.name_es, ch.chapter_number,
              LAG(ch.chapter_number)  OVER w AS prev_ch,
              LAG(b.name_es)          OVER w AS prev_book,\n              LAG(b.code)             OVER w AS prev_code,
              LEAD(ch.chapter_number) OVER w AS next_ch,
              LEAD(b.name_es)         OVER w AS next_book,\n              LEAD(b.code)            OVER w AS next_code
         FROM bible_chapters ch
         JOIN biblical_books b ON b.id = ch.book_id
         JOIN edition_books eb ON eb.edition_id = ch.edition_id AND eb.book_id = ch.book_id
        WHERE ch.edition_id = $1
       WINDOW w AS (ORDER BY eb.position, ch.chapter_number)
     )
     SELECT prev_ch, prev_book, prev_code, next_ch, next_book, next_code
       FROM grid WHERE code = $2 AND chapter_number = $3`,
    [editionId, bookCode, chapterNumber]
  );

  const { slugOf } = await import("./slug");
  const n = nav[0];
  let prev: ChapterInfo["prev"] = null;
  let next: ChapterInfo["next"] = null;
  if (n?.prev_ch != null) {
    const cross = n.prev_book !== head.book_name;
    const bookCodeNav = cross ? n.prev_code! : bookCode;
    prev = {
      slug: slugOf(bookCodeNav),
      chapter: n.prev_ch,
      label: cross ? `${n.prev_book} ${n.prev_ch}` : `Capítulo ${n.prev_ch}`,
    };
  }
  if (n?.next_ch != null) {
    const cross = n.next_book !== head.book_name;
    const bookCodeNav = cross ? n.next_code! : bookCode;
    next = {
      slug: slugOf(bookCodeNav),
      chapter: n.next_ch,
      label: cross ? `${n.next_book} ${n.next_ch}` : `Capítulo ${n.next_ch}`,
    };
  }

  return {
    edition: {
      id: head.edition_id,
      identifier: head.identifier,
      fullName: head.full_name,
      abbreviation: head.abbreviation,
      language: head.language,
      canonCoverage: head.canon_coverage,
      url: head.url,
    },
    bookCode,
    bookName: head.book_name,
    chapterNumber,
    chapterCount: head.chapter_count,
    verses: verses.rows,
    prev,
    next,
  };
}

export interface SearchHit {
  bookCode: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
}

/** Búsqueda textual (subcadena, sin distinción de mayúsculas/acentos por ILIKE). */
export async function searchVerses(
  term: string,
  editionId: string,
  limit = 30
): Promise<SearchHit[]> {
  const clean = term.trim();
  if (clean.length < 3) return [];
  await connection();
  const { rows } = await query<SearchHit>(
    `SELECT b.code AS "bookCode", b.name_es AS "bookName",
            ch.chapter_number AS chapter, v.verse_number AS "verseNumber",
            v.text_content AS text
       FROM bible_verses v
       JOIN bible_chapters ch ON ch.id = v.chapter_id
       JOIN biblical_books b ON b.id = ch.book_id
       JOIN edition_books eb ON eb.edition_id = ch.edition_id AND eb.book_id = ch.book_id
      WHERE ch.edition_id = $1 AND v.text_content ILIKE '%' || $2 || '%'
      ORDER BY eb.position, ch.chapter_number, v.verse_number
      LIMIT $3`,
    [editionId, clean, limit]
  );
  return rows;
}

/** ¿Existe realmente el capítulo (y rango de versículos) de una referencia? */
export async function referenceExists(
  ref: ParsedReference,
  editionId: string
): Promise<{ chapterExists: boolean; maxVerse: number | null }> {
  const { rows } = await query<{ maxch: number | null; maxv: number | null }>(
    `SELECT (SELECT max(ch.chapter_number) FROM bible_chapters ch
              JOIN biblical_books b ON b.id = ch.book_id
             WHERE ch.edition_id = $1 AND b.code = $2) AS maxch,
            (SELECT max(v.verse_number) FROM bible_verses v
              JOIN bible_chapters ch ON ch.id = v.chapter_id
              JOIN biblical_books b ON b.id = ch.book_id
             WHERE ch.edition_id = $1 AND b.code = $2 AND ch.chapter_number = $3) AS maxv`,
    [editionId, ref.code, ref.chapter ?? 1]
  );
  return {
    chapterExists: rows[0]?.maxch != null && (ref.chapter ?? 1) <= rows[0].maxch,
    maxVerse: rows[0]?.maxv ?? null,
  };
}
