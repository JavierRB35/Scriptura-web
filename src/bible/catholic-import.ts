// Validación estricta y pura del testigo católico Torres Amat.
// Rechaza material parcial; nunca reconstruye versículos ausentes.
import { EXPECTED_CHAPTERS } from "./usfm";

export const CATHOLIC_EDITION_ID = "spaTorresAmat1835";
export const CATHOLIC_EXPECTED_CHAPTERS: Readonly<Record<string, number>> = {
  ...EXPECTED_CHAPTERS,
  Tb: 14, Jdt: 16, "1M": 16, "2M": 15, Sb: 19, Si: 51, Ba: 6,
  Est: 16, Dn: 14,
};
export const CATHOLIC_EXPECTED_TOTAL_CHAPTERS = 1334;

export interface CatholicVerse {
  number: number;
  text: string;
  key?: string; // Numeración histórica documentada (sin inventarla).
}
export interface CatholicChapter {
  number: number;
  verses: CatholicVerse[];
}
export interface CatholicBook {
  code: string;
  chapters: CatholicChapter[];
}
export interface CatholicWitness {
  edition: string;
  source: {
    title: string;
    edition_year: string;
    original_url: string;
    transcription_url: string;
    transcription_rights: string;
    proofread: boolean;
  };
  books: CatholicBook[];
}
export interface CatholicValidation {
  books: number;
  chapters: number;
  verses: number;
}

export function validateCatholicWitness(
  witness: CatholicWitness,
  canonicalCodes: readonly string[]
): CatholicValidation {
  if (!witness || witness.edition !== CATHOLIC_EDITION_ID) {
    throw new Error("Identificador de edición incorrecto (Torres Amat).");
  }
  const s = witness.source;
  if (!s || !s.title?.trim() || !/^18\d\d$/.test(s.edition_year) ||
      !/^https:\/\//.test(s.original_url) ||
      !/^https:\/\//.test(s.transcription_url) ||
      !s.transcription_rights?.trim() || s.proofread !== true) {
    throw new Error("Faltan procedencia, derechos o revisión editorial de la transcripción.");
  }
  if (!Array.isArray(witness.books) || witness.books.length !== 73 ||
      canonicalCodes.length !== 73) {
    throw new Error("Canon católico incompleto: se requieren exactamente 73 libros.");
  }
  let chapters = 0;
  let verses = 0;
  for (let i = 0; i < 73; i++) {
    const book = witness.books[i];
    const expectedCode = canonicalCodes[i];
    if (!book || book.code !== expectedCode) {
      throw new Error(`Libro ${i + 1}: se esperaba ${expectedCode}, recibido ${book?.code ?? "nada"}.`);
    }
    const expectedChapters = CATHOLIC_EXPECTED_CHAPTERS[book.code];
    if (!expectedChapters || book.chapters?.length !== expectedChapters) {
      throw new Error(`${book.code}: se esperaban ${expectedChapters} capítulos.`);
    }
    for (let ci = 0; ci < expectedChapters; ci++) {
      const chapter = book.chapters[ci];
      if (chapter?.number !== ci + 1 || !Array.isArray(chapter.verses) ||
          chapter.verses.length === 0) {
        throw new Error(`${book.code}: capítulo ${ci + 1} ausente o vacío.`);
      }
      chapters++;
      const keys = new Set<string>();
      let prev = 0;
      for (const v of chapter.verses) {
        const key = v?.key ?? String(v?.number);
        if (!Number.isSafeInteger(v?.number) || v.number < 1 ||
            v.number < prev || !v.text || !v.text.trim() ||
            !/^\d+[a-z]?$/.test(key) || keys.has(key)) {
          throw new Error(`${book.code} ${chapter.number}: versículo inválido o duplicado (${key}).`);
        }
        // Subversículos (p.ej. 4a, 4b) pueden compartir número pero no clave.
        if (v.number > prev + 1) {
          throw new Error(`${book.code} ${chapter.number}: salto no documentado ${prev}→${v.number}.`);
        }
        prev = v.number;
        keys.add(key);
        verses++;
      }
    }
  }
  if (chapters !== CATHOLIC_EXPECTED_TOTAL_CHAPTERS || verses < 34_000) {
    throw new Error(`Texto parcial: ${chapters} capítulos y ${verses} versículos.`);
  }
  // Ester 11-16 y Daniel 13-14 quedan garantizados por el control de capítulos.
  return { books: 73, chapters, verses };
}
