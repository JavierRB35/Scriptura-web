import { describe, expect, it } from "vitest";
import { displayBibleVerse, modernizeHistoricalSpelling } from "../../src/bible/display-text";

const at = (bookCode: string, chapter: number, verseNumber: number) => ({
  bookCode, chapter, verseNumber,
});

describe("normalización de mayúsculas decorativas en la lectura", () => {
  it("normaliza solo el arranque verificado del capítulo", () => {
    expect(displayBibleVerse("EN el principio crió Dios los cielos y la tierra.", at("Gn", 1, 1)))
      .toBe("En el principio crió Dios los cielos y la tierra.");
    expect(displayBibleVerse("PABLO, llamado á ser apóstol.", at("1Co", 1, 1)))
      .toBe("Pablo, llamado a ser apóstol.");
    expect(displayBibleVerse("ASÍ que, hermanos...", at("1Co", 2, 1)))
      .toBe("Así que, hermanos...");
    expect(displayBibleVerse("¿NO soy apóstol?", at("1Co", 9, 1)))
      .toBe("¿No soy apóstol?");
  });

  it("distingue conectores de nombres propios, sin inventar palabras", () => {
    expect(displayBibleVerse("Y POR lo que hace...", at("1Co", 8, 1)))
      .toBe("Y por lo que hace...");
    expect(displayBibleVerse("Y FUÉ así.", at("Gn", 2, 1)))
      .toBe("Y fue así.");
    expect(displayBibleVerse("E HIRAM rey de Tiro...", at("1Cro", 14, 1)))
      .toBe("E Hiram rey de Tiro...");
    expect(displayBibleVerse("A JEHOVÁ llamé.", at("Sal", 120, 1)))
      .toBe("A Jehová llamé.");
  });

  it("respeta encabezamientos y acrósticos de los salmos", () => {
    expect(displayBibleVerse("Salmo de David. JEHOVÁ es mi pastor; nada me faltará.", at("Sal", 23, 1)))
      .toBe("Salmo de David. Jehová es mi pastor; nada me faltará.");
    expect(displayBibleVerse("ALEPH. BIENAVENTURADOS los perfectos de camino.", at("Sal", 119, 1)))
      .toBe("ALEPH. Bienaventurados los perfectos de camino.");
    expect(displayBibleVerse("Cántico gradual. A JEHOVÁ llamé.", at("Sal", 120, 1)))
      .toBe("Cántico gradual. A Jehová llamé.");
  });

  it("mantiene versales originales de inscripciones y nombres divinos", () => {
    expect(displayBibleVerse("Yo soy JEHOVÁ tu Dios.", at("Ex", 20, 2)))
      .toBe("Yo soy JEHOVÁ tu Dios.");
    expect(displayBibleVerse("Y escribe al ángel en SMIRNA.", at("Ap", 2, 8)))
      .toBe("Y escribe al ángel en SMIRNA.");
    expect(displayBibleVerse("TEKEL: Pesado has sido.", at("Dn", 5, 27)))
      .toBe("TEKEL: Pesado has sido.");
    expect(displayBibleVerse("BETH ¿Con qué limpiará el joven su camino?", at("Sal", 119, 9)))
      .toBe("BETH ¿Con qué limpiará el joven su camino?");
  });

  it("incluye la apertura documentada de Lucas 1:5, sin cambiar su prólogo", () => {
    expect(displayBibleVerse("HUBO en los días de Herodes, rey de Judea;", at("Lc", 1, 5)))
      .toBe("Hubo en los días de Herodes, rey de Judea;");
    expect(displayBibleVerse("HABIENDO muchos intentado...", at("Lc", 1, 1)))
      .toBe("Habiendo muchos intentado...");
  });

  it("nunca altera la cadena original ni la numeración o los vacíos", () => {
    const original = "EN el principio crió Dios los cielos y la tierra.";
    displayBibleVerse(original, at("Gn", 1, 1));
    expect(original).toBe("EN el principio crió Dios los cielos y la tierra.");
    expect(displayBibleVerse("", at("Jon", 2, 1))).toBe("");
    expect(displayBibleVerse("Y fué la luz.", at("Gn", 1, 3))).toBe("Y fue la luz.");
  });
});


describe("lectura con ortografía actual y original inmutable", () => {
  it("corrige el ejemplo real de Lucas 1:3 sin tocar «mí»", () => {
    const original = "Me ha parecido también á mí, después de haber entendido todas las cosas";
    expect(displayBibleVerse(original, at("Lc", 1, 3)))
      .toBe("Me ha parecido también a mí, después de haber entendido todas las cosas");
    expect(original).toContain("á mí"); // el documento de origen permanece intacto
  });

  it.each([
    ["á", "a"], ["Á", "A"], ["ó", "o"], ["Ó", "O"],
    ["é", "e"], ["É", "E"], ["ú", "u"],
    ["fué", "fue"], ["Fué", "Fue"], ["FUÉ", "FUE"],
    ["fuí", "fui"], ["dió", "dio"], ["vió", "vio"],
    ["fé", "fe"], ["tí", "ti"], ["crió", "crio"], ["rió", "rio"],
  ])("normaliza solamente la palabra completa %s", (original, expected) => {
    expect(modernizeHistoricalSpelling(original)).toBe(expected);
    expect(modernizeHistoricalSpelling("palabra" + original)).toBe("palabra" + original);
    expect(modernizeHistoricalSpelling(original + "palabra")).toBe(original + "palabra");
  });

  it("conserva diacríticos vigentes y la puntuación", () => {
    const source = "Y fué á mí, ó á ti; é igualmente fué para tú, tu, él, el, más, mas, dé, de, sí, si, sé, se, aún, aun.";
    expect(modernizeHistoricalSpelling(source))
      .toBe("Y fue a mí, o a ti; e igualmente fue para tú, tu, él, el, más, mas, dé, de, sí, si, sé, se, aún, aun.");
  });

  it("respeta inscripciones, acentos dentro de otras palabras y vacíos", () => {
    expect(displayBibleVerse("SANTIDAD Á JEHOVÁ.", at("Ex", 28, 36)))
      .toBe("SANTIDAD A JEHOVÁ.");
    expect(displayBibleVerse("Mi corazón se alegró; después se levantó.", at("Sal", 1, 2)))
      .toBe("Mi corazón se alegró; después se levantó.");
    expect(displayBibleVerse("", at("Jon", 2, 1))).toBe("");
    expect(displayBibleVerse("Y escribe a SMIRNA.", at("Ap", 2, 8)))
      .toBe("Y escribe a SMIRNA.");
  });
});
