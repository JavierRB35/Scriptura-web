// Auditoría conservadora de calidad editorial de la RV1909.
// No modifica el texto bíblico: registra anomalías para cotejo con la fuente.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import AdmZip from "adm-zip";
import { parseUsfm, USFM_TO_CATALOG } from "../src/bible/usfm.ts";

const SOURCE_URL = "https://eBible.org/Scriptures/spaRV1909_usfm.zip";
const filename = process.argv.includes("--file")
  ? process.argv[process.argv.indexOf("--file") + 1]
  : null;
const output = process.argv.includes("--output")
  ? process.argv[process.argv.indexOf("--output") + 1]
  : null;

export function detectEditorialAnomalies(text: string): string[] {
  const issues: string[] = [];
  if (/\uFFFD/.test(text)) issues.push("carácter de sustitución Unicode");
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) issues.push("carácter de control");
  if (/ {2,}|\t|\u00A0/.test(text)) issues.push("espaciado anómalo");
  if (/\s+[,.!?;:]/.test(text)) issues.push("espacio antes de puntuación");
  if (/[!?.,;:]{3,}/.test(text)) issues.push("puntuación repetida");
  if (/\\[a-z]+(?:\*|\b)/i.test(text)) issues.push("posible marcador USFM sin procesar");
  return issues;
}

async function main() {
  const bytes = filename
    ? await readFile(filename)
    : Buffer.from(await (async () => {
        const response = await fetch(SOURCE_URL);
        if (!response.ok) throw new Error(`No se pudo descargar la fuente: HTTP ${response.status}`);
        return response.arrayBuffer();
      })());
  const zip = new AdmZip(bytes);
  const entries = zip.getEntries().filter((entry) => entry.entryName.endsWith(".usfm"));
  if (entries.length !== 66) throw new Error(`Se esperaban 66 libros USFM; recibidos ${entries.length}`);
  const findings: { reference: string; issue: string; text: string }[] = [];
  let verseCount = 0;
  let chapterCount = 0;
  let emptyCount = 0;

  for (const entry of entries) {
    const book = parseUsfm(entry.getData().toString("utf8"));
    const code = USFM_TO_CATALOG[book.usfmId];
    if (!code) throw new Error(`Libro no reconocido: ${book.usfmId}`);
    chapterCount += book.chapters.length;
    for (const chapter of book.chapters) {
      for (const [index, verse] of chapter.verses.entries()) {
        verseCount++;
        const reference = `${code} ${chapter.chapterNumber}:${verse.verseKey}`;
        if (verse.verseNumber !== index + 1)
          findings.push({ reference, issue: "numeración no secuencial", text: verse.text });
        if (!verse.text) {
          emptyCount++;
          continue; // Los vacíos de versificación se auditan aparte, no se rellenan.
        }
        for (const issue of detectEditorialAnomalies(verse.text))
          findings.push({ reference, issue, text: verse.text });
      }
    }
  }
  const report = {
    source: SOURCE_URL,
    sourceSha256: createHash("sha256").update(bytes).digest("hex"),
    edition: "Reina-Valera 1909",
    chapters: chapterCount,
    verses: verseCount,
    emptyVerses: emptyCount,
    status: "detección preliminar; cotejo humano necesario para correcciones",
    findings,
  };
  if (output) await writeFile(output, JSON.stringify(report, null, 2) + "\n", "utf8");
  else console.log(JSON.stringify(report, null, 2));
  if (chapterCount !== 1189 || verseCount !== 31102 || emptyCount !== 18)
    process.exitCode = 1;
}

if (process.argv[1]?.endsWith("audit-bible.ts")) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
