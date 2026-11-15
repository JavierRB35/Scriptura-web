import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getLibraryBook, getLibraryBooks } from "@/library/catalog";
import {
  parseLibraryMarkdown,
  splitNumberedParagraph,
  tokenizeLibraryInline,
} from "@/library/markdown";

describe("Biblioteca documental", () => {
  it("expone las seis traducciones reales a partir del manifiesto", () => {
    const books = getLibraryBooks();
    expect(books.length).toBeGreaterThanOrEqual(6);
    expect(["thomas", "mary", "peter", "infancyjames", "infancythomas", "judas"]
      .every((id) => books.some((book) => book.id === id))).toBe(true);
    expect(new Set(books.map((book) => book.id)).size).toBe(6);
    expect(books.filter((book) => ["thomas", "mary", "peter", "infancyjames", "infancythomas", "judas"].includes(book.id))
      .every((book) => book.draft)).toBe(true);
    expect(books.every((book) => book.description.length > 15)).toBe(true);
    expect(books.every((book) => book.sourceUrl.startsWith("https://"))).toBe(true);
    // Las futuras portadas son opcionales; nunca deben bloquear la lectura.
    for (const book of books) {
      expect(getLibraryBook(book.id)?.id).toBe(book.id);
      const text = readFileSync(join(process.cwd(), "data", "apocrypha", book.sourceFile), "utf8");
      expect(text.length).toBeGreaterThan(0);
      if (["thomas", "mary", "peter", "infancyjames", "infancythomas", "judas"].includes(book.id)) {
        expect(text).toContain("Traducción española de trabajo");
      }
    }
    expect(getLibraryBook("../manifest.json")).toBeUndefined();
    expect(getLibraryBook("inventado")).toBeUndefined();
  });

  it("interpreta un único lector para los seis formatos originales", () => {
    for (const book of getLibraryBooks()) {
      const text = readFileSync(join(process.cwd(), "data", "apocrypha", book.sourceFile), "utf8");
      const doc = parseLibraryMarkdown(text);
      expect(doc.blocks.length).toBeGreaterThan(0);
      expect(new Set(doc.outline.map((item) => item.id)).size).toBe(doc.outline.length);
    }
  });

  it("mantiene enlaces internos a los 114 dichos de Tomás", () => {
    const text = readFileSync(join(process.cwd(), "data", "apocrypha", "es", "thomas.md"), "utf8");
    const doc = parseLibraryMarkdown(text);
    const sayings = doc.outline.filter((item) => item.id.startsWith("dicho-"));
    expect(sayings).toHaveLength(114);
    expect(sayings[0].id).toBe("dicho-1");
    expect(sayings[113].id).toBe("dicho-114");
  });

  it("no pierde la variante alternativa del Protoevangelio de Santiago", () => {
    const text = readFileSync(join(process.cwd(), "data", "apocrypha", "es", "infancyjames.md"), "utf8");
    const doc = parseLibraryMarkdown(text);
    expect(doc.outline.some((item) => item.id === "capitulo-18")).toBe(true);
    expect(doc.outline.some((item) => item.id === "capitulo-18-alternativo")).toBe(true);
    expect(doc.outline.some((item) => item.id === "capitulo-21-alternativo")).toBe(true);
  });

  it("separa cada número textual de Pedro sin alterar su secuencia", () => {
    const text = readFileSync(join(process.cwd(), "data", "apocrypha", "es", "peter.md"), "utf8");
    const doc = parseLibraryMarkdown(text);
    const numbers = doc.blocks.filter((block) => block.kind === "paragraph" && block.number !== undefined)
      .map((block) => block.kind === "paragraph" ? block.number : undefined);
    expect(numbers).toEqual(Array.from({ length: 60 }, (_, index) => index + 1));
  });

  it("conserva las páginas de María y Judas como marcas textuales, no versículos", () => {
    for (const id of ["mary", "judas"]) {
      const text = readFileSync(join(process.cwd(), "data", "apocrypha", "es", id + ".md"), "utf8");
      const doc = parseLibraryMarkdown(text);
      expect(doc.blocks.some((block) => block.kind === "paragraph" && block.text.includes("⟦p. "))).toBe(true);
    }
  });

  it("interpreta marcadores de párrafos y Markdown sin ejecutar HTML", () => {
    expect(splitNumberedParagraph("Introducción (1) Uno. (2) Dos.")).toEqual([
      { kind: "paragraph", text: "Introducción" },
      { kind: "paragraph", number: 1, text: "Uno." },
      { kind: "paragraph", number: 2, text: "Dos." },
    ]);
    const tokens = tokenizeLibraryInline("**Nota** y <script>alert(1)</script>");
    expect(tokens).toEqual([
      { kind: "strong", value: "Nota" },
      { kind: "text", value: " y <script>alert(1)</script>" },
    ]);
  });
});
