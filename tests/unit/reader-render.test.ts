import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Literata: () => ({ className: "literata-test" }),
}));

import { ReaderClient } from "@/bible/ui/reader-client";

const verses = [
  { verseNumber: 1, verseKey: "1", text: "EN el principio crió Dios los cielos y la tierra." },
  { verseNumber: 2, verseKey: "2", text: "Y la tierra estaba desordenada y vacía." },
  { verseNumber: 3, verseKey: "3", text: "" },
];

const props = {
  slug: "genesis",
  bookName: "Génesis",
  bookCode: "Gn",
  chapter: 1,
  editionAbbr: "RV1909",
  editionIdentifier: "spaRV1909",
  editionId: "edicion-test",
  verses,
  initialRange: null,
  user: null,
  comments: [],
};

describe("V17: numeración, separación y fidelidad del lector", () => {
  it("identifica de forma visible que la lectura usa ortografía actual", () => {
    const html = renderToStaticMarkup(createElement(ReaderClient, props));
    expect(html).toContain("ort. actual");
  });

  it("no modifica el texto católico usando transformaciones específicas de RV1909", () => {
    const html = renderToStaticMarkup(createElement(ReaderClient, {
      ...props,
      editionAbbr: "TA",
      editionIdentifier: "spaTorresAmat1835",
    }));
    expect(html).toContain("EN el principio crió Dios los cielos y la tierra.");
    expect(html).not.toContain("ort. actual");
  });

  it("normaliza la preposición de un versículo real sin cambiar el objeto de datos", () => {
    const historical = "Me ha parecido también á mí, después de haber entendido";
    const html = renderToStaticMarkup(createElement(ReaderClient, {
      ...props,
      bookCode: "Lc",
      bookName: "Lucas",
      verses: [{ verseNumber: 3, verseKey: "3", text: historical }],
    }));
    expect(html).toContain("Me ha parecido también a mí, después de haber entendido");
    expect(html).not.toContain("á mí");
    expect(historical).toContain("á mí");
  });

  it("aplica una sola letra capitular, exclusivamente al versículo 1", () => {
    const html = renderToStaticMarkup(createElement(ReaderClient, props));
    const antesDelSegundo = html.split('data-verse-number="2"')[0];
    const despuesDelSegundo = html.split('data-verse-number="2"')[1];

    expect(antesDelSegundo).toContain("first-letter:float-left");
    expect(despuesDelSegundo).not.toContain("first-letter:float-left");
    expect(html.match(/first-letter:float-left/g)).toHaveLength(1);
  });


  it("renderiza cada versículo numerado en bloque independiente y sin alterar el original", () => {
    const html = renderToStaticMarkup(createElement(ReaderClient, props));

    expect(html.match(/data-verse-number="\d+"/g)).toEqual([
      'data-verse-number="1"',
      'data-verse-number="2"',
      'data-verse-number="3"',
    ]);
    expect((html.match(/<p\b/g) ?? []).length).toBe(3);
    expect(html).toContain('aria-label="Seleccionar versículo 1"');
    expect(html).toContain('aria-label="Seleccionar versículo 2"');
    expect(html).toContain('aria-label="Seleccionar versículo 3"');
    expect(html).toContain("En el principio creó Dios los cielos y la tierra.");
    expect(html).toContain("Y la tierra estaba desordenada y vacía.");
    expect(html).toContain("Este versículo no tiene texto independiente");
    expect(html).not.toContain('id="vundefined"');
  });

  it("mantiene el pasaje seleccionado y la separación en el resumen contextual", () => {
    const html = renderToStaticMarkup(createElement(ReaderClient, {
      ...props,
      initialRange: { start: 1, end: 2 },
    }));
    expect(html).toContain("Génesis 1:1-2");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("whitespace-pre-line");
    expect(html).toContain("En el principio creó Dios los cielos y la tierra.");
  });
});
