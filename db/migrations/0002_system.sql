-- 0002 — Sistema y auditoría (especificación §16.8)

CREATE TABLE system_settings (
  key         text PRIMARY KEY CHECK (key <> ''),
  value       jsonb NOT NULL,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid
);

CREATE TABLE audit_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor       uuid,
  action      text NOT NULL CHECK (action <> ''),
  entity_type text,
  entity_id   text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_created_idx ON audit_events (created_at DESC);
CREATE INDEX audit_events_entity_idx ON audit_events (entity_type, entity_id);

-- Automatizaciones: definición de trabajos y ejecución (§13.4, §16.8).
CREATE TABLE scheduled_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_key     text NOT NULL UNIQUE CHECK (job_key <> ''),
  cron_expr   text,
  enabled     boolean NOT NULL DEFAULT true,
  payload     jsonb,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_scheduled_jobs_updated BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE job_executions (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id          uuid NOT NULL REFERENCES scheduled_jobs (id) ON DELETE CASCADE,
  status          text NOT NULL CHECK (status IN ('pending', 'running', 'succeeded', 'failed')),
  idempotency_key text,
  started_at      timestamptz,
  finished_at     timestamptz,
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX job_executions_job_idx ON job_executions (job_id, created_at DESC);
CREATE UNIQUE INDEX job_executions_idem_idx ON job_executions (job_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Consumo técnico de servicios (IA, correo…) sin datos personales innecesarios (§12.6, §15.4).
CREATE TABLE service_usage (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service     text NOT NULL CHECK (service <> ''),
  operation   text,
  units       bigint NOT NULL DEFAULT 1,
  cost_micros numeric,
  ref         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX service_usage_service_idx ON service_usage (service, created_at DESC);
