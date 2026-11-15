"use server";

// Acciones de moderación: rol comprobado en servidor en cada una (§15.3).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, currentUserHasRole } from "@/auth/session";
import * as mod from "./service";
import type { ModerationActionType } from "./service";

async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Se requiere sesión.");
  const ok =
    (await currentUserHasRole("moderator")) ||
    (await currentUserHasRole("admin")) ||
    (await currentUserHasRole("editor"));
  if (!ok) throw new Error("Requiere rol de moderación.");
  return user;
}

export async function resolverDenuncia(formData: FormData) {
  const moderator = await requireModerator();
  const result = await mod.resolveReport(moderator, {
    reportId: String(formData.get("reportId")),
    action: String(formData.get("action")) as ModerationActionType,
    justification: String(formData.get("justification") ?? ""),
    restrictionDays: Number(formData.get("days") ?? 0) || undefined,
  });
  revalidatePath("/admin/moderacion");
  if (!result.ok) {
    redirect(`/admin/moderacion?error=${encodeURIComponent(result.error)}`);
  }
}

export async function descartarDenuncia(formData: FormData) {
  const moderator = await requireModerator();
  await mod.dismissReport(
    moderator,
    String(formData.get("reportId")),
    String(formData.get("justification") ?? "")
  );
  revalidatePath("/admin/moderacion");
}

export async function decidirApelacion(formData: FormData) {
  const moderator = await requireModerator();
  await mod.decideAppeal(moderator, {
    appealId: String(formData.get("appealId")),
    uphold: String(formData.get("uphold")) === "si",
    reason: String(formData.get("reason") ?? ""),
  });
  revalidatePath("/admin/moderacion");
}

export async function enviarDenuncia(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/denuncia");
  const result = await mod.createReport(user, {
    targetType: String(formData.get("targetType") ?? ""),
    targetId: String(formData.get("targetId") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    details: String(formData.get("details") ?? ""),
  });
  redirect(result.ok ? "/denuncia?enviada=1" : `/denuncia?error=${encodeURIComponent(result.error)}`);
}

export async function enviarApelacion(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/apelar");
  const result = await mod.fileAppeal(user, String(formData.get("statement") ?? ""));
  redirect(result.ok ? "/apelar?enviada=1" : `/apelar?error=${encodeURIComponent(result.error)}`);
}
