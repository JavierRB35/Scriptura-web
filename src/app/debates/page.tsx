import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { listPublishedDebates } from "@/community/service";

export const metadata: Metadata = { title: "Debates" };

// Debates guiados: espacio reservado a miembros (D06).

export default function DebatesPage({
  searchParams,
}: {
  searchParams: Promise<{ propuesta?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-4xl px-4 py-12 text-muted">Cargando…</p>}>
      <DebatesBody searchParams={searchParams} />
    </Suspense>
  );
}

async function DebatesBody({
  searchParams,
}: {
  searchParams: Promise<{ propuesta?: string }>;
}) {
  const { propuesta } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Debates</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Debates guiados vinculados a las Escrituras, con textos relacionados y
          conversaciones constructivas. Espacio reservado a personas registradas.
        </p>
        <div className="mt-4">
          <Link
            href="/registro"
            className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    );
  }

  const debates = await listPublishedDebates(30);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Debates</h1>
        <Link
          href="/debates/proponer"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
        >
          Proponer debate
        </Link>
      </div>

      {propuesta === "enviada" && (
        <p className="mt-4 rounded-lg border border-border bg-accent-soft px-4 py-3 text-sm">
          Tu propuesta ha sido enviada. La revisará el equipo editorial y recibirás
          una notificación con el resultado.
        </p>
      )}

      {debates.length === 0 ? (
        <p className="mt-6 text-muted">
          No hay debates publicados todavía. Puedes{" "}
          <Link href="/debates/proponer" className="underline underline-offset-2">
            proponer uno
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {debates.map((d) => (
            <li key={d.id}>
              <Link
                href={`/debates/${d.id}`}
                className="block rounded-xl border border-border bg-surface p-5 hover:border-accent"
              >
                <h2 className="text-lg font-medium">{d.title}</h2>
                <p className="mt-1 text-sm text-muted">{d.mainQuestion}</p>
                {d.passages.length > 0 && (
                  <p className="mt-2 text-sm text-accent">
                    {d.passages
                      .map(
                        (p) =>
                          `${p.bookName} ${p.chapter}:${p.verseStart}${p.verseEnd !== p.verseStart ? `-${p.verseEnd}` : ""}`
                      )
                      .join(" · ")}
                  </p>
                )}
                {d.publishedAt && (
                  <p className="mt-2 text-xs text-muted">
                    Publicado el{" "}
                    {new Date(d.publishedAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
