-- 0013 — reply_count también al retirar el comentario padre (Fase 3)
-- Al marcar un comentario raíz como retirado (deleted_at), sus respuestas
-- dejan de contarse; el trigger debe recalcular el propio comentario
-- actualizado, no solo al padre de una respuesta nueva.

CREATE OR REPLACE FUNCTION public.sync_comment_reply_count() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  target uuid;
BEGIN
  -- Comentario cuyo recuento de respuestas debe recalcularse:
  -- el padre de una respuesta nueva/borrada, o el propio raíz actualizado
  -- (p. ej. al retirarlo).
  IF TG_OP = 'UPDATE' THEN
    target := NEW.id;            -- el propio (retirada, restauración, estado)
  ELSE
    target := COALESCE(NEW.parent_id, OLD.parent_id); -- respuesta insertada/borrada
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
