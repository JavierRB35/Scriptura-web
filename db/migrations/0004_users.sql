-- 0004 — Usuarios, roles y permisos (especificación §16.2, §4, §15)
-- Adaptación documentada (permitida por §16): las preferencias de privacidad viven en
-- profiles.history_public y user_preferences en lugar de una tabla separada, para evitar
-- una tabla de una sola fila por usuario. Las credenciales y sesiones quedan en el
-- proveedor de autenticación (auth.users), nunca en tablas propias.

CREATE TABLE profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  alias             text NOT NULL UNIQUE CHECK (char_length(alias) BETWEEN 3 AND 24),
  alias_updated_at  timestamptz,
  avatar_url        text,
  joined_at         timestamptz NOT NULL DEFAULT now(),
  -- Privacidad por defecto: el historial NO es visible para otros miembros (§4.4, §18.3).
  history_public    boolean NOT NULL DEFAULT false,
  is_suspended      boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Perfil creado automáticamente al registrarse: alias provisional único.
-- El usuario puede cambiarlo después (respetando la unicidad).
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, alias)
  VALUES (NEW.id, 'lector_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE user_preferences (
  user_id             uuid PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
  notify_replies      boolean NOT NULL DEFAULT true,
  notify_mentions     boolean NOT NULL DEFAULT true,
  notify_debates      boolean NOT NULL DEFAULT true,
  notify_recognitions boolean NOT NULL DEFAULT true,
  email_notifications boolean NOT NULL DEFAULT false, -- solo tras garantías aplicables (§14)
  theme               text NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  font_scale          integer NOT NULL DEFAULT 100 CHECK (font_scale BETWEEN 70 AND 200),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_user_preferences_updated BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Roles acumulables administrador/editor/moderador (§15). Los permisos se comprueban
-- en el servidor en cada operación sensible.
CREATE TABLE user_roles (
  user_id   uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  role      text NOT NULL CHECK (role IN ('admin', 'editor', 'moderator')),
  granted_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(uid uuid, requested_role text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = uid AND role = requested_role
  )
$$;

-- Consentimientos versionados (IA, correo) con constancia de revocación (§12.6, §18.4).
CREATE TABLE user_consents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN ('ai_reading', 'ai_editorial', 'email_notifications')),
  granted      boolean NOT NULL,
  granted_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz,
  UNIQUE (user_id, consent_type, granted_at)
);
CREATE UNIQUE INDEX user_consents_active_idx ON user_consents (user_id, consent_type)
  WHERE revoked_at IS NULL;

CREATE TABLE account_deletion_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  reason       text,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles (id) ON DELETE SET NULL
);
