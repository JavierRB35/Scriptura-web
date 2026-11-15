import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { hasValidConsent, remainingQuota } from "@/ai/assistant";
import { aiConfiguredStatus } from "@/ai/assistant-ui-helpers";
import { preguntarAsistente, darConsentimientoIA, revocarConsentimientoIA } from "@/ai/actions";
import type { AssistantSource } from "@/ai/assistant";

export const metadata: Metadata = { title: "Asistente de lectura" };

interface Props {
  searchParams: Promise<{
    pregunta?: string; respuesta?: string; fuentes?: string;
    error?: string; restante?: string; ia?: string;
  }>;
}

// Asistente de lectura (§12): consentimiento explícito, cuota diaria y
// respuesta con fuentes verificables. Sin configuración de IA: estado honesto.

export default function AsistentePage({ searchParams }: Props) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-12 text-muted">Cargando…</p>}>
      <AsistenteBody searchParams={searchParams} />
    </Suspense>
  );
}

async function AsistenteBody({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const configured = aiConfiguredStatus();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Asistente de lectura</h1>
        <p className="mt-3 text-muted">
          El asistente acompaña a personas registradas para comprender pasajes y
          explorar interpretaciones documentadas.{" "}
          <Link href="/entrar" className="underline underline-offset-2">Entra</Link> o{" "}
          <Link href="/registro" className="underline underline-offset-2">regístrate</Link>.
        </p>
      </div>
    );
  }

  const consent = await hasValidConsent(user.id);
  const remaining = Number(sp.restante ?? (await remainingQuota(user.id)));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Asistente de lectura</h1>

      {!configured && (
        <p className="mt-4 rounded-xl border border-border bg-accent-soft px-4 py-3 text-sm">
          El asistente de IA no está configurado todavía en la plataforma. Cuando el
          propietario active un proveedor, estará disponible aquí con las garantías
          de consentimiento, cuota y fuentes verificables.
        </p>
      )}

      {configured && !consent && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-medium">Consentimiento para usar el asistente</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Al activarlo, tus preguntas y el contexto mínimo necesario (versículos y
            fragmentos documentales recuperados) se envían al proveedor de IA para
            generar la respuesta. El texto bíblico citado proviene siempre del
            repositorio autorizado de Scriptura, nunca del modelo. Puedes revocar
            el consentimiento en cualquier momento desde aquí o en Mi espacio.
          </p>
          <form action={darConsentimientoIA} className="mt-4">
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
            >
              Activar asistente
            </button>
          </form>
        </div>
      )}

      {configured && consent && (
        <>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">Consultas restantes hoy: {remaining}</span>
            <form action={revocarConsentimientoIA}>
              <button type="submit" className="rounded border border-border px-3 py-1 text-xs hover:bg-accent-soft">
                Revocar consentimiento
              </button>
            </form>
          </div>

          <form action={preguntarAsistente} className="mt-6 space-y-3">
            <textarea
              name="pregunta"
              required
              minLength={8}
              maxLength={500}
              rows={3}
              placeholder="Ej.: ¿Qué dice Juan 3:16? ¿Cómo se interpreta?"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={remaining <= 0}
              className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Preguntar al asistente
            </button>
          </form>

          {sp.error && (
            <p role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              {sp.error}
            </p>
          )}

          {sp.respuesta && (
            <section className="mt-8 rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">Respuesta</h2>
              <p className="mt-3 whitespace-pre-wrap leading-8">{sp.respuesta}</p>

              {sp.fuentes && (
                <>
                  <h3 className="mt-5 text-sm font-semibold">Fuentes citadas</h3>
                  <ul className="mt-2 space-y-2">
                    {(JSON.parse(sp.fuentes) as AssistantSource[]).map((s, i) => (
                      <li key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                        <Link href={s.link} className="font-medium text-accent underline-offset-2 hover:underline">
                          {s.kind === "versiculo" ? "Versículo" : "Documento"}: {s.label}
                        </Link>
                        {s.tradition && <span className="ml-2 text-xs text-muted">({s.tradition})</span>}
                        <p className="mt-1 text-muted">{s.excerpt}…</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-4 text-xs text-muted">
                Las interpretaciones generadas pueden contener errores y no
                constituyen doctrina oficial de ninguna confesión (§12.5): contrasta
                siempre con los textos.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
