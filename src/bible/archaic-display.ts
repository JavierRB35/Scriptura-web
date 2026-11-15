/**
 * Actualización léxica conservadora de la RV1909 SOLO en versículos cotejados.
 * 53 versículos con demostrativos reforzados y 389 con formas personales
 * de verbo con pronombre enclítico; 441 referencias distintas.
 * La fuente bíblica permanece inmutable; «llamóle» se excluye hasta
 * determinar el pronombre adecuado según su referente.
 */
import type { VerseReference } from "./lexical-revisions";

const DEMONSTRATIVES_REVIEWED = new Set([
  "1Cro:7:33", "1Cro:28:7",
  "1R:7:6", "1R:9:9",
  "1S:25:37",
  "2Cro:20:7",
  "2R:5:17",
  "Ab:1:20",
  "Ag:2:9", "Ag:2:19",
  "Dn:4:10", "Dn:4:28", "Dn:9:13",
  "Dt:17:19", "Dt:19:5", "Dt:24:3", "Dt:28:58", "Dt:29:22",
  "Ex:12:3", "Ex:12:17", "Ex:13:3", "Ex:13:5", "Ex:33:13",
  "Ga:5:14",
  "Gn:10:11", "Gn:34:30", "Gn:44:1", "Gn:50:24",
  "Is:6:10",
  "Jc:2:2", "Jc:2:21", "Jc:5:5",
  "Jon:1:14",
  "Jos:1:8", "Jos:3:7", "Jos:10:13", "Jos:10:24", "Jos:11:12", "Jos:11:14", "Jos:18:16", "Jos:18:20", "Jos:21:12", "Jos:23:12", "Jos:23:13", "Jos:23:16",
  "Lv:7:19", "Lv:14:57", "Lv:23:2",
  "Nm:14:9", "Nm:19:12", "Nm:28:17",
  "Rt:4:12",
  "Sal:12:7",
]);

const ENCLITICS_REVIEWED = new Set([
  "1Cro:15:12", "1Cro:21:11",
  "1R:2:30", "1R:2:36", "1R:2:42", "1R:3:5", "1R:3:11", "1R:9:3", "1R:10:5", "1R:11:22", "1R:12:9", "1R:12:16", "1R:13:14", "1R:13:15", "1R:13:27", "1R:17:10", "1R:17:11", "1R:17:23", "1R:18:15", "1R:18:17", "1R:18:40", "1R:19:5", "1R:19:15", "1R:20:7", "1R:20:34", "1R:20:37", "1R:21:5", "1R:22:9",
  "1S:1:23", "1S:2:23", "1S:2:27", "1S:3:16", "1S:9:18", "1S:10:1", "1S:17:58", "1S:19:4", "1S:19:18", "1S:20:18", "1S:20:30", "1S:20:32", "1S:20:40", "1S:21:1", "1S:21:5", "1S:22:13", "1S:23:17", "1S:23:25", "1S:25:5", "1S:25:35", "1S:25:37", "1S:28:21", "1S:29:6", "1S:30:13", "1S:30:15",
  "2Cro:1:7", "2Cro:7:12", "2Cro:10:6", "2Cro:10:9", "2Cro:12:5", "2Cro:15:2", "2Cro:16:7", "2Cro:18:5", "2Cro:18:8", "2Cro:23:14", "2Cro:24:5", "2Cro:24:6", "2Cro:28:9", "2Cro:29:5", "2Cro:31:10",
  "2R:1:2", "2R:1:12", "2R:1:16", "2R:4:22", "2R:4:36", "2R:5:5", "2R:6:11", "2R:6:28", "2R:8:12", "2R:8:14", "2R:9:1", "2R:9:6", "2R:10:13", "2R:10:15", "2R:10:16", "2R:10:18", "2R:10:24", "2R:11:15", "2R:12:7", "2R:13:15", "2R:13:18", "2R:18:19", "2R:20:1", "2R:20:14", "2R:25:24",
  "2S:1:14", "2S:1:15", "2S:3:16", "2S:3:24", "2S:4:9", "2S:9:7", "2S:9:9", "2S:11:12", "2S:12:1", "2S:13:15", "2S:13:20", "2S:13:24", "2S:14:2", "2S:14:31", "2S:15:33", "2S:16:16", "2S:19:5", "2S:24:13", "2S:24:18",
  "Am:7:15", "Am:8:2",
  "Ap:21:6",
  "Dn:2:24", "Dn:2:25", "Dn:3:14", "Dn:10:11", "Dn:10:12", "Dn:10:19",
  "Dt:2:31", "Dt:3:2", "Dt:3:26", "Dt:5:1", "Dt:5:28", "Dt:9:12", "Dt:10:11", "Dt:29:2", "Dt:31:2", "Dt:31:7", "Dt:32:46", "Dt:34:4",
  "Esd:4:3", "Esd:10:10",
  "Est:3:11", "Est:5:14", "Est:7:7",
  "Ex:1:15", "Ex:1:18", "Ex:2:18", "Ex:4:6", "Ex:4:18", "Ex:6:2", "Ex:8:8", "Ex:8:25", "Ex:9:29", "Ex:10:28", "Ex:12:21", "Ex:12:31", "Ex:16:19", "Ex:33:19", "Ex:35:1",
  "Ez:2:1", "Ez:2:3", "Ez:3:1", "Ez:3:3", "Ez:3:4", "Ez:3:10", "Ez:3:22", "Ez:3:24", "Ez:4:16", "Ez:8:5", "Ez:8:6", "Ez:8:8", "Ez:8:9", "Ez:8:13", "Ez:8:17", "Ez:9:4", "Ez:9:7", "Ez:9:9", "Ez:10:2", "Ez:11:2", "Ez:11:5", "Ez:23:36", "Ez:24:19", "Ez:37:3", "Ez:37:4", "Ez:37:9", "Ez:37:11", "Ez:40:45", "Ez:41:4", "Ez:41:22", "Ez:42:13", "Ez:43:7", "Ez:43:18", "Ez:44:2", "Ez:44:5", "Ez:46:20", "Ez:46:24", "Ez:47:6", "Ez:47:8",
  "Gn:1:28", "Gn:3:11", "Gn:4:15", "Gn:9:1", "Gn:15:7", "Gn:16:9", "Gn:16:10", "Gn:16:11", "Gn:20:6", "Gn:24:31", "Gn:25:23", "Gn:26:2", "Gn:26:27", "Gn:27:1", "Gn:27:26", "Gn:27:31", "Gn:27:39", "Gn:27:42", "Gn:29:4", "Gn:31:5", "Gn:31:11", "Gn:32:24", "Gn:35:10", "Gn:35:11", "Gn:35:17", "Gn:37:10", "Gn:37:22", "Gn:38:16", "Gn:40:9", "Gn:40:12", "Gn:42:9", "Gn:42:18", "Gn:43:2", "Gn:44:6", "Gn:44:15", "Gn:48:4", "Gn:49:29",
  "Hch:10:4", "Hch:19:2",
  "Is:8:1", "Is:8:3", "Is:37:6", "Is:38:1", "Is:39:3", "Is:49:3",
  "Jb:2:9",
  "Jc:4:6", "Jc:4:18", "Jc:4:22", "Jc:5:17", "Jc:6:12", "Jc:6:14", "Jc:7:17", "Jc:8:24", "Jc:9:7", "Jc:9:54", "Jc:11:17", "Jc:13:3", "Jc:13:7", "Jc:13:11", "Jc:16:7", "Jc:16:12", "Jc:16:14", "Jc:16:17", "Jc:16:20", "Jc:19:8", "Jc:19:17", "Jc:19:23",
  "Jn:1:41", "Jn:1:46", "Jn:1:48", "Jn:1:49", "Jn:1:50", "Jn:2:19", "Jn:3:2", "Jn:3:3", "Jn:3:9", "Jn:3:10", "Jn:4:10", "Jn:4:13", "Jn:5:14", "Jn:5:19", "Jn:6:7", "Jn:6:29", "Jn:6:43", "Jn:6:61", "Jn:6:68", "Jn:7:9", "Jn:7:21", "Jn:8:7", "Jn:8:10", "Jn:8:14", "Jn:8:21", "Jn:8:28", "Jn:8:58", "Jn:9:7", "Jn:9:30", "Jn:9:35", "Jn:9:37", "Jn:9:41", "Jn:11:6", "Jn:12:34", "Jn:13:7", "Jn:13:8", "Jn:13:12", "Jn:13:36", "Jn:13:38", "Jn:14:23", "Jn:16:19", "Jn:18:4", "Jn:18:23", "Jn:18:33", "Jn:18:34", "Jn:18:37", "Jn:19:4", "Jn:20:19", "Jn:20:22", "Jn:20:28", "Jn:21:5",
  "Jos:2:8", "Jos:2:16", "Jos:4:5", "Jos:5:14", "Jos:22:2", "Jos:23:2",
  "Jr:1:7", "Jr:1:9", "Jr:1:12", "Jr:1:14", "Jr:3:6", "Jr:3:11", "Jr:11:9", "Jr:14:11", "Jr:14:14", "Jr:15:1", "Jr:20:3", "Jr:24:3", "Jr:32:8", "Jr:40:2", "Jr:41:6", "Jr:42:9",
  "Lc:2:48", "Lc:5:14", "Lc:10:28", "Lc:11:5", "Lc:12:13", "Lc:12:15", "Lc:12:20", "Lc:13:12", "Lc:13:23", "Lc:16:15", "Lc:16:25", "Lc:17:19", "Lc:19:5", "Lc:19:13", "Lc:21:29", "Lc:24:17", "Lc:24:41", "Lc:24:46",
  "Lv:10:4",
  "Mc:7:18", "Mc:9:38", "Mc:10:21",
  "Ne:2:2", "Ne:2:4", "Ne:7:65", "Ne:8:10",
  "Nm:14:2", "Nm:20:10", "Nm:22:9", "Nm:22:20", "Nm:23:5", "Nm:23:16", "Nm:23:17", "Nm:31:15", "Nm:32:29",
  "Os:1:4", "Os:1:6", "Os:3:1",
  "Pr:7:13",
  "Rt:2:10", "Rt:2:11", "Rt:2:19", "Rt:2:20", "Rt:3:1", "Rt:4:1",
  "Za:1:9", "Za:1:14", "Za:2:4", "Za:4:2", "Za:4:5", "Za:5:2", "Za:5:3", "Za:5:5", "Za:6:5", "Za:11:13", "Za:11:15",
]);

const DEMONSTRATIVES: Readonly<Record<string, string>> = {
  aqueste: "este", aquesta: "esta", aquestos: "estos",
  aquestas: "estas", aquesto: "esto",
};
const ENCLITICS: Readonly<Record<string, string>> = {
  díjole: "le dijo", díjoles: "les dijo", díjome: "me dijo",
  respondióle: "le respondió", quedóse: "se quedó",
};

// La frontera de palabra tiene que reconocer vocales acentuadas y eñes.
const DEMONSTRATIVE_FORM = /(?<!\p{L})(aqueste|aquesta|aquestos|aquestas|aquesto)(?!\p{L})/giu;
const ENCLITIC_FORM = /(?<!\p{L})(díjoles|díjole|díjome|respondióle|quedóse)(?!\p{L})/giu;

function keepCapitalization(original: string, equivalent: string): string {
  if (original === original.toLocaleUpperCase("es")) {
    return equivalent.toLocaleUpperCase("es");
  }
  if (original[0] === original[0].toLocaleUpperCase("es")) {
    return equivalent[0].toLocaleUpperCase("es") + equivalent.slice(1);
  }
  return equivalent;
}

export function adaptReviewedArchaisms(text: string, ref: VerseReference): string {
  const key = [ref.bookCode, ref.chapter, ref.verseNumber].join(":");
  let result = text;
  if (DEMONSTRATIVES_REVIEWED.has(key)) {
    result = result.replace(DEMONSTRATIVE_FORM, word =>
      keepCapitalization(word, DEMONSTRATIVES[word.toLocaleLowerCase("es")])
    );
  }
  if (ENCLITICS_REVIEWED.has(key)) {
    result = result.replace(ENCLITIC_FORM, word =>
      keepCapitalization(word, ENCLITICS[word.toLocaleLowerCase("es")])
    );
  }
  return result;
}
