"use server";

// Acciones del asistente de lectura (§12.6): consentimiento, pregunta y
// revocación. Validación de sesión y cuota en el servidor.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/session";
import { askReadingAssistant, grantConsent, revokeConsent, remainingQuota, aiConfiguredStatus } from "./assistant-ui-helpers";

export async function darConsentimientoIA() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  await grantConsent(user.id);
  revalidatePath("/mi-espacio");
  const back = "/biblia";
  revalidatePath(back);
}

export async function revocarConsentimientoIA() {
  const user = await getCurrentUser();
  if (!user) return;
  await revokeConsent(user.id);
  revalidatePath("/mi-espacio");
  revalidatePath("/biblia");
}

export async function preguntarAsistente(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const question = String(formData.get("pregunta") ?? "");
  const result = await askReadingAssistant(user.id, question);
  const remaining = await remainingQuota(user.id);
  const configured = aiConfiguredStatus();
  const qs = new URLSearchParams({ pregunta: question, restante: String(remaining), ia: configured ? "1" : "0" });
  if (result.ok) {
    qs.set("respuesta", result.answer);
    qs.set("fuentes", JSON.stringify(result.sources));
  } else {
    qs.set("error", result.error);
  }
  redirect(`/biblia/asistente?${qs.toString()}`);
}
