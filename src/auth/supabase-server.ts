// Cliente Supabase para componentes de servidor (con cookies de petición/respuesta).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readAuthConfig } from "./config";

export async function createClient() {
  const config = readAuthConfig();
  if (!config) {
    throw new Error("Autenticación no configurada: faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const cookieStore = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Se lanza desde un Server Component: el middleware refresca la sesión.
        }
      },
    },
  });
}
