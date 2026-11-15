// Pruebas de integridad bíblica contra la base de datos real (§22.5).
// Requieren DATABASE_URL y la importación completada (en CI se ejecuta el
// importador antes de estas pruebas).

import { beforeAll, describe, expect, it } from "vitest";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
const d = describe.skipIf(!DATABASE_URL);

let client: pg.Client;

beforeAll(async () => {
  client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
});

d("integridad de la edición publicada (RV1909)", () => {
  it("tiene exactamente 66 libros, 1.189 capítulos y 31.102 versículos", async () => {
    const { rows } = await client.query<{
      books: number;
      chapters: number;
      verses: number;
    }>(
      `SELECT
         (SELECT count(*)::int FROM edition_books eb JOIN bible_editions e ON e.id = eb.edition_id
           WHERE e.identifier = 'spaRV1909') AS books,
         (SELECT count(*)::int FROM bible_chapters ch JOIN bible_editions e ON e.id = ch.edition_id
           WHERE e.identifier = 'spaRV1909') AS chapters,
         (SELECT count(*)::int FROM bible_verses v JOIN bible_chapters ch ON ch.id = v.chapter_id
           JOIN bible_editions e ON e.id = ch.edition_id
           WHERE e.identifier = 'spaRV1909') AS verses`
    );
    expect(rows[0].books).toBe(66);
    expect(rows[0].chapters).toBe(1189);
    expect(rows[0].verses).toBe(31102);
  });

  it("registra exactamente los 18 versículos sin texto como advertencias del lote", async () => {
    const empty = await client.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM bible_verses v
         JOIN bible_chapters ch ON ch.id = v.chapter_id
         JOIN bible_editions e ON e.id = ch.edition_id
        WHERE e.identifier = 'spaRV1909' AND v.text_content = ''`
    );
    const batch = await client.query<{ w: number }>(
      `SELECT jsonb_array_length(warnings) AS w
         FROM bible_import_batches WHERE status = 'completed' ORDER BY started_at DESC LIMIT 1`
    );
    expect(empty.rows[0].n).toBe(18);
    expect(batch.rows[0].w).toBe(18);
  });

  it.each([
    ["Gn", 1, 1, "EN el principio crió Dios los cielos y la tierra."],
    ["Jn", 3, 16, "Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito"],
    ["Sal", 23, 1, "Salmo de David. JEHOVÁ es mi pastor; nada me faltará."],
    ["Ap", 22, 21, "La gracia de nuestro Señor Jesucristo sea con todos vosotros. Amén."],
  ])("texto de control %s %s:%s", async (code, chapter, verse, expected) => {
    const { rows } = await client.query<{ t: string }>(
      `SELECT v.text_content AS t
         FROM bible_verses v
         JOIN bible_chapters ch ON ch.id = v.chapter_id
         JOIN biblical_books b ON b.id = ch.book_id
         JOIN bible_editions e ON e.id = ch.edition_id
        WHERE e.identifier = 'spaRV1909' AND b.code = $1
          AND ch.chapter_number = $2 AND v.verse_number = $3`,
      [code, chapter, verse]
    );
    expect(rows[0].t.startsWith(expected)).toBe(true);
  });

  it("conserva caracteres especiales del español (á É ñ ¿ ¡)", async () => {
    const { rows } = await client.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM bible_verses v
         JOIN bible_chapters ch ON ch.id = v.chapter_id
         JOIN bible_editions e ON e.id = ch.edition_id
        WHERE e.identifier = 'spaRV1909'
          AND (v.text_content LIKE '%ñ%' OR v.text_content LIKE '%É%' OR v.text_content LIKE '%¿%')`
    );
    expect(rows[0].n).toBeGreaterThan(1000);
  });

  it("la numeración de versículos es secuencial en todos los capítulos", async () => {
    const { rows } = await client.query<{ bad: number }>(
      `WITH seq AS (
         SELECT v.verse_number,
                row_number() OVER (PARTITION BY v.chapter_id ORDER BY v.verse_number) AS pos
           FROM bible_verses v
           JOIN bible_chapters ch ON ch.id = v.chapter_id
           JOIN bible_editions e ON e.id = ch.edition_id
          WHERE e.identifier = 'spaRV1909'
       )
       SELECT count(*)::int AS bad FROM seq WHERE verse_number <> pos`
    );
    expect(rows[0].bad).toBe(0);
  });
});
