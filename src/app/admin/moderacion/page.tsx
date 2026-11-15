import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, currentUserHasRole } from "@/auth/session";
import { listOpenReports, listOpenAppeals } from "@/moderation/service";
import { resolverDenuncia, descartarDenuncia, decidirApelacion } from "@/moderation/actions";

export const metadata: Metadata = { title: "Moderación · Administración" };

export default function AdminModeracionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-12 text-muted">Cargando…</p>}>
      <ModeracionBody searchParams={searchParams} />
    </Suspense>
  );
}

async function ModeracionBody({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/admin/moderacion");

  const canModerate =
    (await currentUserHasRole("moderator")) ||
    (await currentUserHasRole("admin")) ||
    (await currentUserHasRole("editor"));

  if (!canModerate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Moderación</h1>
        <p className="mt-3 text-muted">
          No tienes permisos de moderación. Solicita al propietario el rol de
          moderador.
        </p>
      </div>
    );
  }

  const [reports, appeals] = await Promise.all([listOpenReports(30), listOpenAppeals(30)]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Moderación</h1>
      <p className="mt-2 text-sm text-muted">
        Revisa el contexto antes de decidir. Toda medida exige justificación
        (§11.3) y queda registrada en la auditoría. Una alerta no es una condena:
        aplica medidas proporcionales.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Denuncias abiertas ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-muted">No hay denuncias pendientes.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-surface p-4">
                <header className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {r.reason} · {r.targetType}
                  </span>
                  <span className="text-muted">
                    denunciado por {r.reporterAlias} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </header>
                {r.excerpt && (
                  <p className="mt-2 rounded border border-border bg-background px-3 py-2 text-sm leading-7">
                    {r.excerpt}…
                    {r.authorAlias && (
                      <span className="ml-2 text-muted">(autor: {r.authorAlias})</span>
                    )}
                  </p>
                )}
                {r.details && <p className="mt-2 text-sm text-muted">Detalle del denunciante: {r.details}</p>}

                <div className="mt-3 space-y-2">
                  {[
                    { action: "hide", label: "Ocultar contenido" },
                    { action: "restore", label: "Restaurar (no procede ocultar)" },
                    { action: "restrict", label: "Restringir al autor (días):" },
                    { action: "warn", label: "Registrar advertencia" },
                  ].map((opt) => (
                    <form
                      key={opt.action}
                      action={resolverDenuncia}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <input type="hidden" name="reportId" value={r.id} />
                      <input type="hidden" name="action" value={opt.action} />
                      {opt.action === "restrict" && (
                        <input
                          name="days"
                          type="number"
                          min={1}
                          max={90}
                          defaultValue={7}
                          className="w-20 rounded border border-border bg-background px-2 py-1"
                        />
                      )}
                      <input
                        name="justification"
                        required
                        minLength={10}
                        placeholder="Justificación (mín. 10 caracteres)"
                        className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        className="rounded border border-border px-3 py-1 hover:bg-accent-soft"
                      >
                        {opt.label}
                      </button>
                    </form>
                  ))}
                  <form action={descartarDenuncia} className="flex items-center gap-2 text-sm">
                    <input type="hidden" name="reportId" value={r.id} />
                    <input
                      name="justification"
                      required
                      minLength={10}
                      placeholder="Motivo del archivo"
                      className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="rounded border border-border px-3 py-1 text-muted hover:bg-accent-soft"
                    >
                      Descartar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Apelaciones pendientes ({appeals.length})</h2>
        {appeals.length === 0 ? (
          <p className="mt-3 text-muted">No hay apelaciones pendientes.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {appeals.map((a) => (
              <li key={a.id} className="rounded-xl border border-border bg-surface p-4">
                <header className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{a.userAlias}</span>
                  <span className="text-muted">
                    {new Date(a.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </header>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{a.statement}</p>
                <div className="mt-3 space-y-2">
                  {[
                    { uphold: "no", label: "Estimar: revocar la medida" },
                    { uphold: "si", label: "Desestimar: mantener la medida" },
                  ].map((opt) => (
                    <form key={opt.uphold} action={decidirApelacion} className="flex flex-wrap items-center gap-2 text-sm">
                      <input type="hidden" name="appealId" value={a.id} />
                      <input type="hidden" name="uphold" value={opt.uphold} />
                      <input
                        name="reason"
                        required
                        minLength={10}
                        placeholder="Motivo de la decisión"
                        className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        className="rounded border border-border px-3 py-1 hover:bg-accent-soft"
                      >
                        {opt.label}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-sm text-muted">
        Los identificadores de contenido para denunciar se muestran en los enlaces
        del lector; los usuarios también pueden usar{" "}
        <Link href="/denuncia" className="underline underline-offset-2">
          /denuncia
        </Link>
        .
      </p>
    </div>
  );
}
