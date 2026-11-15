import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/auth/session";
import { getDebate, listDebateComments } from "@/community/service";
import { intervenirDebate, seguirDebate } from "@/community/actions";
import { slugOf } from "@/bible/slug";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const debate = await getDebate(id).catch(() => null);
  return { title: debate ? debate.title : "Debate" };
}

export default function DebatePage({ params }: Props) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-12 text-muted">Cargando…</p>}>
      <DebateBody params={params} />
    </Suspense>
  );
}

async function DebateBody({ params }: Props) {
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) notFound();

  const user = await getCurrentUser();
  const comments = user ? await listDebateComments(debate.id) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav aria-label="Miga de pan" className="text-sm text-muted">
        <Link href="/debates" className="underline underline-offset-2">
          Debates
        </Link>{" "}
        / {debate.title}
      </nav>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{debate.title}</h1>
      <p className="mt-2 text-lg text-muted">{debate.mainQuestion}</p>
      <p className="mt-4 whitespace-pre-wrap leading-8">{debate.description}</p>

      {debate.guidingQuestions.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Preguntas orientativas
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {debate.guidingQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {debate.passages.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Pasajes relacionados
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {debate.passages.map((p, i) => (
              <li key={i}>
                <Link
                  href={`/biblia/${slugOf(p.bookCode)}/${p.chapter}?v=${p.verseStart}-${p.verseEnd}`}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-accent hover:border-accent"
                >
                  {p.bookName} {p.chapter}:{p.verseStart}
                  {p.verseEnd !== p.verseStart ? `-${p.verseEnd}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {user && (
        <form action={seguirDebate} className="mt-6">
          <input type="hidden" name="debateId" value={debate.id} />
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent-soft"
          >
            ☆ Seguir / dejar de seguir
          </button>
        </form>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Conversación</h2>

        {!user ? (
          <p className="mt-3 text-muted">
            <Link href="/entrar" className="underline underline-offset-2">
              Entra
            </Link>{" "}
            para participar en el debate.
          </p>
        ) : (
          <>
            <form action={intervenirDebate} className="mt-4 rounded-lg border border-border p-3">
              <input type="hidden" name="debateId" value={debate.id} />
              <textarea
                name="body"
                required
                minLength={1}
                maxLength={4000}
                rows={3}
                placeholder="Comparte tu perspectiva con respeto…"
                className="w-full rounded border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="mt-2 rounded bg-accent px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Participar
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="mt-4 text-muted">Todavía no hay intervenciones.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
                    <header className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{c.authorAlias}</span>
                      <span className="text-muted">
                        {new Date(c.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </header>
                    <p className="mt-1 whitespace-pre-wrap leading-7">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
