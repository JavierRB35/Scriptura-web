// Parser de referencias bíblicas para la búsqueda por referencia (§6.1).
// Acepta: "Jn 3:16", "juan 3.16", "1 Corintios 13:1-7", "Genesis", "sal 23".
// Tolerante a acentos, mayúsculas y separadores . : · Sin resultados inventados:
// si el libro no existe, devuelve null.

import { BOOKS, BOOK_BY_CODE } from "./catalog";

export interface ParsedReference {
  code: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const nameIndex: { norm: string; code: string }[] = BOOKS.flatMap((b) => [
  { norm: normalize(b.name_es), code: b.code },
  { norm: normalize(b.code), code: b.code },
]);

/** Busca el libro por nombre completo o prefijo inequívoco, o por código. */
function matchBook(input: string): string | null {
  const n = normalize(input);
  if (!n) return null;
  const exact = nameIndex.find((x) => x.norm === n);
  if (exact) return exact.code;
  const byCode = BOOK_BY_CODE.get(input.toUpperCase());
  if (byCode) return byCode.code;
  // Prefijo inequívoco (mínimo 3 caracteres): "gen" → Gn, "1 cor" → 1Co.
  if (n.length >= 3) {
    const starts = nameIndex.filter((x) => x.norm.startsWith(n));
    if (starts.length === 1) return starts[0].code;
  }
  return null;
}

/** Interpreta una referencia; null si no se identifica un libro válido. */
export function parseReference(input: string): ParsedReference | null {
  const m = input
    .trim()
    .match(/^((?:[123]\s*)?[^\d\s][^\d:,.\-]*?)\s*(\d+)?\s*(?:[:,.\s]\s*(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;
  const [, bookPart, chapter, verse, verseEnd] = m;
  // El nombre del libro no puede terminar en número suelto sin libro detectable.
  const code = matchBook(bookPart ?? "");
  if (!code) return null;
  const ref: ParsedReference = { code };
  if (chapter) ref.chapter = Number(chapter);
  if (verse) {
    ref.verseStart = Number(verse);
    if (verseEnd) ref.verseEnd = Number(verseEnd);
  }
  if (ref.verseEnd !== undefined && ref.verseEnd < (ref.verseStart ?? 0)) {
    [ref.verseStart, ref.verseEnd] = [ref.verseEnd, ref.verseStart];
  }
  return ref;
}
