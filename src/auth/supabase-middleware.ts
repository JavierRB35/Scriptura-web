// Cliente Supabase para el middleware (intercambia y refresca cookies de sesión).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

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

  return response;
}
