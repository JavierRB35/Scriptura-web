-- 0005 — Comunidad: comentarios, respuestas, likes, favoritos, debates, notificaciones (§16.3, §7, §8, §14)
-- Los comentarios referencian pasajes estructurados (libro/capítulo/versículos/edición),
-- no cadenas de texto sin validar. La validación de existencia del pasaje contra
-- bible_verses se realiza en la capa de servidor al publicar (Fase 2, con datos cargados).

CREATE TABLE comments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  parent_id      uuid REFERENCES comments (id) ON DELETE CASCADE, -- null = comentario raíz; valor = respuesta (profundidad 1)
  book_id        uuid NOT NULL REFERENCES biblical_books (id) ON DELETE RESTRICT,
  chapter_number integer NOT NULL CHECK (chapter_number > 0),
  verse_start    integer NOT NULL CHECK (verse_start > 0),
  verse_end      integer NOT NULL CHECK (verse_end >= verse_start),
  edition_id     uuid REFERENCES bible_editions (id) ON DELETE SET NULL, -- edición de referencia
  body           text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  status         text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  moderation_reason text,
  like_count     integer NOT NULL DEFAULT 0,   -- mantenidos por trigger sobre comment_likes
  reply_count    integer NOT NULL DEFAULT 0,   -- mantenidos por trigger sobre comments
  created_at     timestamptz NOT NULL DEFAULT now(),
  edited_at      timestamptz,
  deleted_at     timestamptz,                  -- retirada por el autor (soft delete)
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX comments_passage_idx ON comments (book_id, chapter_number, verse_start);
CREATE INDEX comments_author_idx ON comments (author_id, created_at DESC);
CREATE INDEX comments_published_idx ON comments (created_at DESC) WHERE status = 'published';
-- Una respuesta solo puede colgar de un comentario raíz (profundidad limitada, §7.2).
CREATE FUNCTION public.assert_reply_depth() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM comments c WHERE c.id = NEW.parent_id AND c.parent_id IS NOT NULL) THEN
      RAISE EXCEPTION 'la profundidad de respuestas está limitada a un nivel';
    END IF;
  END IF;
  RETURN NEW;
END
$$;
CREATE TRIGGER trg_comments_reply_depth BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION public.assert_reply_depth();

CREATE TABLE comment_likes (
  comment_id uuid NOT NULL REFERENCES comments (id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);
-- Sin autolikes (§7.3).
CREATE FUNCTION public.assert_no_autolike() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM comments c WHERE c.id = NEW.comment_id AND c.author_id = NEW.user_id) THEN
    RAISE EXCEPTION 'no está permitido dar like a la propia aportación';
  END IF;
  RETURN NEW;
END
$$;
CREATE TRIGGER trg_comment_likes_no_autolike BEFORE INSERT ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.assert_no_autolike();

-- Consistencia de like_count con registros reales (§9.2).
CREATE FUNCTION public.sync_comment_like_count() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  cid uuid;
BEGIN
  cid := COALESCE(NEW.comment_id, OLD.comment_id);
  UPDATE comments SET like_count = (
    SELECT count(*) FROM comment_likes cl WHERE cl.comment_id = cid
  ) WHERE id = cid;
  RETURN NULL;
END
$$;
CREATE TRIGGER trg_comment_likes_count AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_like_count();

-- Consistencia de reply_count.
CREATE FUNCTION public.sync_comment_reply_count() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  pid uuid;
BEGIN
  pid := COALESCE(NEW.parent_id, OLD.parent_id);
  IF pid IS NOT NULL THEN
    UPDATE comments SET reply_count = (
      SELECT count(*) FROM comments c
      WHERE c.parent_id = pid AND c.deleted_at IS NULL AND c.status <> 'removed'
    ) WHERE id = pid;
  END IF;
  RETURN NULL;
END
$$;
CREATE TRIGGER trg_comments_reply_count AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_reply_count();

CREATE TABLE passage_favorites (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  book_id        uuid NOT NULL REFERENCES biblical_books (id) ON DELETE RESTRICT,
  chapter_number integer NOT NULL CHECK (chapter_number > 0),
  verse_start    integer NOT NULL CHECK (verse_start > 0),
  verse_end      integer NOT NULL CHECK (verse_end >= verse_start),
  edition_id     uuid REFERENCES bible_editions (id) ON DELETE SET NULL,
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, edition_id, book_id, chapter_number, verse_start, verse_end)
);

CREATE TABLE debates (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  main_question      text NOT NULL CHECK (char_length(main_question) BETWEEN 10 AND 500),
  description        text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  guiding_questions  jsonb NOT NULL DEFAULT '[]'::jsonb, -- array de texto; preguntas orientativas (§8.1)
  author_id          uuid NOT NULL REFERENCES profiles (id) ON DELETE RESTRICT, -- autoría editorial
  status             text NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  featured           boolean NOT NULL DEFAULT false,
  published_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_debates_updated BEFORE UPDATE ON debates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX debates_published_idx ON debates (published_at DESC) WHERE status = 'published';

CREATE TABLE debate_passages (
  debate_id      uuid NOT NULL REFERENCES debates (id) ON DELETE CASCADE,
  book_id        uuid NOT NULL REFERENCES biblical_books (id) ON DELETE RESTRICT,
  chapter_number integer NOT NULL CHECK (chapter_number > 0),
  verse_start    integer NOT NULL CHECK (verse_start > 0),
  verse_end      integer NOT NULL CHECK (verse_end >= verse_start),
  position       integer NOT NULL DEFAULT 1 CHECK (position > 0),
  PRIMARY KEY (debate_id, book_id, chapter_number, verse_start, verse_end)
);

CREATE TABLE debate_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id  uuid NOT NULL REFERENCES debates (id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  parent_id  uuid REFERENCES debate_comments (id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  status     text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_debate_comments_updated BEFORE UPDATE ON debate_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX debate_comments_debate_idx ON debate_comments (debate_id, created_at);

-- Propuestas de usuarios: nunca se publican directamente como debates oficiales (§8.2).
CREATE TABLE debate_proposals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  title              text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  main_question      text NOT NULL CHECK (char_length(main_question) BETWEEN 10 AND 500),
  description        text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  suggested_passages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status             text NOT NULL DEFAULT 'submitted'
                     CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected')),
  editor_notes       text,
  reviewed_by        uuid REFERENCES profiles (id) ON DELETE SET NULL,
  reviewed_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX debate_proposals_status_idx ON debate_proposals (status, created_at);

CREATE TABLE debate_follows (
  debate_id  uuid NOT NULL REFERENCES debates (id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (debate_id, user_id)
);

CREATE TABLE notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('reply', 'mention', 'debate_activity', 'proposal_status', 'recognition', 'admin')),
  title        text NOT NULL CHECK (title <> ''),
  body         text,
  link         text,
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_recipient_idx ON notifications (recipient_id, created_at DESC);
