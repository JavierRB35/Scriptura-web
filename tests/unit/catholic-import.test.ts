import { describe, expect, it } from "vitest";
import raw from "@/bible/catalog.json";
import {
  CATHOLIC_EDITION_ID,
  CATHOLIC_EXPECTED_CHAPTERS,
  validateCatholicWitness,
  type CatholicWitness
} from "@/bible/catholic-import";

// Datos sintéticos EXCLUSIVAMENTE en tests; no se publican ni se importan.
function fixture(): CatholicWitness {
  return {
    edition: CATHOLIC_EDITION_ID,
    source: {
      title: "Testigo histórico de prueba",
      edition_year: "1835",
      original_url: "https://example.org/original",
      transcription_url: "https://example.org/transcription",
      transcription_rights: "Prueba unitaria",
      proofread: true
    },
    books: raw.books.map(b => ({
      code: b.code,
      chapters: Array.from({ length: CATHOLIC_EXPECTED_CHAPTERS[b.code] }, (_, i) => ({
        number: i + 1,
        verses: Array.from({ length: 26 }, (_, j) => ({
          number: j + 1,
          text: `Versículo de prueba ${j + 1}`
        }))
      }))
    }))
  };
}
const codes = raw.books.map(b=>b.code);

describe("validación del canon católico íntegro", () => {
  it("exige 73 libros, 1334 capítulos y numeración efectiva", () => {
    const f = fixture();
    expect(validateCatholicWitness(f, codes)).toEqual({
      books: 73, chapters: 1334, verses: 1334 * 26
    });
    expect(f.books.find(b=>b.code==="Est")?.chapters).toHaveLength(16);
    expect(f.books.find(b=>b.code==="Dn")?.chapters).toHaveLength(14);
    expect(f.books.find(b=>b.code==="Ba")?.chapters).toHaveLength(6);
  });
  it("no acepta el canon protestante ni ausencia de deuterocanónicos", () => {
    const f = fixture();
    f.books = f.books.filter(b=>b.code !== "Tb");
    expect(()=>validateCatholicWitness(f,codes)).toThrow(/73 libros/);
  });
  it("no declara completa una edición sin los añadidos de Ester o Daniel", () => {
    const f = fixture();
    f.books.find(b=>b.code==="Est")!.chapters.pop();
    expect(()=>validateCatholicWitness(f,codes)).toThrow(/Est.*16/);
    const g = fixture();
    g.books.find(b=>b.code==="Dn")!.chapters.pop();
    expect(()=>validateCatholicWitness(g,codes)).toThrow(/Dn.*14/);
  });
  it("rechaza saltos, texto vacío o falta de cotejo editorial", () => {
    const f = fixture();
    f.books[0].chapters[0].verses[3].number = 8;
    expect(()=>validateCatholicWitness(f,codes)).toThrow(/salto/);
    const g = fixture();
    g.books[0].chapters[0].verses[1].text = " ";
    expect(()=>validateCatholicWitness(g,codes)).toThrow(/inválido/);
    const h = fixture();
    h.source.proofread = false;
    expect(()=>validateCatholicWitness(h,codes)).toThrow(/revisión editorial/);
  });
});
