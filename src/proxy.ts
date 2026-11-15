// Proxy de Next.js (antes middleware): refresca la sesión de Supabase en cada
// navegación y protege las rutas privadas.

import { type NextRequest } from "next/server";
import { updateSession } from "@/auth/supabase-middleware";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Todo excepto archivos estáticos e imágenes; refresca sesión en cada navegación.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
