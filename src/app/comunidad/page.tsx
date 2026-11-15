import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { recentComments, recognizedParticipants, listPublishedDebates } from "@/community/service";
import { slugOf } from "@/bible/slug";

export const metadata: Metadata = { title: "Comunidad" };

// Comunidad: espacio exclusivo de miembros (D06, §18.7). Sin sesión NO se
// consulta ningún dato comunitario; el visitante ve solo la presentación.

export default function ComunidadPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-5xl px-4 py-12 text-muted">Cargando…</p>}>
      <ComunidadBody />
    </Suspense>
  );
}

async function ComunidadBody() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Comunidad</h1>
        <p className="mt-3 max-w-2xl text-muted">
          La comunidad es un espacio reservado para personas registradas:
          reflexiones sobre pasajes, debates guiados y participantes reconocidos.
        </p>
        <p className="mt-3 max-w-2xl text-muted">
          Puedes{" "}
          <Link href="/registro" className="underline underline-offset-2">
            crear una cuenta gratis
          </Link>{" "}
          o{" "}
          <Link href="/entrar" className="underline underline-offset-2">
            entrar
          </Link>{" "}
          para participar. La lectura de la Biblia sigue siendo pública en{" "}
          <Link href="/biblia" className="underline underline-offset-2">
            /biblia
          </Link>
          .
        </p>
      </div>
    );
  }

  const [comments, debates, participants] = await Promise.all([
    recentComments(20),
    listPublishedDebates(5),
    recognizedParticipants(6),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Comunidad</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Reflexiones recientes</h2>
        {comments.length === 0 ? (
          <p className="mt-3 text-muted">
            Todavía no hay reflexiones publicadas.{" "}
            <Link href="/biblia" className="underline underline-offset-2">
              Elige un pasaje
            </Link>{" "}
            y comparte la primera.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
                <Link
                  href={`/biblia/${slugOf(c.bookCode)}/${c.chapter}?v=${c.verseStart}-${c.verseEnd}`}
                  className="text-sm font-medium text-accent"
                >
                  {c.bookName} {c.chapter}:
                  {c.verseStart === c.verseEnd ? c.verseStart : `${c.verseStart}-${c.verseEnd}`}
                </Link>
                <p className="mt-1 leading-7">{c.excerpt}…</p>
                <p className="mt-2 text-sm text-muted">por {c.authorAlias}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Debates activos</h2>
        {debates.length === 0 ? (
          <p className="mt-3 text-muted">
            No hay debates publicados todavía.{" "}
            <Link href="/debates/proponer" className="underline underline-offset-2">
              Propón el primero
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {debates.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/debates/${d.id}`}
                  className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-accent"
                >
                  <span className="font-medium">{d.title}</span>
                  <span className="ml-2 text-sm text-muted">{d.mainQuestion}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Participantes reconocidos</h2>
        {participants.length === 0 ? (
          <p className="mt-3 text-muted">
            Los reconocimientos aparecerán conforme la comunidad participe.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((p) => (
              <li
                key={p.alias}
                className="rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="font-medium">{p.alias}</span>
                <p className="text-sm text-muted">
                  {p.level} · {p.total} puntos
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
