// Confirmación de suscripción (doble opt-in).
import { NextResponse, type NextRequest } from "next/server";
import { confirmSubscription } from "@/email/service";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ok = token ? await confirmSubscription(token) : false;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(`${site}/lecturas-diarias?confirmada=${ok ? "1" : "0"}`);
}
