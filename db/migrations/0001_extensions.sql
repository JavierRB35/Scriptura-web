-- 0001 — Extensiones, roles de acceso y compatibilidad SupabasE/vanilla PostgreSQL
-- Objetivo: que toda la cadena de migraciones sea ejecutable tanto en Supabase
-- (donde auth.users y los roles ya existen) como en un PostgreSQL estándar
-- (desarrollo local y CI), sin bifurcar el esquema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- Roles de acceso al estilo Supabase (no existen en PostgreSQL estándar).
DO $$
BEGIN
  IF to_regrole('anon') IS NULL THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF to_regrole('authenticated') IS NULL THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF to_regrole('service_role') IS NULL THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;

-- Esquema auth: en Supabase ya existe con la tabla users; en local/CI se crea
-- un stub mínimo para que triggers y claves foráneas funcionen igual.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
  END IF;
  IF to_regclass('auth.users') IS NULL THEN
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
  IF to_regprocedure('auth.uid()') IS NULL THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE AS $inner$
        SELECT nullif(
          current_setting('request.jwt.claims', true)::json ->> 'sub', ''
        )::uuid
      $inner$
    $fn$;
  END IF;
END
$$;

-- Utilidad común: mantenimiento de updated_at.
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;
