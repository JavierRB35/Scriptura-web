// Recuperación fundamentada (§12.2, §12.4): los versículos se obtienen
// SIEMPRE del repositorio bíblico autorizado (nunca generados); los
// fragmentos documentales se recuperan por texto completo y, si existen
// embeddings, por similitud pgvector. Sin proveedor de IA sigue funcionando
// la vía léxica (búsqueda real, no simulada).

import "server-only";

/** Marca de datos por petición para PPR; tolerante fuera de petición (tests/scripts). */
async function markRequestScope() {
  try {
    await (await import("next/server")).connection();
  } catch {
    /* sin scope de petición: entorno de prueba o script */
  }
}

import { query } from "@/shared/db";
import { extractReference } from "@/bible/reference";
import { slugOf } from "@/bible/slug";

export interface RetrievedVerse {
  verseId: string;
  bookCode: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
  source: "referencia" | "coincidencia";
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  tradition: string | null;
  content: string;
  score: number;
}

export interface RetrievalResult {
  verses: RetrievedVerse[];
  chunks: RetrievedChunk[];
}

const MAX_VERSES = 8;
const MAX_CHUNKS = 6;

export async function retrieve(
  question: string,
  editionId: string,
  queryEmbedding?: number[]
): Promise<RetrievalResult> {
  await markRequestScope();

  const verses: RetrievedVerse[] = [];
  const seenVerses = new Set<string>();

  // 1) Referencia explícita en la pregunta → versículos directos del repositorio.
  const ref = extractReference(question);
  if (ref?.chapter && ref.verseStart) {
    const end = Math.min(ref.verseEnd ?? ref.verseStart, ref.verseStart + 5);
    const { rows } = await query<{
      id: string; code: string; name: string;
      chapter: number; verse_number: number; text: string;
    }>(
      `SELECT v.id, b.code, b.name_es AS name, c.chapter_number AS chapter,
              v.verse_number, v.text_content AS text
         FROM bible_verses v
         JOIN bible_chapters c ON c.id = v.chapter_id
         JOIN biblical_books b ON b.id = c.book_id
        WHERE c.edition_id = $1 AND b.code = $2
          AND c.chapter_number = $3 AND v.verse_number BETWEEN $4 AND $5
        ORDER BY v.verse_number`,
      [editionId, ref.code, ref.chapter, ref.verseStart, end]
    );
    for (const r of rows) {
      if (!r.text) continue;
      seenVerses.add(r.id);
      verses.push({ verseId: r.id, bookCode: r.code, bookName: r.name, chapter: r.chapter, verseNumber: r.verse_number, text: r.text, source: "referencia" });
    }
  }

  // 2) Coincidencias léxicas de la pregunta en los versículos (OR de palabras:
  //    con AND, cualquier palabra sin correspondencia vaciaría los resultados).
  const clean = question.trim().replace(/[?¿¡!.]/g, " ");
  const orQuery = clean
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9ñ]{3,}/g)
    ?.filter((w) => !STOPWORDS.has(w))
    .join(" | ");
  if (orQuery) {
    const { rows } = await query<{
      id: string; code: string; name: string;
      chapter: number; verse_number: number; text: string;
    }>(
      `SELECT v.id, b.code, b.name_es AS name, c.chapter_number AS chapter,
              v.verse_number, v.text_content AS text,
              ts_rank(v.tsv, to_tsquery('spanish', $2)) AS rank
         FROM bible_verses v
         JOIN bible_chapters c ON c.id = v.chapter_id
         JOIN biblical_books b ON b.id = c.book_id
        WHERE c.edition_id = $1 AND v.tsv @@ to_tsquery('spanish', $2)
          AND v.text_content <> ''
        ORDER BY rank DESC
        LIMIT $3`,
      [editionId, orQuery, MAX_VERSES]
    );
    for (const r of rows) {
      if (seenVerses.has(r.id) || verses.length >= MAX_VERSES || !r.text) continue;
      seenVerses.add(r.id);
      verses.push({ verseId: r.id, bookCode: r.code, bookName: r.name, chapter: r.chapter, verseNumber: r.verse_number, text: r.text, source: "coincidencia" });
    }
  }

  // 3) Fragmentos documentales: vector si hay embedding; si no, léxico.
  let chunks: RetrievedChunk[] = [];
  if (queryEmbedding && queryEmbedding.length > 0) {
    const { rows } = await query<{ id: string; document_id: string; title: string; tradition: string | null; content: string; score: number }>(
      `SELECT kc.id, kc.document_id, kd.title, kd.tradition, kc.content,
              1 - (ke.embedding <=> $1::vector) AS score
         FROM knowledge_embeddings ke
         JOIN knowledge_chunks kc ON kc.id = ke.chunk_id
         JOIN knowledge_documents kd ON kd.id = kc.document_id
        WHERE kd.editorial_state = 'approved'
        ORDER BY ke.embedding <=> $1::vector
        LIMIT $2`,
      [`[${queryEmbedding.map((n) => n.toFixed(6)).join(",")}]`, MAX_CHUNKS]
    );
    chunks = rows.map((r) => ({ chunkId: r.id, documentId: r.document_id, documentTitle: r.title, tradition: r.tradition, content: r.content, score: Number(r.score) }));
  }
  if (chunks.length === 0 && orQuery) {
    const { rows } = await query<{ id: string; document_id: string; title: string; tradition: string | null; content: string; rank: number }>(
      `SELECT kc.id, kc.document_id, kd.title, kd.tradition, kc.content,
              ts_rank(kc.tsv, to_tsquery('spanish', $1)) AS rank
         FROM knowledge_chunks kc
         JOIN knowledge_documents kd ON kd.id = kc.document_id
        WHERE kd.editorial_state = 'approved'
          AND kc.tsv @@ to_tsquery('spanish', $1)
        ORDER BY rank DESC
        LIMIT $2`,
      [orQuery, MAX_CHUNKS]
    );
    chunks = rows.map((r) => ({ chunkId: r.id, documentId: r.document_id, documentTitle: r.title, tradition: r.tradition, content: r.content, score: Number(r.rank) }));
  }

  return { verses, chunks };
}

/** Palabras vacías españolas excluidas de la consulta OR. */
const STOPWORDS = new Set([
  "que", "los", "las", "del", "por", "para", "con", "una", "uno", "como",
  "significa", "dice", "dice?", "era", "eran", "quienes", "quién", "quien",
  "cuál", "cual", "cuáles", "cuales", "dónde", "donde", "cuando", "cuándo",
  "sobre", "este", "esta", "esto", "hay", "habla", "según", "segun", "más",
  "mas", "pero", "sus", "sin", "años", "año", "ser", "fue", "han", "qué",
]);

/** Enlace legible para citar un versículo recuperado. */
export function verseLink(v: RetrievedVerse): string {
  return `/biblia/${slugOf(v.bookCode)}/${v.chapter}?v=${v.verseNumber}`;
}

export function verseLabel(v: RetrievedVerse): string {
  return `${v.bookName} ${v.chapter}:${v.verseNumber}`;
}
