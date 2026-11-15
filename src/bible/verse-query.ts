// Consulta compartida y comprobable del lector bíblico.
// PostgreSQL devuelve los alias entre comillas exactamente como los usa
// VerseRow (TypeScript). Sin ellos llegan verse_number/verse_key, y la interfaz
// pierde numeración, anclajes y selección contextual.
export const CHAPTER_VERSES_SQL = `
  SELECT v.verse_number AS "verseNumber",
         v.verse_key AS "verseKey",
         v.text_content AS "text"
    FROM bible_verses v
    JOIN bible_chapters ch ON ch.id = v.chapter_id
   WHERE ch.edition_id = $1
     AND ch.book_id = (SELECT id FROM biblical_books WHERE code = $2)
     AND ch.chapter_number = $3
   ORDER BY v.verse_number
`;
