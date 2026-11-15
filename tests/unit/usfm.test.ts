// Pruebas del parser USFM y de las tablas de validación canónica (§22.5).

import { describe, expect, it } from "vitest";
import {
  cleanUsfmText,
  parseUsfm,
  USFM_TO_CATALOG,
  EXPECTED_CHAPTERS,
  EXPECTED_TOTAL_CHAPTERS,
  EXPECTED_TOTAL_VERSES,
} from "@/bible/usfm";

describe("cleanUsfmText", () => {
  it("conserva el texto de los marcadores \\w y descarta los números de Strong", () => {
    const raw = String.raw`\w EN el principio|strong="H7225"\w* \w crió|strong="H1254"\w* \w Dios|strong="H0430"\w*.`;
    expect(cleanUsfmText(raw)).toBe("EN el principio crió Dios.");
  });

  it("conserva el texto de \\add (palabras de la edición)", () => {
    const raw = String.raw`\w que|strong="H0834"\w* \add están\add* \w debajo|strong="H8478"\w*`;
    expect(cleanUsfmText(raw)).toBe("que están debajo");
  });

  it("descarta marcadores de párrafo y normaliza espacios", () => {
    expect(cleanUsfmText(String.raw`\p  Texto   con    espacios. `)).toBe("Texto con espacios.");
  });

  it("devuelve cadena vacía para versículos sin texto (numeración inglesa)", () => {
    expect(cleanUsfmText("")).toBe("");
  });
});

describe("parseUsfm", () => {
  const sample = [
    String.raw`\id JHN  John`,
    String.raw`\h Juan`,
    String.raw`\c 3`,
    String.raw`\p`,
    String.raw`\v 16  \w Porque|strong="G1063"\w* \w de tal manera|strong="G3779"\w* amó Dios al mundo.`,
    String.raw`\v 17  Porque no envió Dios á su Hijo al mundo. \add nota\add*`,
    String.raw`\c 4`,
    String.raw`\p`,
    String.raw`\v 1  Cuando entendió Jesús.`,
  ].join("\n");

  it("extrae id, título, capítulos y versículos", () => {
    const book = parseUsfm(sample);
    expect(book.usfmId).toBe("JHN");
    expect(book.titleEs).toBe("Juan");
    expect(book.chapters).toHaveLength(2);
    expect(book.chapters[0].chapterNumber).toBe(3);
    expect(book.chapters[0].verses).toHaveLength(2);
    expect(book.chapters[0].verses[0].text).toBe(
      "Porque de tal manera amó Dios al mundo."
    );
    expect(book.chapters[1].verses[0].verseNumber).toBe(1);
  });
});

describe("tablas de validación canónica", () => {
  it("cubre los 66 libros del canon protestante", () => {
    expect(Object.keys(EXPECTED_CHAPTERS)).toHaveLength(66);
    expect(new Set(Object.values(USFM_TO_CATALOG).map((c) => EXPECTED_CHAPTERS[c] ?? null).filter((v) => v === null))).toHaveLength(0);
  });

  it("suma 1.189 capítulos (66 libros)", () => {
    expect(Object.values(EXPECTED_CHAPTERS).reduce((a, b) => a + b, 0)).toBe(
      EXPECTED_TOTAL_CHAPTERS
    );
  });

  it("declara el total canónico de versículos", () => {
    expect(EXPECTED_TOTAL_VERSES).toBe(31102);
  });
});
