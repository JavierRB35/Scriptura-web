// Cliente Supabase para el navegador (autenticación).

import { createBrowserClient } from "@supabase/ssr";
import { readAuthConfig } from "./config";

export function createClient() {
  const config = readAuthConfig();
  if (!config) {
    throw new Error("Autenticación no configurada: faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(config.url, config.anonKey);
}
