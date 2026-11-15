// Validación de variables de entorno del servidor (zod).
// Ningún secreto se envía al cliente: este módulo solo se importa en servidor.

import { z } from "zod";

const serverEnvSchema = z.object({
  // Conexión directa a PostgreSQL (cadena completa). Solo servidor.
  DATABASE_URL: z.string().min(1),
  // Proyecto Supabase para autenticación.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // URL pública del sitio (usada en correos y redirecciones).
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/** Entorno validado; lanza un error claro si falta algo imprescindible. */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Variables de entorno inválidas o ausentes → ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
