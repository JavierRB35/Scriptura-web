-- 0003 — Biblioteca bíblica (especificación §16.1, §5)
-- Modelo: fuentes/derechos → ediciones → libros por edición → capítulos → versículos,
-- con cánones independientes de las ediciones y mapeos de versificación entre ediciones.

CREATE TABLE bible_sources (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL CHECK (name <> ''),
  publisher        text,
  url              text,
  license_status   text NOT NULL CHECK (license_status IN ('public_domain', 'licensed', 'pending_review')),
  license_evidence text,
  verified_at      date,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bible_editions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           uuid NOT NULL REFERENCES bible_sources (id) ON DELETE RESTRICT,
  identifier          text NOT NULL UNIQUE CHECK (identifier <> ''),
  full_name           text NOT NULL CHECK (full_name <> ''),
  abbreviation        text NOT NULL CHECK (abbreviation <> ''),
  language            text NOT NULL CHECK (language <> ''),
  translator          text,
  year                text,
  canon_coverage      text NOT NULL,
  url                 text,
  rights_status       text NOT NULL CHECK (rights_status IN ('public_domain', 'licensed', 'pending_review')),
  verified_at         date,
  file_version        text NOT NULL,
  integrity_hash      text,
  publication_status  text NOT NULL DEFAULT 'draft'
                      CHECK (publication_status IN ('draft', 'verified', 'published', 'retired')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_bible_editions_updated BEFORE UPDATE ON bible_editions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX bible_editions_status_idx ON bible_editions (publication_status);

-- Catálogo universal de libros y cánones (independiente de cada edición).
CREATE TABLE biblical_canons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE CHECK (code <> ''),
  name       text NOT NULL CHECK (name <> ''),
  book_count integer NOT NULL CHECK (book_count > 0)
);

CREATE TABLE biblical_books (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text NOT NULL UNIQUE CHECK (code <> ''),
  name_es           text NOT NULL CHECK (name_es <> ''),
  testament         text NOT NULL CHECK (testament IN ('AT', 'NT')),
  deuterocanonical  boolean NOT NULL DEFAULT false,
  osis_code         text
);
CREATE INDEX biblical_books_testament_idx ON biblical_books (testament, code);

CREATE TABLE canon_books (
  canon_id  uuid NOT NULL REFERENCES biblical_canons (id) ON DELETE CASCADE,
  book_id   uuid NOT NULL REFERENCES biblical_books (id) ON DELETE CASCADE,
  position  integer NOT NULL CHECK (position > 0),
  PRIMARY KEY (canon_id, book_id),
  UNIQUE (canon_id, position)
);

CREATE TABLE edition_books (
  edition_id uuid NOT NULL REFERENCES bible_editions (id) ON DELETE CASCADE,
  book_id    uuid NOT NULL REFERENCES biblical_books (id) ON DELETE RESTRICT,
  position   integer NOT NULL CHECK (position > 0),
  PRIMARY KEY (edition_id, book_id)
);

CREATE TABLE bible_chapters (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id     uuid NOT NULL REFERENCES bible_editions (id) ON DELETE CASCADE,
  book_id        uuid NOT NULL REFERENCES biblical_books (id) ON DELETE RESTRICT,
  chapter_number integer NOT NULL CHECK (chapter_number > 0),
  UNIQUE (edition_id, book_id, chapter_number)
);

CREATE TABLE bible_verses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id      uuid NOT NULL REFERENCES bible_chapters (id) ON DELETE CASCADE,
  verse_number    integer NOT NULL CHECK (verse_number > 0),
  verse_key       text NOT NULL CHECK (verse_key <> ''), -- admite '10', '10a', '10-11'…
  text_content    text NOT NULL CHECK (text_content <> ''),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, verse_key)
);
CREATE INDEX bible_verses_chapter_idx ON bible_verses (chapter_id, verse_number);

-- Equivalencias de numeración entre ediciones (diferencias de versificación, §16.1).
CREATE TABLE verse_reference_mappings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_edition_id uuid NOT NULL REFERENCES bible_editions (id) ON DELETE CASCADE,
  to_edition_id   uuid NOT NULL REFERENCES bible_editions (id) ON DELETE CASCADE,
  book_id         uuid NOT NULL REFERENCES biblical_books (id) ON DELETE CASCADE,
  from_ref        text NOT NULL CHECK (from_ref <> ''),
  to_ref          text NOT NULL CHECK (to_ref <> ''),
  note            text,
  UNIQUE (from_edition_id, to_edition_id, book_id, from_ref),
  CHECK (from_edition_id <> to_edition_id)
);

-- Procesos de importación reproducibles y trazables (§5.5).
CREATE TABLE bible_import_batches (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id     uuid NOT NULL REFERENCES bible_editions (id) ON DELETE CASCADE,
  source_url     text,
  started_at     timestamptz NOT NULL DEFAULT now(),
  finished_at    timestamptz,
  status         text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  books_count    integer,
  chapters_count integer,
  verses_count   integer,
  errors         jsonb NOT NULL DEFAULT '[]'::jsonb,
  warnings       jsonb NOT NULL DEFAULT '[]'::jsonb,
  integrity_hash text,
  created_by     uuid
);
CREATE INDEX bible_import_batches_edition_idx ON bible_import_batches (edition_id, started_at DESC);
