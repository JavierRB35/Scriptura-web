import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, currentUserHasRole } from "@/auth/session";
import { listProposals } from "@/community/service";
import { aceptarPropuesta, rechazarPropuesta } from "@/community/actions";

export const metadata: Metadata = { title: "Debates · Administración" };

// Revisión editorial de propuestas (§8.2). Solo editores o administradores.

export default function AdminDebatesPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-12 text-muted">Cargando…</p>}>
      <AdminDebatesBody />
    </Suspense>
  );
}

async function AdminDebatesBody() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/admin/debates");

  const isEditor = (await currentUserHasRole("editor")) || (await currentUserHasRole("admin"));
  if (!isEditor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Revisión de debates</h1>
        <p className="mt-3 text-muted">
          No tienes permisos editoriales. Solicita al propietario el rol de editor.
        </p>
      </div>
    );
  }

  const proposals = await listProposals();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Propuestas de debate</h1>
      <p className="mt-2 text-sm text-muted">
        Las propuestas aceptadas se publican como debates oficiales; sus pasajes
        sugeridos se vinculan automáticamente.
      </p>

      {proposals.length === 0 ? (
        <p className="mt-6 text-muted">No hay propuestas por ahora.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {proposals.map((p) => (
            <li key={p.id} className="rounded-xl border border-border bg-surface p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{p.title}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    p.status === "submitted"
                      ? "bg-amber-100 text-amber-800"
                      : p.status === "accepted"
                        ? "bg-accent-soft text-accent"
                        : "bg-border text-muted"
                  }`}
                >
                  {p.status === "submitted"
                    ? "pendiente"
                    : p.status === "accepted"
                      ? "aceptada"
                      : p.status === "under_review"
                        ? "en revisión"
                        : "rechazada"}
                </span>
              </header>
              <p className="mt-1 text-sm text-muted">
                {p.mainQuestion} · propuesta por {p.userAlias}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{p.description}</p>

              {p.status === "submitted" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={aceptarPropuesta}>
                    <input type="hidden" name="proposalId" value={p.id} />
                    <button
                      type="submit"
                      className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                    >
                      Aceptar y publicar
                    </button>
                  </form>
                  <form action={rechazarPropuesta} className="flex flex-1 gap-2">
                    <input type="hidden" name="proposalId" value={p.id} />
                    <input
                      name="notas"
                      placeholder="Motivo (se guarda)"
                      className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="rounded border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
