-- 0016 — IA: búsqueda léxica sobre chunks y versículos + cuota diaria (Fase 5, §12)
-- La recuperación funciona sin proveedor de IA mediante búsqueda de texto
-- completo (tsvector + GIN); los embeddings pgvector la mejoran cuando hay
-- proveedor configurado. La cuota diaria vive en system_settings (§12.6).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', content)) STORED;
CREATE INDEX IF NOT EXISTS knowledge_chunks_tsv_idx ON knowledge_chunks USING GIN (tsv);

ALTER TABLE bible_verses ADD COLUMN IF NOT EXISTS tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', text_content)) STORED;
CREATE INDEX IF NOT EXISTS bible_verses_tsv_idx ON bible_verses USING GIN (tsv);

INSERT INTO system_settings (key, value, description)
VALUES ('ai_daily_user_quota', '20', 'Máximo de consultas del asistente de lectura por usuario y día (§12.6).')
ON CONFLICT (key) DO NOTHING;
