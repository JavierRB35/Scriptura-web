// Pruebas del parser de referencias y slugs (§6.1).

import { describe, expect, it } from "vitest";
import { parseReference } from "@/bible/reference";
import { slugify, BOOK_BY_SLUG, slugOf } from "@/bible/slug";

describe("parseReference", () => {
  it.each([
    ["Jn 3:16", { code: "Jn", chapter: 3, verseStart: 16 }],
    ["juan 3.16", { code: "Jn", chapter: 3, verseStart: 16 }],
    ["Juan 3,16", { code: "Jn", chapter: 3, verseStart: 16 }],
    ["1 Corintios 13:1-7", { code: "1Co", chapter: 13, verseStart: 1, verseEnd: 7 }],
    ["1 cor 13", { code: "1Co", chapter: 13 }],
    ["genesis", { code: "Gn" }],
    ["Génesis 1", { code: "Gn", chapter: 1 }],
    ["sal 23", { code: "Sal", chapter: 23 }],
    ["Apocalipsis 22:21", { code: "Ap", chapter: 22, verseStart: 21 }],
  ])("«%s» → %j", (input, expected) => {
    const r = parseReference(input);
    expect(r).toMatchObject(expected);
    expect(Object.keys(r ?? {}).length).toBe(Object.keys(expected).length);
  });

  it("devuelve null para libros inexistentes (sin inventar)", () => {
    expect(parseReference("foobar 3:16")).toBeNull();
    expect(parseReference("")).toBeNull();
    expect(parseReference("zz")).toBeNull();
  });

  it("ordena rangos invertidos", () => {
    expect(parseReference("Jn 3:17-16")).toEqual({
      code: "Jn",
      chapter: 3,
      verseStart: 16,
      verseEnd: 17,
    });
  });
});

describe("slugs de libros", () => {
  it("normaliza acentos, mayúsculas y espacios", () => {
    expect(slugify("Génesis")).toBe("genesis");
    expect(slugify("1 Corintios")).toBe("1-corintios");
    expect(slugify("Cantar de los Cantares")).toBe("cantar-de-los-cantares");
  });

  it("cubre los 73 libros del catálogo sin colisiones", () => {
    expect(BOOK_BY_SLUG.size).toBe(73);
    expect(BOOK_BY_SLUG.get("genesis")?.code).toBe("Gn");
    expect(BOOK_BY_SLUG.get("1-macabeos")?.code).toBe("1M");
  });

  it("slugOf funciona por código", () => {
    expect(slugOf("Jn")).toBe("juan");
  });
});
