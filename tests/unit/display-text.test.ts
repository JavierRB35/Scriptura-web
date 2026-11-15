import { describe, expect, it } from "vitest";
import { displayBibleVerse, modernizeHistoricalSpelling } from "../../src/bible/display-text";
import { adaptReviewedArchaisms } from "../../src/bible/archaic-display";
import { adaptContextualLexicon, CONTEXTUAL_REVIEWED_KEYS } from "../../src/bible/contextual-modernization";

const at = (bookCode: string, chapter: number, verseNumber: number) => ({
  bookCode, chapter, verseNumber,
});

describe("normalización de mayúsculas decorativas en la lectura", () => {
  it("normaliza solo el arranque verificado del capítulo", () => {
    expect(displayBibleVerse("EN el principio crió Dios los cielos y la tierra.", at("Gn", 1, 1)))
      .toBe("En el principio creó Dios los cielos y la tierra.");
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
    ["fé", "fe"], ["tí", "ti"], ["rió", "rio"],
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


describe("modernización contextual del antiguo verbo «criar»", () => {
  it("distingue creación de crianza, sin modernización indiscriminada", () => {
    expect(displayBibleVerse("EN el principio crió Dios los cielos y la tierra.", at("Gn", 1, 1)))
      .toBe("En el principio creó Dios los cielos y la tierra.");
    expect(displayBibleVerse("Y crió Dios al hombre a su imagen; a imagen de Dios lo crió; varón y hembra los crió.", at("Gn", 1, 27)))
      .toBe("Y creó Dios al hombre a su imagen; a imagen de Dios lo creó; varón y hembra los creó.");
    expect(displayBibleVerse("Y quedóse la mujer, y crió su hijo.", at("1S", 1, 23)))
      .toBe("Y se quedó la mujer, y crio su hijo.");
    expect(displayBibleVerse("entre los leoncillos crió sus cachorros.", at("Ez", 19, 2)))
      .toBe("entre los leoncillos crio sus cachorros.");
    expect(displayBibleVerse("De la Roca que te crió te olvidaste: te has olvidado del Dios tu criador.", at("Dt", 32, 18)))
      .toBe("De la Roca que te creó te olvidaste: te has olvidado del Dios tu creador.");
  });

  it("preserva las referencias no cotejadas y la fuente original", () => {
    expect(displayBibleVerse("Él crió algo.", at("Jn", 1, 3))).toBe("Él crió algo.");
    expect(modernizeHistoricalSpelling("crió")).toBe("crió");
    const source = "EN el principio crió Dios los cielos y la tierra.";
    displayBibleVerse(source, at("Gn", 1, 1));
    expect(source).toBe("EN el principio crió Dios los cielos y la tierra.");
  });
});


describe("tanda contextual de arcaísmos cotejados", () => {
  it("actualiza el género, número y mayúsculas de los demostrativos", () => {
    expect(displayBibleVerse("como aqueste día.", { bookCode: "1Cro", chapter: 28, verseNumber: 7 }))
      .toBe("como este día.");
    expect(displayBibleVerse("de aquesta tierra.", { bookCode: "2Cro", chapter: 20, verseNumber: 7 }))
      .toBe("de esta tierra.");
    expect(displayBibleVerse("Aquestos los hijos.", { bookCode: "1Cro", chapter: 7, verseNumber: 33 }))
      .toBe("Estos los hijos.");
    expect(displayBibleVerse("Aquesta es la ley.", { bookCode: "Lv", chapter: 14, verseNumber: 57 }))
      .toBe("Esta es la ley.");
    expect(displayBibleVerse("Todo aquesto vino.", { bookCode: "Dn", chapter: 4, verseNumber: 28 }))
      .toBe("Todo esto vino.");
    expect(displayBibleVerse("de aquestas ciudades.", { bookCode: "Jos", chapter: 11, verseNumber: 14 }))
      .toBe("de estas ciudades.");
  });

  it("antepone el pronombre al verbo finito sin alterar persona", () => {
    expect(displayBibleVerse("Y viniendo Gad a David, díjole:", at("1Cro", 21, 11)))
      .toBe("Y viniendo Gad a David, le dijo:");
    expect(displayBibleVerse("Y díjoles: Vosotros sois principales.", at("1Cro", 15, 12)))
      .toBe("Y les dijo: Vosotros sois principales.");
    expect(displayBibleVerse("Díjome que vivirás.", at("2R", 8, 14)))
      .toBe("Me dijo que vivirás.");
    expect(displayBibleVerse("Y respondióle Faraón: ¿Por qué?", at("1R", 11, 22)))
      .toBe("Y le respondió Faraón: ¿Por qué?");
    expect(displayBibleVerse("Y quedóse la mujer.", at("1S", 1, 23)))
      .toBe("Y se quedó la mujer.");
  });

  it("admite dos transformaciones en el mismo versículo", () => {
    const original = "Refirióle su mujer aquestas cosas, y quedóse como una piedra.";
    expect(displayBibleVerse(original, at("1S", 25, 37)))
      .toBe("Refirióle su mujer estas cosas, y se quedó como una piedra.");
    expect(original).toContain("aquestas cosas");
  });

  it("no toca referencias sin cotejar ni «llamóle»", () => {
    expect(adaptReviewedArchaisms("Aqueste hombre díjole.", at("Jn", 1, 1)))
      .toBe("Aqueste hombre díjole.");
    expect(displayBibleVerse("Y llamóle Peres.", at("1Cro", 7, 16)))
      .toBe("Y llamóle Peres.");
  });
});


describe("tanda 3: léxico, locuciones y nombres cotejados", () => {
  it("coteja género y referente de los cinco «llamóle»", () => {
    expect(displayBibleVerse("y llamóle Peres", at("1Cro", 7, 16))).toBe("y lo llamó Peres");
    expect(displayBibleVerse("y llamóle por nombre Nehustán", at("2R", 18, 4))).toBe("y la llamó Nehustán");
    expect(displayBibleVerse("y llamóle: El Dios de Israel", at("Gn", 33, 20))).toBe("y lo llamó: El Dios de Israel");
    expect(displayBibleVerse("y llamóle por nombre Samsón", at("Jc", 13, 24))).toBe("y lo llamó Samsón");
    expect(displayBibleVerse("y llamóle Noba", at("Nm", 32, 42))).toBe("y la llamó Noba");
  });

  it("conserva concordancia de género y fórmulas de agradecimiento", () => {
    expect(displayBibleVerse("en el hacimiento de gracias", at("2Co", 4, 15)))
      .toBe("en la acción de gracias");
    expect(displayBibleVerse("con todo hacimiento de gracias", at("Hch", 24, 3)))
      .toBe("con toda acción de gracias");
    expect(displayBibleVerse("sacrificio de hacimiento de gracias", at("Lv", 22, 29)))
      .toBe("sacrificio de acción de gracias");
    expect(displayBibleVerse("en hacimiento de gracias, sacrificio de hacimiento de gracias", at("Lv", 7, 12)))
      .toBe("en acción de gracias, sacrificio de acción de gracias");
  });

  it("moderniza necesidad y orientación sin añadir información", () => {
    expect(displayBibleVerse("Porque es menester que él reine.", at("1Co", 15, 25)))
      .toBe("Porque es necesario que él reine.");
    expect(displayBibleVerse("¿qué es menester que yo haga?", at("Hch", 16, 30)))
      .toBe("¿qué es necesario que yo haga?");
    expect(displayBibleVerse("enemigos en derredor;", at("1Cro", 22, 9)))
      .toBe("enemigos alrededor;");
    expect(displayBibleVerse("En derredor tendrá dieciocho mil cañas.", at("Ez", 48, 35)))
      .toBe("Alrededor tendrá dieciocho mil cañas.");
  });

  it("sustituye jóvenes solo donde se ha contrastado el referente", () => {
    expect(displayBibleVerse("Os escribo a vosotros, mancebos.", at("1Jn", 2, 13)))
      .toBe("Os escribo a vosotros, jóvenes.");
    expect(displayBibleVerse("Mancebo, a ti digo.", at("Lc", 7, 14)))
      .toBe("Joven, a ti digo.");
    expect(adaptContextualLexicon("tomará vuestros buenos mancebos", at("1S", 8, 16)))
      .toBe("tomará vuestros buenos mancebos");
    expect(adaptContextualLexicon("sus mancebos", at("Nm", 11, 28)))
      .toBe("sus mancebos");
  });

  it("distingue alimentación corriente de lenguaje ritual", () => {
    expect(displayBibleVerse("Y no vianda", at("1Co", 3, 2)))
      .toBe("Y no alimento sólido");
    expect(displayBibleVerse("la misma vianda espiritual", at("1Co", 10, 3)))
      .toBe("el mismo alimento espiritual");
    expect(displayBibleVerse("Mas la vianda firme", at("Hb", 5, 14)))
      .toBe("Mas el alimento sólido");
    expect(displayBibleVerse("las viandas que son sacrificadas", at("1Co", 8, 4)))
      .toBe("los alimentos que son sacrificados");
    expect(displayBibleVerse("comprar viandas", at("Lc", 9, 13)))
      .toBe("comprar comida");
    expect(adaptContextualLexicon("vianda de ofrenda encendida", at("Lv", 3, 11)))
      .toBe("vianda de ofrenda encendida");
  });

  it("limita la transformación a 198 referencias y conserva las cadenas fuente", () => {
    expect(CONTEXTUAL_REVIEWED_KEYS.size).toBe(198);
    const original = "Por nada estéis afanosos; sino con hacimiento de gracias.";
    expect(adaptContextualLexicon(original, at("Flp", 4, 6)))
      .toBe("Por nada estéis afanosos; sino con acción de gracias.");
    expect(original).toContain("hacimiento de gracias");
    expect(adaptContextualLexicon(original, at("Gn", 1, 1))).toBe(original);
  });
});
