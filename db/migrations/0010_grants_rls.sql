-- 0010 — Concesiones y Row Level Security (§4.1, §18.6, §18.7)
-- Principios:
--   1. La Biblia publicada es legible por cualquiera (D06); ediciones no publicadas, no.
--   2. El contenido comunitario NO es accesible para anónimos en la capa de datos.
--   3. Las tablas operativas (correo, auditoría, moderación interna, consumo IA)
--      no reciben concesiones: solo el servidor de Scriptura (conexión propietaria).
-- La aplicación aplica además autorización en la capa de servidor (defensa en profundidad).
-- Las políticas se ampliarán con los flujos completos de la Fase 3/4; aquí queda el
-- aislamiento básico exigido por §18.7.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon, authenticated;

-- ─── Biblioteca bíblica: lectura pública de lo publicado ─────────────────────
ALTER TABLE bible_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblical_canons ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblical_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_reference_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_import_batches ENABLE ROW LEVEL SECURITY; -- sin políticas: solo servidor

CREATE POLICY bible_sources_read ON bible_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY bible_canons_read ON biblical_canons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY bible_books_read ON biblical_books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY canon_books_read ON canon_books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY bible_editions_read ON bible_editions
  FOR SELECT TO anon, authenticated USING (publication_status = 'published');
CREATE POLICY edition_books_read ON edition_books
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM bible_editions e WHERE e.id = edition_id AND e.publication_status = 'published'));
CREATE POLICY bible_chapters_read ON bible_chapters
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM bible_editions e WHERE e.id = edition_id AND e.publication_status = 'published'));
CREATE POLICY bible_verses_read ON bible_verses
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM bible_chapters c
    JOIN bible_editions e ON e.id = c.edition_id
    WHERE c.id = chapter_id AND e.publication_status = 'published'
  ));
CREATE POLICY verse_reference_mappings_read ON verse_reference_mappings
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM bible_editions e
    WHERE e.id IN (from_edition_id, to_edition_id) AND e.publication_status = 'published'
  ));

GRANT SELECT ON bible_sources, biblical_canons, biblical_books, canon_books,
  bible_editions, edition_books, bible_chapters, bible_verses, verse_reference_mappings
  TO anon, authenticated;

-- ─── Perfiles y preferencias: datos personales mínimos visibles ──────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Un miembro solo ve de otros perfiles las columnas concedidas abajo (no email,
-- no preferencias, no historial: history_public queda fuera de la concesión).
CREATE POLICY profiles_self_full ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_public_minimal ON profiles FOR SELECT TO authenticated USING (id <> auth.uid());
GRANT SELECT (id, alias, avatar_url, joined_at, is_suspended) ON profiles TO authenticated;

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_preferences_self ON user_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON user_preferences TO authenticated;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_roles_self ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON user_roles TO authenticated;

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_consents_self ON user_consents FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON user_consents TO authenticated;

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY; -- tramitación solo servidor

-- ─── Comunidad: solo miembros registrados ────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_read_published ON comments
  FOR SELECT TO authenticated USING (true); -- el filtro de estado se afina en Fase 3 (moderación)
CREATE POLICY comments_insert_own ON comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY comments_update_own ON comments
  FOR UPDATE TO authenticated USING (author_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON comments TO authenticated;

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY comment_likes_read ON comment_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY comment_likes_insert_own ON comment_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY comment_likes_delete_own ON comment_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid());
GRANT SELECT, INSERT, DELETE ON comment_likes TO authenticated;

ALTER TABLE passage_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY passage_favorites_self ON passage_favorites
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, DELETE ON passage_favorites TO authenticated;

ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY debates_read ON debates
  FOR SELECT TO authenticated
  USING (status = 'published' OR author_id = auth.uid());
GRANT SELECT ON debates TO authenticated;

ALTER TABLE debate_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY debate_passages_read ON debate_passages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM debates d WHERE d.id = debate_id AND d.status = 'published'));
GRANT SELECT ON debate_passages TO authenticated;

ALTER TABLE debate_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY debate_comments_read ON debate_comments
  FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY debate_comments_insert_own ON debate_comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY debate_comments_update_own ON debate_comments
  FOR UPDATE TO authenticated USING (author_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON debate_comments TO authenticated;

ALTER TABLE debate_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY debate_proposals_self ON debate_proposals
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON debate_proposals TO authenticated;

ALTER TABLE debate_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY debate_follows_self ON debate_follows
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, DELETE ON debate_follows TO authenticated;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_self ON notifications
  FOR SELECT TO authenticated USING (recipient_id = auth.uid());
GRANT SELECT ON notifications TO authenticated;

-- ─── Reputación ───────────────────────────────────────────────────────────────
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY reputation_events_self ON reputation_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON reputation_events TO authenticated;

ALTER TABLE user_recognitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_recognitions_self ON user_recognitions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON user_recognitions TO authenticated;

ALTER TABLE recognition_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY recognition_levels_read ON recognition_levels
  FOR SELECT TO authenticated USING (active);
GRANT SELECT ON recognition_levels TO authenticated;

ALTER TABLE reputation_rules ENABLE ROW LEVEL SECURITY; -- administración solo servidor
ALTER TABLE reputation_adjustments ENABLE ROW LEVEL SECURITY;

-- ─── Moderación: tramitación solo servidor/moderadores (políticas en Fase 4) ──
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;

-- ─── IA: documentos aprobados consultables; consumo solo servidor ────────────
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_sources_read ON knowledge_sources
  FOR SELECT TO authenticated USING (true);
GRANT SELECT ON knowledge_sources TO authenticated;

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_documents_read ON knowledge_documents
  FOR SELECT TO authenticated USING (editorial_state = 'approved');
GRANT SELECT ON knowledge_documents TO authenticated;

ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_chunks_read ON knowledge_chunks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM knowledge_documents d WHERE d.id = document_id AND d.editorial_state = 'approved'));
GRANT SELECT ON knowledge_chunks TO authenticated;

ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY; -- solo servidor
ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;      -- solo servidor
ALTER TABLE ai_source_references ENABLE ROW LEVEL SECURITY; -- solo servidor

-- ─── Liturgia: referencias públicas; suscripciones y envíos solo servidor ────
ALTER TABLE liturgical_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE liturgical_celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE liturgical_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE liturgical_reading_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY liturgical_calendars_read ON liturgical_calendars
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY liturgical_celebrations_read ON liturgical_celebrations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY liturgical_readings_read ON liturgical_readings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY liturgical_reading_variants_read ON liturgical_reading_variants
  FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON liturgical_calendars, liturgical_celebrations,
  liturgical_readings, liturgical_reading_variants TO anon, authenticated;

ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;      -- solo servidor
ALTER TABLE email_subscription_tokens ENABLE ROW LEVEL SECURITY; -- solo servidor
ALTER TABLE daily_email_jobs ENABLE ROW LEVEL SECURITY;          -- solo servidor
ALTER TABLE email_delivery_attempts ENABLE ROW LEVEL SECURITY;   -- solo servidor
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;           -- solo servidor

-- ─── Sistema: solo servidor ───────────────────────────────────────────────────
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_usage ENABLE ROW LEVEL SECURITY;
