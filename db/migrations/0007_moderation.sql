-- 0007 — Moderación y convivencia (especificación §11, §16.5)

CREATE TABLE content_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('comment', 'debate_comment', 'debate', 'profile')),
  target_id   uuid NOT NULL,
  reason      text NOT NULL CHECK (reason IN (
    'insult', 'harassment', 'threat', 'spam', 'impersonation',
    'reputation_manipulation', 'private_info', 'abuse', 'other'
  )),
  details     text,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  handled_by  uuid REFERENCES profiles (id) ON DELETE SET NULL,
  handled_at  timestamptz,
  resolution  text
);
CREATE INDEX content_reports_queue_idx ON content_reports (status, created_at) WHERE status = 'open';

CREATE TABLE moderation_cases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   uuid REFERENCES content_reports (id) ON DELETE SET NULL, -- puede abrirse de oficio
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'actioned', 'closed')),
  severity    text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  assigned_to uuid REFERENCES profiles (id) ON DELETE SET NULL,
  opened_at   timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz,
  notes       jsonb NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX moderation_cases_queue_idx ON moderation_cases (status, opened_at);

CREATE TABLE moderation_actions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid NOT NULL REFERENCES moderation_cases (id) ON DELETE CASCADE,
  action_type   text NOT NULL CHECK (action_type IN ('hide', 'restore', 'restrict', 'warn', 'escalate')),
  justification text NOT NULL CHECK (justification <> ''), -- toda actuación queda justificada (§11.3)
  performed_by  uuid NOT NULL REFERENCES profiles (id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE appeals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid NOT NULL REFERENCES moderation_cases (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  statement       text NOT NULL CHECK (char_length(statement) BETWEEN 10 AND 4000),
  status          text NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted', 'under_review', 'upheld', 'overturned')),
  decided_by      uuid REFERENCES profiles (id) ON DELETE SET NULL,
  decided_at      timestamptz,
  decision_reason text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_restrictions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  restriction_type text NOT NULL CHECK (restriction_type IN ('warned', 'muted', 'suspended')),
  reason           text NOT NULL CHECK (reason <> ''),
  starts_at        timestamptz NOT NULL DEFAULT now(),
  ends_at          timestamptz,
  active           boolean NOT NULL DEFAULT true,
  created_by       uuid NOT NULL REFERENCES profiles (id) ON DELETE RESTRICT,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX user_restrictions_user_idx ON user_restrictions (user_id, active, ends_at);
