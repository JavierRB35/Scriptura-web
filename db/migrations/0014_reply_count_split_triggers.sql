-- 0014 — Corrección de triggers de reply_count y robustez de auth.uid()
-- Problema real detectado por las pruebas: recalcular en UPDATE del propio
-- comentario provoca recursión infinita (el UPDATE interno re-dispara el
-- trigger). Solución: dos triggers con columnas distintas —
--   a) INSERT/DELETE de una respuesta → recalcula al PADRE;
--   b) UPDATE OF deleted_at, status de un raíz → recalcula al PROPIO
--      (el UPDATE interno solo toca reply_count y no re-dispara b).

DROP TRIGGER IF EXISTS trg_comments_reply_count ON comments;

CREATE OR REPLACE FUNCTION public.sync_comment_reply_count() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  target uuid;
BEGIN
  IF TG_OP IN ('INSERT', 'DELETE') THEN
    target := COALESCE(NEW.parent_id, OLD.parent_id);
  ELSE -- UPDATE OF deleted_at/status: el propio comentario
    target := NEW.id;
  END IF;
  IF target IS NOT NULL THEN
    UPDATE comments SET reply_count = (
      SELECT count(*) FROM comments c
      WHERE c.parent_id = target AND c.deleted_at IS NULL AND c.status <> 'removed'
    ) WHERE id = target;
  END IF;
  RETURN NULL;
END
$$;

CREATE TRIGGER trg_comments_reply_count_parent
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_reply_count();

CREATE TRIGGER trg_comments_reply_count_self
  AFTER UPDATE OF deleted_at, status ON comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_reply_count();

-- auth.uid() tolerante a GUC vacía (necesario en PostgreSQL estándar cuando
-- la transacción con set_config se revierte). Solo se sustituye el stub
-- propio: en Supabase existe auth.sessions y su auth.uid() no se toca.
DO $outer$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'sessions') THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE AS $inner$
        SELECT nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid
      $inner$
    $fn$;
  END IF;
END
$outer$;
