/**
 * Tercera tanda de adaptación léxica RV1909, sin modificar la fuente.
 *
 * Cotejo de 216 versículos candidatos: 198 referencias adaptadas y
 * 18 excluidas por ambigüedad semántica o por construcciones rituales.
 * No constituye una revisión completa ni una nueva traducción.
 *
 * Fuente y exclusiones: docs/08-INVENTARIO-ARCAISMOS.md.
 */
import type { VerseReference } from "./lexical-revisions";

const THANKSGIVING = new Set([
  "1Tm:4:3",
  "1Tm:4:4",
  "1Ts:3:9",
  "2Co:4:15",
  "2Co:9:11",
  "Col:2:7",
  "Col:4:2",
  "Flp:4:6",
  "Hch:24:3",
  "Lv:22:29",
  "Lv:7:12",
  "Lv:7:15",
]);
const NECESSITY = new Set([
  "1Co:15:25",
  "1Co:15:53",
  "2Co:5:10",
  "2Tm:2:6",
  "Hb:11:6",
  "Hb:2:1",
  "Hch:14:22",
  "Hch:16:30",
  "Hch:18:21",
  "Hch:27:24",
  "Hch:27:26",
  "Hch:3:21",
  "Lc:13:33",
  "Lc:24:7",
  "Mt:17:10",
  "Mt:24:6",
  "Tt:1:7",
]);
const AROUND = new Set([
  "1Cro:22:9",
  "1Cro:28:12",
  "1R:4:24",
  "1R:6:10",
  "1R:6:5",
  "1R:6:6",
  "1R:7:24",
  "1S:22:6",
  "1S:22:7",
  "1S:26:5",
  "2Cro:23:10",
  "2R:11:11",
  "2S:7:1",
  "Dn:9:16",
  "Ex:16:13",
  "Ex:19:12",
  "Ex:27:17",
  "Ex:30:3",
  "Ex:37:11",
  "Ex:37:2",
  "Ex:39:23",
  "Ex:40:33",
  "Ex:40:8",
  "Ez:1:4",
  "Ez:23:22",
  "Ez:23:24",
  "Ez:32:22",
  "Ez:40:17",
  "Ez:41:16",
  "Ez:41:17",
  "Ez:42:16",
  "Ez:45:2",
  "Ez:48:35",
  "Ez:6:13",
  "Ez:6:5",
  "Hb:12:1",
  "Is:29:3",
  "Is:60:4",
  "Jb:19:12",
  "Jb:19:6",
  "Jb:1:10",
  "Jb:37:12",
  "Jc:7:21",
  "Jos:15:12",
  "Jr:12:9",
  "Jr:1:15",
  "Jr:25:9",
  "Jr:4:17",
  "Jr:50:15",
  "Jr:52:14",
  "Jr:6:3",
  "Lv:3:13",
  "Lv:3:2",
  "Lv:3:8",
  "Lv:7:2",
  "Lv:8:19",
  "Lv:8:24",
  "Nm:11:31",
  "Nm:11:32",
  "Nm:16:24",
  "Nm:16:27",
  "Nm:16:34",
  "Nm:3:37",
  "Qo:12:5",
  "Sal:18:11",
  "Sal:27:6",
  "Sal:34:7",
  "Sal:50:3",
  "Sal:77:18",
  "Sal:97:3",
  "Za:2:5",
]);
const YOUTH = new Set([
  "1Cro:12:28",
  "1Jn:2:13",
  "1Jn:2:14",
  "1P:5:5",
  "1R:11:28",
  "1R:12:10",
  "1R:12:14",
  "1R:12:8",
  "1S:17:42",
  "1S:17:55",
  "1S:17:56",
  "1S:17:58",
  "1S:30:17",
  "1S:9:2",
  "2Cro:10:10",
  "2Cro:10:14",
  "2Cro:10:8",
  "2Cro:36:17",
  "2R:5:22",
  "2R:8:12",
  "2S:1:13",
  "2S:1:5",
  "2S:1:6",
  "Am:2:11",
  "Am:4:10",
  "Am:8:13",
  "Ct:2:3",
  "Dt:32:25",
  "Ex:24:5",
  "Ez:23:12",
  "Ez:23:23",
  "Ez:23:6",
  "Ez:30:17",
  "Gn:4:23",
  "Hch:20:9",
  "Hch:23:17",
  "Hch:23:18",
  "Hch:23:22",
  "Hch:2:17",
  "Hch:5:10",
  "Hch:5:6",
  "Hch:7:58",
  "Is:23:4",
  "Is:31:8",
  "Is:40:30",
  "Is:62:5",
  "Is:9:17",
  "Jc:14:10",
  "Jl:2:28",
  "Jos:6:23",
  "Jr:11:22",
  "Jr:48:15",
  "Jr:49:26",
  "Jr:50:30",
  "Jr:51:22",
  "Jr:51:3",
  "Jr:9:21",
  "Lc:7:14",
  "Lm:1:15",
  "Lm:1:18",
  "Lm:2:21",
  "Lm:5:14",
  "Mc:16:5",
  "Mt:19:20",
  "Mt:19:22",
  "Pr:7:7",
  "Qo:11:9",
  "Rt:3:10",
  "Sal:148:12",
  "Sal:78:63",
  "Tt:2:6",
  "Za:9:17",
]);
const FOOD = new Set([
  "1Co:10:3",
  "1Co:3:2",
  "1Co:6:13",
  "1Co:8:4",
  "1Co:8:8",
  "2Cro:9:4",
  "2S:13:5",
  "Ag:2:12",
  "Dt:2:6",
  "Gn:6:21",
  "Hb:12:16",
  "Hb:13:9",
  "Hb:5:14",
  "Hb:9:10",
  "Jb:12:11",
  "Lc:9:12",
  "Lc:9:13",
  "Lv:11:34",
  "Os:9:3",
  "Sal:107:18",
  "Sal:78:30",
]);

// Se revisó el referente de cada uno de los cinco casos.
const NAMING_PHRASES: Readonly<Record<string, readonly [string, string]>> = {
  "1Cro:7:16": ["y llamóle Peres", "y lo llamó Peres"],
  "2R:18:4": ["y llamóle por nombre Nehustán", "y la llamó Nehustán"],
  "Gn:33:20": ["y llamóle: El Dios de Israel", "y lo llamó: El Dios de Israel"],
  "Jc:13:24": ["y llamóle por nombre Samsón", "y lo llamó Samsón"],
  "Nm:32:42": ["y llamóle Noba", "y la llamó Noba"],
};

export const CONTEXTUAL_REVIEWED_KEYS: ReadonlySet<string> = new Set([
  ...THANKSGIVING, ...NECESSITY, ...AROUND, ...YOUTH, ...FOOD,
  ...Object.keys(NAMING_PHRASES),
]);

const THANKS_WORD = /(?<!\p{L})hacimiento de gracias(?!\p{L})/giu;
const NEED_WORD = /(?<!\p{L})es menester que(?!\p{L})/giu;
const AROUND_WORD = /(?<!\p{L})en derredor(?!\p{L})/giu;
const YOUTH_WORD = /(?<!\p{L})(mancebos|mancebo)(?!\p{L})/giu;
const FOOD_WORD = /(?<!\p{L})(viandas|vianda)(?!\p{L})/giu;

function preserveCase(source: string, replacement: string): string {
  if (source === source.toLocaleUpperCase("es")) {
    return replacement.toLocaleUpperCase("es");
  }
  if (source[0] === source[0].toLocaleUpperCase("es")) {
    return replacement[0].toLocaleUpperCase("es") + replacement.slice(1);
  }
  return replacement;
}

/** Solo la capa visible: jamás guardar el texto adaptado como RV1909 original. */
export function adaptContextualLexicon(text: string, ref: VerseReference): string {
  const key = [ref.bookCode, ref.chapter, ref.verseNumber].join(":");
  if (!CONTEXTUAL_REVIEWED_KEYS.has(key)) return text;
  let result = text;

  const naming = NAMING_PHRASES[key];
  if (naming) result = result.replace(naming[0], naming[1]);

  if (THANKSGIVING.has(key)) {
    // Los dos casos con determinante requieren concordancia de género.
    result = result.replace(/(?<!\p{L})el hacimiento de gracias(?!\p{L})/giu,
      match => preserveCase(match, "la acción de gracias"));
    result = result.replace(/(?<!\p{L})todo hacimiento de gracias(?!\p{L})/giu,
      match => preserveCase(match, "toda acción de gracias"));
    result = result.replace(THANKS_WORD, match =>
      preserveCase(match, "acción de gracias"));
  }

  if (NECESSITY.has(key)) {
    result = result.replace(NEED_WORD, match =>
      preserveCase(match, "es necesario que"));
  }

  if (AROUND.has(key)) {
    result = result.replace(AROUND_WORD, match =>
      preserveCase(match, "alrededor"));
  }

  if (YOUTH.has(key)) {
    result = result.replace(YOUTH_WORD, match =>
      preserveCase(match, match.toLocaleLowerCase("es") === "mancebos"
        ? "jóvenes" : "joven"));
  }

  if (FOOD.has(key)) {
    // Sustituciones que requieren cambiar el artículo o un adjetivo.
    if (key === "1Co:3:2") {
      result = result.replace("no vianda", "no alimento sólido");
    } else if (key === "1Co:10:3") {
      result = result.replace("la misma vianda espiritual", "el mismo alimento espiritual");
    } else if (key === "Hb:5:14") {
      result = result.replace("la vianda firme", "el alimento sólido");
    } else if (key === "1Co:8:4") {
      result = result.replace("las viandas que son sacrificadas", "los alimentos que son sacrificados");
    } else {
      result = result.replace(FOOD_WORD, match => preserveCase(match,
        match.toLocaleLowerCase("es") === "viandas"
          ? (key === "Lc:9:12" || key === "Lc:9:13" ? "comida" : "comidas")
          : "comida"));
    }
  }

  return result;
}
