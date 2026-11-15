-- 0009 — Calendario litúrgico y lecturas diarias por correo (§13, §16.7)
-- El calendario y las referencias litúrgicas quedan separados de los textos bíblicos (§13.2).
-- La cola de envíos es duradera e idempotente: (suscripción, fecha litúrgica local,
-- versión de contenido) es único (§13.4).

CREATE TABLE liturgical_calendars (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE CHECK (code <> ''),
  name        text NOT NULL CHECK (name <> ''),
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- Calendario inicial: general de España (D20).
INSERT INTO liturgical_calendars (code, name, description)
VALUES ('espana_general', 'Calendario litúrgico general de España',
        'Calendario general de la Conferencia Episcopal Española; celebraciones propias pendientes de ampliación.');

CREATE TABLE liturgical_celebrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id      uuid NOT NULL REFERENCES liturgical_calendars (id) ON DELETE CASCADE,
  celebration_date date NOT NULL,
  celebration_name text NOT NULL CHECK (celebration_name <> ''),
  celebration_rank text NOT NULL CHECK (celebration_rank IN (
    'solemnity', 'feast', 'memorial', 'optional_memorial', 'sunday', 'ferial'
  )),
  season           text NOT NULL CHECK (season IN ('advent', 'christmas', 'lent', 'easter', 'ordinary')),
  sunday_cycle     text CHECK (sunday_cycle IN ('A', 'B', 'C')),
  ferial_cycle     smallint CHECK (ferial_cycle IN (1, 2)),
  is_vigil         boolean NOT NULL DEFAULT false,
  notes            text,
  UNIQUE (calendar_id, celebration_date, celebration_name)
);
CREATE INDEX liturgical_celebrations_date_idx ON liturgical_celebrations (calendar_id, celebration_date);

CREATE TABLE liturgical_readings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id   uuid NOT NULL REFERENCES liturgical_celebrations (id) ON DELETE CASCADE,
  reading_order    integer NOT NULL CHECK (reading_order > 0),
  reading_kind     text NOT NULL CHECK (reading_kind IN ('first_reading', 'psalm', 'second_reading', 'gospel', 'other')),
  label            text,
  book_id          uuid REFERENCES biblical_books (id) ON DELETE RESTRICT,
  chapter_number   integer CHECK (chapter_number > 0),
  verse_start      integer CHECK (verse_start > 0),
  verse_end        integer CHECK (verse_end >= verse_start),
  display_ref      text NOT NULL CHECK (display_ref <> ''),
  translation_note text, -- traducción utilizada y advertencias de derechos (§13.3)
  rights_ok        boolean NOT NULL DEFAULT false, -- ¿se autoriza la reproducción completa del texto?
  UNIQUE (celebration_id, reading_order)
);

-- Variantes: formas largas/breves, ciclos alternativos, vigilia pascual… (§13.2).
CREATE TABLE liturgical_reading_variants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id     uuid NOT NULL REFERENCES liturgical_readings (id) ON DELETE CASCADE,
  variant_key    text NOT NULL CHECK (variant_key <> ''),
  description    text,
  book_id        uuid REFERENCES biblical_books (id) ON DELETE RESTRICT,
  chapter_number integer CHECK (chapter_number > 0),
  verse_start    integer CHECK (verse_start > 0),
  verse_end      integer CHECK (verse_end >= verse_start),
  display_ref    text NOT NULL CHECK (display_ref <> ''),
  UNIQUE (reading_id, variant_key)
);

-- Suscripción independiente del registro comunitario (§13.1).
CREATE TABLE email_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized text NOT NULL UNIQUE CHECK (email_normalized <> ''),
  email_display   text NOT NULL CHECK (email_display <> ''),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  timezone        text NOT NULL DEFAULT 'Europe/Madrid', -- identificador IANA validado en servidor
  send_time       time NOT NULL DEFAULT '07:00',         -- hora local del suscriptor (§13.4)
  locale          text NOT NULL DEFAULT 'es',
  created_at      timestamptz NOT NULL DEFAULT now(),
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz
);

CREATE TABLE email_subscription_tokens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES email_subscriptions (id) ON DELETE CASCADE,
  token_hash      text NOT NULL UNIQUE CHECK (token_hash <> ''),
  purpose         text NOT NULL CHECK (purpose IN ('confirm', 'unsubscribe', 'preferences')),
  expires_at      timestamptz NOT NULL,
  used_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE daily_email_jobs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id     uuid NOT NULL REFERENCES email_subscriptions (id) ON DELETE CASCADE,
  liturgical_date_local date NOT NULL,
  content_version     text NOT NULL CHECK (content_version <> ''),
  scheduled_for       timestamptz NOT NULL,
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped')),
  attempts            integer NOT NULL DEFAULT 0,
  last_error          text,
  sent_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  -- Protección de duplicados exigida por §13.4.
  UNIQUE (subscription_id, liturgical_date_local, content_version)
);
CREATE INDEX daily_email_jobs_due_idx ON daily_email_jobs (status, scheduled_for) WHERE status IN ('pending', 'processing');

CREATE TABLE email_delivery_attempts (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id              uuid NOT NULL REFERENCES daily_email_jobs (id) ON DELETE CASCADE,
  attempt             integer NOT NULL CHECK (attempt > 0),
  provider            text NOT NULL CHECK (provider <> ''),
  provider_message_id text,
  status              text NOT NULL CHECK (status IN ('accepted', 'bounced', 'rejected', 'failed')),
  detail              text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, attempt)
);

CREATE TABLE email_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE CHECK (code <> ''),
  subject_template text NOT NULL CHECK (subject_template <> ''),
  body_html       text NOT NULL CHECK (body_html <> ''),
  body_text       text,
  version         integer NOT NULL DEFAULT 1 CHECK (version > 0),
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_email_templates_updated BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
