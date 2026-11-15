-- 0015 — Corrección del orden de nullif en el stub auth.uid()
-- En 0014 el vaciado se aplicaba tras el cast: ''::json seguía rompiendo.
-- Orden correcto: sanear la cadena ANTES de interpretarla como JSON.
-- Solo se sustituye el stub propio (Supabase tiene auth.sessions).

DO $outer$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'sessions') THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE AS $inner$
        SELECT (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub')::uuid
      $inner$
    $fn$;
  END IF;
END
$outer$;
