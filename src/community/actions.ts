"use server";

// Acciones de servidor de la comunidad. Autorización comprobada SIEMPRE aquí
// (§18.6): nada se fía del cliente. Las rutas se revalidan tras cada cambio.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, currentUserHasRole } from "@/auth/session";
import { getPublishedEdition } from "@/bible/queries";
import { parseReference } from "@/bible/reference";
import * as svc from "./service";

function requireUser() {
  return getCurrentUser().then((u) => {
    if (!u) throw new Error("Se requiere sesión.");
    return u;
  });
}

export async function publicarComentario(formData: FormData) {
  const user = await requireUser();
  const edition = await getPublishedEdition();
  if (!edition) return;

  const result = await svc.createComment(user, {
    bookCode: String(formData.get("bookCode") ?? ""),
    chapter: Number(formData.get("chapter")),
    verseStart: Number(formData.get("verseStart")),
    verseEnd: Number(formData.get("verseEnd")),
    body: String(formData.get("body") ?? ""),
    parentId: (formData.get("parentId") as string) || null,
    editionId: edition.id,
  });
  if (!result.ok) {
    redirect(`/biblia?error=${encodeURIComponent(result.error)}`);
  }
  const { slugOf } = await import("@/bible/slug");
  revalidatePath(
    `/biblia/${slugOf(String(formData.get("bookCode")))}/${Number(formData.get("chapter"))}`
  );
}

export async function retirarComentario(formData: FormData) {
  const user = await requireUser();
  await svc.removeOwnComment(user, String(formData.get("commentId")));
  const back = String(formData.get("back") ?? "/comunidad");
  revalidatePath(back);
}

export async function alternarLike(formData: FormData) {
  const user = await requireUser();
  await svc.toggleLike(user, String(formData.get("commentId")));
  const back = String(formData.get("back") ?? "/comunidad");
  revalidatePath(back);
}

export async function alternarFavorito(formData: FormData) {
  const user = await requireUser();
  const edition = await getPublishedEdition();
  if (!edition) return;
  await svc.toggleFavorite(user, {
    bookCode: String(formData.get("bookCode") ?? ""),
    chapter: Number(formData.get("chapter")),
    verseStart: Number(formData.get("verseStart")),
    verseEnd: Number(formData.get("verseEnd")),
    editionId: edition.id,
    note: (formData.get("note") as string) || undefined,
  });
  const back = String(formData.get("back") ?? "/mi-espacio");
  revalidatePath(back);
}

export async function proponerDebate(formData: FormData) {
  const user = await requireUser();
  const passages = [];
  for (const ref of String(formData.get("pasajes") ?? "").split(/[\n;]+/)) {
    const parsed = parseReference(ref);
    if (parsed?.chapter) {
      passages.push({
        bookCode: parsed.code,
        chapter: parsed.chapter,
        verseStart: parsed.verseStart ?? 1,
        verseEnd: parsed.verseEnd ?? parsed.verseStart ?? 1,
      });
    }
  }
  const result = await svc.proposeDebate(user, {
    title: String(formData.get("titulo") ?? ""),
    mainQuestion: String(formData.get("pregunta") ?? ""),
    description: String(formData.get("descripcion") ?? ""),
    passages,
  });
  redirect(result.ok ? "/debates?propuesta=enviada" : `/debates/proponer?error=${encodeURIComponent(result.error)}`);
}

export async function intervenirDebate(formData: FormData) {
  const user = await requireUser();
  const debateId = String(formData.get("debateId"));
  await svc.createDebateComment(user, debateId, String(formData.get("body") ?? ""));
  revalidatePath(`/debates/${debateId}`);
}

export async function seguirDebate(formData: FormData) {
  const user = await requireUser();
  const debateId = String(formData.get("debateId"));
  await svc.toggleFollow(user, debateId);
  revalidatePath(`/debates/${debateId}`);
}

export async function aceptarPropuesta(formData: FormData) {
  const user = await requireUser();
  if (!(await currentUserHasRole("editor")) && !(await currentUserHasRole("admin"))) {
    throw new Error("Requiere rol de editor.");
  }
  await svc.acceptProposal(user, String(formData.get("proposalId")));
  revalidatePath("/admin/debates");
  revalidatePath("/debates");
}

export async function rechazarPropuesta(formData: FormData) {
  const user = await requireUser();
  if (!(await currentUserHasRole("editor")) && !(await currentUserHasRole("admin"))) {
    throw new Error("Requiere rol de editor.");
  }
  await svc.rejectProposal(user, String(formData.get("proposalId")), String(formData.get("notas") ?? ""));
  revalidatePath("/admin/debates");
}

export async function marcarNotificacionesLeidas() {
  const user = await requireUser();
  await svc.markAllNotificationsRead(user);
  revalidatePath("/mi-espacio");
}
