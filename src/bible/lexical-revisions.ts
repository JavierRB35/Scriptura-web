/**
 * Adaptación léxica COTEJADA POR VERSÍCULO; no toca la edición RV1909.
 * «Criar» podía significar «crear», pero también criar hijos o animales.
 * Se han comprobado las 25 referencias donde el original dice «crió».
 * Nunca aplicar este criterio globalmente a otros términos o pasajes.
 */
export interface VerseReference {
  bookCode: string;
  chapter: number;
  verseNumber: number;
}

const CREATION_REFERENCES = new Set([
  "1Tm:4:3", "1Tm:4:4", "Col:3:10", "Dt:4:32", "Dt:32:18",
  "Ef:3:9", "Gn:1:1", "Gn:1:21", "Gn:1:27", "Gn:5:1", "Gn:5:2",
  "Hb:3:4", "Is:40:26", "Is:40:28", "Is:41:20", "Is:45:18",
  "Jb:26:13", "Mc:13:19",
]);
const RAISING_REFERENCES = new Set([
  "1S:1:23", "1Tm:5:10", "Ex:16:20", "Ez:19:2",
  "Hch:7:21", "Is:49:21", "Is:51:18",
]);
const HISTORICAL_CRIO = /(?<!\p{L})crió(?!\p{L})/giu;

export function modernizeCriarInContext(text: string, ref: VerseReference): string {
  const key = [ref.bookCode, ref.chapter, ref.verseNumber].join(":");
  const replacement = CREATION_REFERENCES.has(key)
    ? "creó"
    : RAISING_REFERENCES.has(key)
      ? "crio"
      : null;

  if (!replacement) return text;

  const revised = text.replace(HISTORICAL_CRIO, (word) => {
    if (word === word.toLocaleUpperCase("es")) {
      return replacement.toLocaleUpperCase("es");
    }
    if (word[0] === word[0].toLocaleUpperCase("es")) {
      return replacement[0].toLocaleUpperCase("es") + replacement.slice(1);
    }
    return replacement;
  });

  // En Dt 32:18 el sujeto es explícitamente el Creador; en otros pasajes
  // «criador» podría tener un significado distinto y no se altera.
  return key === "Dt:32:18"
    ? revised.replace("Dios tu criador", "Dios tu creador")
    : revised;
}
