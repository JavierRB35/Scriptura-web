-- 0012 — Comunidad: trazabilidad de eventos de reputación y visibilidad (Fase 3)
-- 1. reputation_events.gana source_user_id para identificar la acción concreta
--    (p. ej. quién dio el like); la idempotencia por origen se garantiza en la
--    capa de servicio dentro de la transacción, porque varios dadores de like
--    generan varios eventos legítimos sobre el mismo comentario.
-- 2. Políticas refinadas: los miembros solo ven comentarios publicados (o los
--    propios en cualquier estado); ídem intervenciones de debate.

ALTER TABLE reputation_events DROP CONSTRAINT IF EXISTS reputation_events_source_idx;
DROP INDEX IF EXISTS reputation_events_source_idx;

ALTER TABLE reputation_events
  ADD COLUMN IF NOT EXISTS source_user_id uuid REFERENCES profiles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reputation_events_source_user_idx
  ON reputation_events (source_type, source_id, source_user_id);

DROP POLICY IF EXISTS comments_read_published ON comments;
CREATE POLICY comments_visible ON comments
  FOR SELECT TO authenticated
  USING (
    (status = 'published' AND deleted_at IS NULL)
    OR author_id = auth.uid()
  );

DROP POLICY IF EXISTS comments_update_own ON comments;
CREATE POLICY comments_update_own ON comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS debate_comments_read ON debate_comments;
CREATE POLICY debate_comments_visible ON debate_comments
  FOR SELECT TO authenticated
  USING (status = 'published' OR author_id = auth.uid());
