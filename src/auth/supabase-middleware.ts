// Cliente Supabase para el middleware (intercambia y refresca cookies de sesión).
// Endurecido: sin configuración de Supabase la petición pasa sin sesión
// (visitante anónimo) en lugar de devolver 500 en toda la web.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readAuthConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const config = readAuthConfig();
  if (!config) {
    // Autenticación sin configurar: modo degradado, sin sesión.
    return response;
  }

  try {
    const client = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Importante: getUser() valida el token contra el servidor de Supabase; no
    // basta con leer la cookie local (protección frente a tokens falsificados).
    const {
      data: { user },
    } = await client.auth.getUser();

    const path = request.nextUrl.pathname;
    const isProtected = path.startsWith("/mi-espacio") || path.startsWith("/admin");
    const isAuthPage = path === "/entrar" || path === "/registro" || path === "/recuperar";

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("redirigir", path);
      return NextResponse.redirect(url);
    }
    if (isAuthPage && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/mi-espacio";
      url.search = "";
      return NextResponse.redirect(url);
    }
  } catch {
    // Fallo al contactar con Supabase: se deja pasar la petición sin sesión.
    // Las páginas protegidas vuelven a comprobar la sesión en el servidor.
    return NextResponse.next({ request });
  }

  return response;
}
