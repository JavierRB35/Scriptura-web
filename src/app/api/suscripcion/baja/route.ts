// Baja inmediata mediante el enlace incluido en cada correo (§13.5).
import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeByToken } from "@/email/service";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ok = token ? await unsubscribeByToken(token) : false;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(`${site}/lecturas-diarias?baja=${ok ? "1" : "0"}`);
}
