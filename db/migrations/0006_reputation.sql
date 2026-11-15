-- 0006 — Reputación y reconocimientos (especificación §10, §16.4)
-- Puntuación calculada desde eventos verificables; parámetros versionados en
-- configuración, nunca constantes rígidas de código (§10.2).

CREATE TABLE reputation_rules (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version    integer NOT NULL CHECK (version > 0),
  params     jsonb NOT NULL,
  active     boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  UNIQUE (version)
);
-- Solo puede haber una versión activa.
CREATE UNIQUE INDEX reputation_rules_single_active_idx ON reputation_rules (active) WHERE active;

-- Semilla: versión 1 con valores iniciales razonables (§10.2), administrables desde el panel.
INSERT INTO reputation_rules (version, params, active)
VALUES (1, jsonb_build_object(
  'points_per_comment', 5,
  'points_per_reply', 3,
  'points_per_like_received', 1,
  'daily_activity_points_cap', 50,
  'sanctioned_content_points', 0
), true);

CREATE TABLE reputation_events (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  event_type   text NOT NULL CHECK (event_type IN (
    'comment_published', 'reply_published', 'like_received', 'like_removed',
    'moderation_removal', 'adjustment'
  )),
  points_delta integer NOT NULL,
  source_type  text,
  source_id    uuid,
  rule_version integer REFERENCES reputation_rules (version),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reputation_events_user_idx ON reputation_events (user_id, created_at DESC);
-- Idempotencia: un mismo origen no genera eventos duplicados del mismo tipo.
CREATE UNIQUE INDEX reputation_events_source_idx ON reputation_events (event_type, source_type, source_id)
  WHERE source_id IS NOT NULL AND points_delta > 0;

CREATE TABLE recognition_levels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE CHECK (code <> ''),
  name        text NOT NULL CHECK (name <> ''),
  description text,
  min_points  integer NOT NULL CHECK (min_points >= 0),
  position    integer NOT NULL UNIQUE CHECK (position > 0),
  active      boolean NOT NULL DEFAULT true
);
-- Progresión inicial (nombres definitivos concretables en diseño, §10.4).
INSERT INTO recognition_levels (code, name, description, min_points, position) VALUES
  ('explorador',  'Explorador',           'Primeras lecturas y aportaciones',            0,  1),
  ('colaborador', 'Colaborador',          'Participación constante en la comunidad',     50, 2),
  ('reflexivo',   'Reflexivo',            'Reflexiones valoradas por otros miembros',    200, 3),
  ('referente',   'Referente de la comunidad', 'Aportaciones destacadas y sostenidas',  500, 4);

CREATE TABLE user_recognitions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  level_id   uuid NOT NULL REFERENCES recognition_levels (id) ON DELETE RESTRICT,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, level_id)
);

CREATE TABLE reputation_adjustments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  points_delta integer NOT NULL,
  reason      text NOT NULL CHECK (reason <> ''),
  adjusted_by uuid NOT NULL REFERENCES profiles (id) ON DELETE RESTRICT,
  created_at  timestamptz NOT NULL DEFAULT now()
);
