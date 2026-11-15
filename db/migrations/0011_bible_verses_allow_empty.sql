-- 0011 — Versículos sin texto en la edición (numeración inglesa)
-- La fuente USFM de RV1909 (ebible.org) contiene 18 marcadores de versículo
-- sin texto: números que existen en la versificación inglesa pero cuyo
-- contenido forma parte del versículo anterior en esta edición (p. ej.
-- Jon 1:17 → 2:1). Se conservan como texto vacío para no desplazar la
-- numeración y para que la interfaz pueda explicarlo con honestidad (§5.2, §5.3).
-- El importador los registra como advertencias en bible_import_batches.

ALTER TABLE bible_verses DROP CONSTRAINT bible_verses_text_content_check;
ALTER TABLE bible_verses ADD CONSTRAINT bible_verses_text_content_check
  CHECK (char_length(text_content) >= 0);
