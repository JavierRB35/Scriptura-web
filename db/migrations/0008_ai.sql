-- 0008 — Inteligencia artificial: biblioteca documental y trazabilidad (§12, §16.6)
-- Cada respuesta fundamentada conserva la referencia al documento, versión y fragmento
-- del que procede (ai_source_references). Separación entre contenido fuente y generado.

CREATE TABLE knowledge_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE CHECK (name <> ''),
  kind            text NOT NULL CHECK (kind IN ('bible_edition', 'historical', 'academic', 'religious', 'metadata')),
  url             text,
  license_status  text NOT NULL CHECK (license_status IN ('public_domain', 'licensed', 'pending_review')),
  license_evidence text,
  verified_at     date,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE knowledge_documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        uuid NOT NULL REFERENCES knowledge_sources (id) ON DELETE CASCADE,
  title            text NOT NULL CHECK (title <> ''),
  author           text,
  doc_date         text,
  provenance       text,
  url              text,
  usage_terms      text NOT NULL,
  tradition        text, -- tradición o ámbito, cuando corresponda (§12.3)
  version          text NOT NULL DEFAULT '1',
  editorial_state  text NOT NULL DEFAULT 'pending' CHECK (editorial_state IN ('pending', 'approved', 'retired')),
  last_verified_at timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_knowledge_documents_updated BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX knowledge_documents_state_idx ON knowledge_documents (editorial_state);

CREATE TABLE knowledge_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge_documents (id) ON DELETE CASCADE,
  chunk_index integer NOT NULL CHECK (chunk_index >= 0),
  content     text NOT NULL CHECK (content <> ''),
  char_count  integer NOT NULL CHECK (char_count >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE TABLE knowledge_embeddings (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id  uuid NOT NULL REFERENCES knowledge_chunks (id) ON DELETE CASCADE,
  model     text NOT NULL CHECK (model <> ''),
  embedding vector(1536) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chunk_id, model)
);
CREATE INDEX knowledge_embeddings_hnsw_idx ON knowledge_embeddings
  USING hnsw (embedding vector_cosine_ops);

-- Registro de consumo técnico sin más información personal de la necesaria (§12.6).
CREATE TABLE ai_usage_events (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       uuid REFERENCES profiles (id) ON DELETE SET NULL,
  capability    text NOT NULL CHECK (capability IN ('reading_assistant', 'editorial_assistant')),
  provider      text NOT NULL CHECK (provider <> ''),
  model         text NOT NULL CHECK (model <> ''),
  input_tokens  integer,
  output_tokens integer,
  cost_micros   numeric,
  latency_ms    integer,
  success       boolean NOT NULL DEFAULT true,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_events_created_idx ON ai_usage_events (created_at DESC);
CREATE INDEX ai_usage_events_user_idx ON ai_usage_events (user_id, created_at DESC);

CREATE TABLE ai_source_references (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_event_id bigint NOT NULL REFERENCES ai_usage_events (id) ON DELETE CASCADE,
  document_id    uuid REFERENCES knowledge_documents (id) ON DELETE SET NULL,
  chunk_id       uuid REFERENCES knowledge_chunks (id) ON DELETE SET NULL,
  bible_verse_id uuid REFERENCES bible_verses (id) ON DELETE SET NULL,
  citation       text NOT NULL CHECK (citation <> ''),
  created_at     timestamptz NOT NULL DEFAULT now()
);
