/**
 * Normalización tipográfica limitada a la visualización de la RV1909.
 *
 * La fuente publicada es inmutable: esta función NO modifica los registros ni
 * corrige palabras, tildes o signos. Solo reduce las versales decorativas al
 * comienzo de un capítulo y la apertura verificada de Lucas 1:5.
 *
 * Las inscripciones, el acróstico de Salmos 119 y los nombres divinos que
 * aparecen dentro de otros versículos se conservan sin cambios.
 */
interface VerseLocation {
  bookCode: string;
  chapter: number;
  verseNumber: number;
}

// Nombres propios comprobados en los inicios de capítulos de la RV1909.
// Se mantienen con inicial mayúscula cuando siguen a «Y», «E» o «A».
const PROPER_NAMES = new Set([
  "ABRAHAM", "ACHAB", "ANNA", "ATHALÍA", "BALAAM", "BOOZ", "CORÉ",
  "CRISTO", "DAVID", "DIOS", "EZECHÎAS", "HIRAM", "JACOB", "JAH",
  "JEHOVÁ", "JEREMÍAS", "JESÚS", "JESUS", "JORAM", "JOSAPHAT", "JOSÉ",
  "JOSÍAS", "JOSUÉ", "MOISÉS", "PASHUR", "PABLO", "ROBOAM", "SALOMÓN",
  "SAMUEL", "SARAI", "SAULO", "SEÑOR",
]);

const UPPERCASE_OPENING = /^(\s*[¿¡]?(?:[A-ZÀ-ÖØ-Þ]\s+)?)([A-ZÀ-ÖØ-Þ]{2,})(?!\p{L})/u;
const UPPERCASE_AFTER_HEADING = /([.:]\s*[¿¡]?(?:[A-ZÀ-ÖØ-Þ]\s+)?)([A-ZÀ-ÖØ-Þ]{2,})(?!\p{L})/u;
const PSALM_HEADING = /^(?:ALEPH\b|Al Músico\b|Al director\b|Salmo\b|Canción\b|Cántico\b|Aleluya\b|Oración\b|Masquil\b|Mictam\b|Sigaión\b)/u;
const SINGLE_LETTER_CONNECTOR = /(?:^|[.:]\s*)[¿¡]?[A-ZÀ-ÖØ-Þ]\s+$/u;

export function displayBibleVerse(text: string, location: VerseLocation): string {
  const { bookCode, chapter, verseNumber } = location;
  const isFirstVerse = verseNumber === 1;
  // Lucas 1:5 inicia el relato después del prólogo (versículos 1–4).
  const isVerifiedSecondOpening =
    bookCode === "Lc" && chapter === 1 && verseNumber === 5 &&
    text.startsWith("HUBO en los días");
  if (!text || (!isFirstVerse && !isVerifiedSecondOpening)) return text;

  const pattern = isFirstVerse && PSALM_HEADING.test(text)
    ? UPPERCASE_AFTER_HEADING
    : UPPERCASE_OPENING;

  return text.replace(pattern, (_match, prefix: string, word: string) => {
    const titleCase = word[0] + word.slice(1).toLocaleLowerCase("es");
    const isConnector = SINGLE_LETTER_CONNECTOR.test(prefix);
    return prefix + (isConnector && !PROPER_NAMES.has(word)
      ? word.toLocaleLowerCase("es")
      : titleCase);
  });
}
