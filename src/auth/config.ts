// Configuración de Supabase compartida por los tres clientes.
// Si falta alguna variable, la autenticación queda deshabilitada de forma
// controlada (modo degradado honesto) en lugar de romper toda la aplicación.

export interface AuthConfig {
  url: string;
  anonKey: string;
}

export function readAuthConfig(): AuthConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function authConfigured(): boolean {
  return readAuthConfig() !== null;
}
