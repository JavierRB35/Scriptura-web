// Intercambio del código de verificación/recuperación (flujo PKCE de Supabase).
// Las URLs de los correos de Supabase llegan aquí con ?code=…

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/auth/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mi-espacio";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=auth`);
}
