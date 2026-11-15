// Integridad del catálogo canónico (origen: auditoría Fase 0, Books.java).
// Estos invariantes son la base de la siembra y del futuro importador bíblico.

import { describe, expect, it } from "vitest";
import { BOOKS, CANONS, BOOK_BY_CODE, booksOfCanon, CATHOLIC_CANON_CODE, PROTESTANT_CANON_CODE } from "@/bible/catalog";

describe("catálogo de libros bíblicos", () => {
  it("contiene exactamente 73 libros (canon católico completo)", () => {
    expect(BOOKS).toHaveLength(73);
  });

  it("tiene códigos únicos y nombres no vacíos", () => {
    const codes = BOOKS.map((b) => b.code);
    expect(new Set(codes).size).toBe(73);
    for (const b of BOOKS) {
      expect(b.name_es.length).toBeGreaterThan(0);
      expect(b.osis_code.length).toBeGreaterThan(0);
    }
  });

  it("reparte 46 libros del Antiguo Testamento y 27 del Nuevo", () => {
    expect(BOOKS.filter((b) => b.testament === "AT")).toHaveLength(46);
    expect(BOOKS.filter((b) => b.testament === "NT")).toHaveLength(27);
  });

  it("marca exactamente los 7 libros deuterocanónicos como libros completos", () => {
    const deutero = BOOKS.filter((b) => b.deuterocanonical).map((b) => b.code);
    expect(deutero).toEqual(["Tb", "Jdt", "1M", "2M", "Sb", "Si", "Ba"]);
  });

  it("todos los deuterocanónicos pertenecen al Antiguo Testamento", () => {
    for (const b of BOOKS.filter((x) => x.deuterocanonical)) {
      expect(b.testament).toBe("AT");
    }
  });

  it("expone el canon católico (73) y el protestante (66) con los mismos nombres", () => {
    expect(booksOfCanon(CATHOLIC_CANON_CODE)).toHaveLength(73);
    const protestant = booksOfCanon(PROTESTANT_CANON_CODE);
    expect(protestant).toHaveLength(66);
    expect(protestant.some((b) => b.deuterocanonical)).toBe(false);
    // El orden relativo coincide con el orden católico.
    const catholicFiltered = BOOKS.filter((b) => !b.deuterocanonical);
    expect(protestant.map((b) => b.code)).toEqual(catholicFiltered.map((b) => b.code));
  });

  it("define los dos cánones previstos", () => {
    expect(CANONS.map((c) => c.code).sort()).toEqual(["catolica73", "protestante66"]);
  });

  it("permite consultar un libro por código", () => {
    expect(BOOK_BY_CODE.get("Jn")?.name_es).toBe("Juan");
    expect(BOOK_BY_CODE.get("inexistente")).toBeUndefined();
  });
});
