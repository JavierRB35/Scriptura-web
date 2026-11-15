"use server";

// Acciones de perfil propio (§4.4): cambio de alias único y visibilidad del
// historial. Validación en servidor.

import { revalidatePath } from "next/cache";
import { query } from "@/shared/db";
import { getCurrentUser } from "./session";

export async function cambiarAlias(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const alias = String(formData.get("alias") ?? "").trim();
  if (alias.length < 3 || alias.length > 24) {
    return; // la validación completa se comunica en la interfaz con el patrón
  }
  if (!/^[a-zA-Z0-9_áéíóúüñÁÉÍÓÚÜÑ.-]+$/.test(alias)) return;

  try {
    await query(
      "UPDATE profiles SET alias = $2, alias_updated_at = now() WHERE id = $1",
      [user.id, alias]
    );
  } catch {
    return; // alias duplicado: la unicidad la garantiza la base de datos
  }
  revalidatePath("/mi-espacio");
}

export async function alternarHistorialPublico() {
  const user = await getCurrentUser();
  if (!user) return;
  await query("UPDATE profiles SET history_public = NOT history_public WHERE id = $1", [
    user.id,
  ]);
  revalidatePath("/mi-espacio");
}
