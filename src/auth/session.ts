// Sesión y perfil del usuario actual, con comprobación de roles en la base de
// datos (los roles son acumulables, §15). Para uso en componentes de servidor.

import "server-only";
import { createClient } from "./supabase-server";
import { authConfigured } from "./config";
import { query } from "@/shared/db";

export type Role = "admin" | "editor" | "moderator";

export interface CurrentUser {
  id: string;
  email: string | null;
  alias: string;
  historyPublic: boolean;
  avatarUrl: string | null;
  joinedAt: Date;
  roles: Role[];
}

/** Usuario autenticado con su perfil; null si no hay sesión válida o la
 *  autenticación no está configurada. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!authConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { rows } = await query<{
    alias: string;
    history_public: boolean;
    avatar_url: string | null;
    joined_at: Date;
  }>(
    `SELECT p.alias, p.history_public, p.avatar_url, p.joined_at
       FROM profiles p WHERE p.id = $1`,
    [user.id]
  );
  if (rows.length === 0) return null;

  const { rows: roleRows } = await query<{ role: Role }>(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [user.id]
  );

  return {
    id: user.id,
    email: user.email ?? null,
    alias: rows[0].alias,
    historyPublic: rows[0].history_public,
    avatarUrl: rows[0].avatar_url,
    joinedAt: new Date(rows[0].joined_at),
    roles: roleRows.map((r) => r.role),
  };
}

/** ¿El usuario actual tiene el rol indicado? Comprobación en base de datos. */
export async function currentUserHasRole(role: Role): Promise<boolean> {
  if (!authConfigured()) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { rows } = await query<{ ok: boolean }>(
    "SELECT public.has_role($1, $2) AS ok",
    [user.id, role]
  );
  return rows[0]?.ok === true;
}
