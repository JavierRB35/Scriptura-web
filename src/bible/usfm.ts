// Parser USFM de Scriptura (Fase 2, §5.5).
// Reglas de limpieza del texto del versículo (documentadas y versionadas):
//   1. `\w texto|strong="..."\w*` → texto (se descartan los números de Strong).
//   2. `\add texto\add*` → texto (palabras aportadas por la edición: forman
//      parte de su lectura y deben conservarse, §5.3).
//   3. El resto de marcadores (\p, \c, \id, \h, \toc*, \mt*) se descartan.
//   4. Los espacios se normalizan; el texto no se altera de ningún otro modo.

export interface ParsedVerse {
  verseNumber: number;
  verseKey: string;
  text: string;
}

export interface ParsedChapter {
  chapterNumber: number;
  verses: ParsedVerse[];
}

export interface ParsedBook {
  usfmId: string;
  titleEs: string;
  chapters: ParsedChapter[];
}

/** Código USFM (p. ej. GEN, 1SA, PHP) → código del catálogo (Gn, 1S, Flp). */
export const USFM_TO_CATALOG: Readonly<Record<string, string>> = {
  GEN: "Gn", EXO: "Ex", LEV: "Lv", NUM: "Nm", DEU: "Dt", JOS: "Jos", JDG: "Jc",
  RUT: "Rt", "1SA": "1S", "2SA": "2S", "1KI": "1R", "2KI": "2R", "1CH": "1Cro",
  "2CH": "2Cro", EZR: "Esd", NEH: "Ne", EST: "Est", JOB: "Jb", PSA: "Sal",
  PRO: "Pr", ECC: "Qo", SNG: "Ct", ISA: "Is", JER: "Jr", LAM: "Lm", EZK: "Ez",
  DAN: "Dn", HOS: "Os", JOL: "Jl", AMO: "Am", OBA: "Ab", JON: "Jon", MIC: "Mi",
  NAM: "Na", HAB: "Ha", ZEP: "So", HAG: "Ag", ZEC: "Za", MAL: "Ml", MAT: "Mt",
  MRK: "Mc", LUK: "Lc", JHN: "Jn", ACT: "Hch", ROM: "Rm", "1CO": "1Co",
  "2CO": "2Co", GAL: "Ga", EPH: "Ef", PHP: "Flp", COL: "Col", "1TH": "1Ts",
  "2TH": "2Ts", "1TI": "1Tm", "2TI": "2Tm", TIT: "Tt", PHM: "Flm", HEB: "Hb",
  JAS: "St", "1PE": "1P", "2PE": "2P", "1JN": "1Jn", "2JN": "2Jn",
  "3JN": "3Jn", JUD: "Jds", REV: "Ap",
};

/** Capítulos esperados por libro (canon protestante; validación §22.5). */
export const EXPECTED_CHAPTERS: Readonly<Record<string, number>> = {
  Gn: 50, Ex: 40, Lv: 27, Nm: 36, Dt: 34, Jos: 24, Jc: 21, Rt: 4,
  "1S": 31, "2S": 24, "1R": 22, "2R": 25, "1Cro": 29, "2Cro": 36, Esd: 10,
  Ne: 13, Est: 10, Jb: 42, Sal: 150, Pr: 31, Qo: 12, Ct: 8, Is: 66, Jr: 52,
  Lm: 5, Ez: 48, Dn: 12, Os: 14, Jl: 3, Am: 9, Ab: 1, Jon: 4, Mi: 7, Na: 3,
  Ha: 3, So: 3, Ag: 2, Za: 14, Ml: 4, Mt: 28, Mc: 16, Lc: 24, Jn: 21,
  Hch: 28, Rm: 16, "1Co": 16, "2Co": 13, Ga: 6, Ef: 6, Flp: 4, Col: 4,
  "1Ts": 5, "2Ts": 3, "1Tm": 6, "2Tm": 4, Tt: 3, Flm: 1, Hb: 13, St: 5,
  "1P": 5, "2P": 3, "1Jn": 5, "2Jn": 1, "3Jn": 1, Jds: 1, Ap: 22,
};

export const EXPECTED_TOTAL_CHAPTERS = 1189;
export const EXPECTED_TOTAL_VERSES = 31102;

/** Limpia una línea de texto USFM aplicando las reglas documentadas. */
export function cleanUsfmText(raw: string): string {
  return raw
    // \add texto\add* y \nd texto\nd* → conservar el texto
    .replace(/\\(?:add|nd)\s+(.*?)\\(?:add|nd)\*/g, "$1")
    // \w texto|atributos\w* → conservar solo el texto
    .replace(/\\w\s+(.*?)\|[^\\]*\\w\*/g, "$1")
    // cualquier marcador restante (\p, \v 12, \c 3, \q…) → espacio
    .replace(/\\[a-zA-Z0-9]+(\s+[0-9-]+)?(\s*\*)?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parsea el contenido de un fichero .usfm completo. */
export function parseUsfm(content: string): ParsedBook {
  const idMatch = content.match(/^\\id\s+([A-Z0-9]{3})/m);
  if (!idMatch) throw new Error("falta marcador \\id");
  const usfmId = idMatch[1];

  const hMatch = content.match(/^\\h\s+(.+)$/m);
  const titleEs = hMatch ? hMatch[1].trim() : usfmId;

  const book: ParsedBook = { usfmId, titleEs, chapters: [] };
  let current: ParsedChapter | null = null;

  // Recorrer línea a línea: los marcadores de esta fuente están en líneas propias.
  for (const line of content.split(/\r?\n/)) {
    const chapterMatch = line.match(/^\\c\s+(\d+)\s*$/);
    if (chapterMatch) {
      current = { chapterNumber: Number(chapterMatch[1]), verses: [] };
      book.chapters.push(current);
      continue;
    }
    const verseMatch = line.match(/^\\v\s+([0-9]+)\s*(.*)$/);
    if (verseMatch && current) {
      const verseNumber = Number(verseMatch[1]);
      const text = cleanUsfmText(verseMatch[2]);
      current.verses.push({ verseNumber, verseKey: verseMatch[1], text });
    }
  }
  return book;
}
