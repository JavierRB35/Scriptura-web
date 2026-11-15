/**
 * Normalización tipográfica limitada a la visualización de la RV1909.
 *
 * La fuente publicada es inmutable: esta función NO modifica los registros ni
 * altera el original. Reduce versales, adapta tildes inequívocas y aplica
 * unas pocas revisiones léxicas cotejadas por versículo («crió»).
 * La lectura presentada es una adaptación parcial, no RV1909 literal.
 *
 * Las inscripciones, el acróstico de Salmos 119 y los nombres divinos que
 * aparecen dentro de otros versículos se conservan sin cambios.
 */
import { modernizeCriarInContext, type VerseReference } from "./lexical-revisions";
import { adaptReviewedArchaisms } from "./archaic-display";

type VerseLocation = VerseReference;

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

// Solo grafías históricas cuyo ajuste ortográfico está documentado. La
// sustitución se limita a palabras completas: no afecta «mí», «más», «tú»,
// «sé», nombres propios ni al vocabulario antiguo. Fuente: Ortografía RAE.
const MODERN_SPELLING: Readonly<Record<string, string>> = {
  "á": "a", "é": "e", "ó": "o", "ú": "u",
  "fué": "fue", "fuí": "fui", "dió": "dio", "vió": "vio",
  "fé": "fe", "tí": "ti", "rió": "rio",
};
const HISTORICAL_WORD = /(^|[^\p{L}])(á|é|ó|ú|fué|fuí|dió|vió|fé|tí|rió)(?=$|[^\p{L}])/giu;

export function modernizeHistoricalSpelling(text: string): string {
  return text.replace(HISTORICAL_WORD, (_match, prefix: string, word: string) => {
    const replacement = MODERN_SPELLING[word.toLocaleLowerCase("es")];
    if (word === word.toLocaleUpperCase("es")) {
      return prefix + replacement.toLocaleUpperCase("es");
    }
    if (word[0] === word[0].toLocaleUpperCase("es")) {
      return prefix + replacement[0].toLocaleUpperCase("es") + replacement.slice(1);
    }
    return prefix + replacement;
  });
}


export function displayBibleVerse(text: string, location: VerseLocation): string {
  const { bookCode, chapter, verseNumber } = location;
  const isFirstVerse = verseNumber === 1;
  // Lucas 1:5 inicia el relato después del prólogo (versículos 1–4).
  const isVerifiedSecondOpening =
    bookCode === "Lc" && chapter === 1 && verseNumber === 5 &&
    text.startsWith("HUBO en los días");
  if (!text) return text;
  let visibleText = text;

  if (isFirstVerse || isVerifiedSecondOpening) {
    const pattern = isFirstVerse && PSALM_HEADING.test(text)
      ? UPPERCASE_AFTER_HEADING
      : UPPERCASE_OPENING;

    visibleText = text.replace(pattern, (_match, prefix: string, word: string) => {
      const titleCase = word[0] + word.slice(1).toLocaleLowerCase("es");
      const isConnector = SINGLE_LETTER_CONNECTOR.test(prefix);
      return prefix + (isConnector && !PROPER_NAMES.has(word)
        ? word.toLocaleLowerCase("es")
        : titleCase);
    });
  }

  return modernizeHistoricalSpelling(adaptReviewedArchaisms(modernizeCriarInContext(visibleText, location), location));
}
