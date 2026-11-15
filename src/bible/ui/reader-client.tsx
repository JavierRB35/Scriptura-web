"use client";

// Lector bíblico interactivo (§6.3, §7): selección de versículos, panel
// contextual con dos vistas — Pasaje (enlace profundo, favorito) y
// Comentarios (publicar, responder, valorar). Todo pasa por server actions
// que validan sesión y pasaje en el servidor.

import { useMemo, useState, useSyncExternalStore } from "react";
import { Literata } from "next/font/google";
import Link from "next/link";
import { displayBibleVerse } from "@/bible/display-text";

const readerFont = Literata({ subsets: ["latin"], display: "swap" });
import type { VerseRow } from "@/bible/queries";
import type { CommentView } from "@/community/service";
import {
  publicarComentario,
  alternarLike,
  alternarFavorito,
} from "@/community/actions";

interface Props {
  slug: string;
  bookName: string;
  bookCode: string;
  chapter: number;
  editionAbbr: string;
  editionId: string;
  verses: VerseRow[];
  initialRange: { start: number; end: number } | null;
  user: { id: string; alias: string } | null;
  comments: CommentView[];
}

const FONT_KEY = "scriptura-font";
const FONT_EVENT = "scriptura-font-change";

function subscribeFont(cb: () => void) {
  window.addEventListener(FONT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(FONT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function verseClickLogic(
  prev: { start: number; end: number } | null,
  n: number
): { start: number; end: number } | null {
  if (!prev) return { start: n, end: n };
  if (prev.start === n && prev.end === n) return null;
  if (n < prev.start) return { start: n, end: prev.end };
  if (n > prev.end) return { start: prev.start, end: n };
  return { start: n, end: n };
}

export function ReaderClient({
  slug,
  bookName,
  bookCode,
  chapter,
  editionAbbr,
  verses,
  initialRange,
  user,
  comments,
}: Props) {
  const [selected, setSelected] = useState(initialRange);
  const [panel, setPanel] = useState<"none" | "pasaje" | "comentarios">(
    initialRange ? "pasaje" : "none"
  );
  const [copied, setCopied] = useState(false);

  const fontScale = useSyncExternalStore(
    subscribeFont,
    () => {
      const n = Number(localStorage.getItem(FONT_KEY));
      return Number.isFinite(n) && n >= 80 && n <= 180 ? n : 100;
    },
    () => 100
  );

  function changeFont(delta: number) {
    const current = Number(localStorage.getItem(FONT_KEY)) || 100;
    const next = Math.min(180, Math.max(80, current + delta));
    localStorage.setItem(FONT_KEY, String(next));
    window.dispatchEvent(new Event(FONT_EVENT));
  }

  const refLabel = selected
    ? `${bookName} ${chapter}:${
        selected.start === selected.end ? selected.start : `${selected.start}-${selected.end}`
      }`
    : null;

  const backPath = `/biblia/${slug}/${chapter}`;

  const shownComments = useMemo(() => {
    if (!selected) return comments;
    const inRange = comments.filter(
      (c) => c.verseStart <= selected.end && c.verseEnd >= selected.start
    );
    return inRange.length > 0 ? inRange : comments;
  }, [comments, selected]);

  const roots = shownComments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => shownComments.filter((c) => c.parentId === id);

  // Resumen del pasaje seleccionado para el panel: presentación con ortografía
  // actualizada; el texto canónico de la base no se altera.
  const selectedText = useMemo(() => {
    if (!selected) return "";
    return verses
      .filter((v) => v.verseNumber >= selected.start && v.verseNumber <= selected.end)
      .map(
        (v) =>
          `${v.verseNumber} ${displayBibleVerse(v.text, { bookCode, chapter, verseNumber: v.verseNumber })}`
      )
      .join("\n");
  }, [selected, verses, bookCode, chapter]);

  async function copyLink() {
    if (!selected) return;
    const url = `${window.location.origin}${backPath}?v=${selected.start}-${selected.end}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* portapapeles no disponible */
    }
  }

  return (
    <div>
      {/* Barra de herramientas de lectura */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-2 text-sm backdrop-blur">
        <span
          className="min-w-0 text-muted"
          title="Texto original de 1909 conservado; lectura con ortografía actualizada"
        >
          {editionAbbr} · Capítulo {chapter} · {comments.length} reflex.
          <span className="ml-1 text-xs">· ort. actual</span>
        </span>
        <div className="flex items-center gap-1">
          <Link
            href="/biblia/asistente"
            aria-label="Asistente de lectura"
            className="rounded border border-border px-2 py-1 hover:bg-accent-soft"
          >
            ✦ IA
          </Link>
          <button
            type="button"
            aria-label="Comentarios del capítulo"
            onClick={() =>
              setPanel((p) => (p === "comentarios" ? (selected ? "pasaje" : "none") : "comentarios"))
            }
            className={`rounded border border-border px-2 py-1 ${panel === "comentarios" ? "bg-accent text-white" : "hover:bg-accent-soft"}`}
          >
            💬 {comments.length}
          </button>
          <button
            type="button"
            aria-label="Reducir tamaño de letra"
            onClick={() => changeFont(-10)}
            className="rounded border border-border px-2 py-1 hover:bg-accent-soft"
          >
            A−
          </button>
          <button
            type="button"
            aria-label="Aumentar tamaño de letra"
            onClick={() => changeFont(10)}
            className="rounded border border-border px-2 py-1 hover:bg-accent-soft"
          >
            A+
          </button>
        </div>
      </div>

      {/* Texto bíblico */}
      <article className={`${readerFont.className} max-w-2xl space-y-2 leading-loose`} style={{ fontSize: `${fontScale}%` }}>
        {verses.map((v) => {
          const inRange =
            selected && v.verseNumber >= selected.start && v.verseNumber <= selected.end;
          return (
            <p
              key={v.verseKey}
              id={`v${v.verseNumber}`}
              data-verse-number={v.verseNumber}
              aria-label={`Seleccionar versículo ${v.verseNumber}`}
              aria-pressed={inRange ? "true" : "false"}
              className={
                (inRange
                  ? "-mx-1 cursor-pointer rounded bg-accent-soft px-1 transition-colors"
                  : "-mx-1 cursor-pointer px-1 transition-colors hover:bg-accent-soft/50") +
                (v.verseNumber === 1 ? " first-letter:float-left first-letter:mr-2" : "")
              }
              onClick={() => {
                setSelected((prev) => verseClickLogic(prev, v.verseNumber));
                setPanel((p) => (p === "none" ? "pasaje" : p));
              }}
            >
              {v.text ? (
                <>
                  <sup className="mr-1 select-none font-medium text-accent">
                    {v.verseNumber}
                  </sup>
                  {displayBibleVerse(v.text, { bookCode, chapter, verseNumber: v.verseNumber })}
                </>
              ) : (
                <em className="text-muted">
                  {v.verseNumber}. Este versículo no tiene texto independiente en esta
                  edición; su contenido forma parte del versículo anterior
                  (diferencia de numeración).
                </em>
              )}{" "}
            </p>
          );
        })}
      </article>

      {/* Panel contextual desplegable (§6.3) */}
      {panel !== "none" && (
        <aside
          aria-label="Panel contextual"
          className="fixed inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-y-auto border-t border-border bg-surface shadow-lg lg:static lg:mt-8 lg:max-h-none lg:max-w-2xl lg:rounded-xl lg:border lg:shadow-none"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 pt-3">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setPanel("pasaje")}
                className={`rounded px-2 py-1 ${panel === "pasaje" ? "bg-accent text-white" : "text-muted hover:bg-accent-soft"}`}
              >
                Pasaje
              </button>
              <button
                type="button"
                onClick={() => setPanel("comentarios")}
                className={`rounded px-2 py-1 ${panel === "comentarios" ? "bg-accent text-white" : "text-muted hover:bg-accent-soft"}`}
              >
                Comentarios ({comments.length})
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPanel("none")}
              className="rounded border border-border px-2 py-1 text-sm hover:bg-accent-soft"
            >
              Cerrar
            </button>
          </div>

          <div className="mx-auto max-w-2xl px-4 py-3">
            {panel === "pasaje" && (
              <div>
                {selected ? (
                  <>
                    <p className="font-medium">{refLabel}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted">
                      {selectedText}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyLink}
                        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                      >
                        {copied ? "¡Copiado!" : "Copiar enlace"}
                      </button>
                      {user && (
                        <form action={alternarFavorito}>
                          <input type="hidden" name="bookCode" value={bookCode} />
                          <input type="hidden" name="chapter" value={chapter} />
                          <input type="hidden" name="verseStart" value={selected.start} />
                          <input type="hidden" name="verseEnd" value={selected.end} />
                          <input type="hidden" name="back" value={backPath} />
                          <button
                            type="submit"
                            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
                          >
                            ★ Guardar pasaje
                          </button>
                        </form>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted">
                      Selecciona uno o varios versículos para reflexionar sobre ellos.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    Toca un versículo para seleccionarlo; toca otro contiguo para
                    ampliar el pasaje.
                  </p>
                )}
              </div>
            )}

            {panel === "comentarios" && (
              <div className="space-y-4">
                {user ? (
                  selected ? (
                    <form action={publicarComentario} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium">
                        Reflexionar sobre {bookName} {chapter}:
                        {selected.start === selected.end
                          ? selected.start
                          : `${selected.start}-${selected.end}`}
                      </p>
                      <input type="hidden" name="bookCode" value={bookCode} />
                      <input type="hidden" name="chapter" value={chapter} />
                      <input type="hidden" name="verseStart" value={selected.start} />
                      <input type="hidden" name="verseEnd" value={selected.end} />
                      <textarea
                        name="body"
                        required
                        minLength={1}
                        maxLength={4000}
                        rows={3}
                        placeholder="Comparte una reflexión sobre este pasaje…"
                        className="mt-2 w-full rounded border border-border bg-background px-3 py-2 outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        className="mt-2 rounded bg-accent px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                      >
                        Publicar
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-muted">
                      Selecciona un versículo o pasaje para publicar tu reflexión.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted">
                    <a href="/entrar" className="underline underline-offset-2">
                      Entra en tu cuenta
                    </a>{" "}
                    para leer y publicar reflexiones. La Biblia es pública; la
                    comunidad, exclusiva de miembros.
                  </p>
                )}

                {roots.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    replies={repliesOf(c.id)}
                    user={user}
                    backPath={backPath}
                    bookCode={bookCode}
                    chapter={chapter}
                  />
                ))}
                {roots.length === 0 && user && (
                  <p className="text-sm text-muted">
                    Todavía no hay reflexiones {selected ? "sobre este pasaje" : "en este capítulo"}.
                    Puedes iniciar la conversación.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  user,
  backPath,
  bookCode,
  chapter,
}: {
  comment: CommentView;
  replies: CommentView[];
  user: { id: string; alias: string } | null;
  backPath: string;
  bookCode: string;
  chapter: number;
}) {
  const [replying, setReplying] = useState(false);
  const range =
    comment.verseStart === comment.verseEnd
      ? `${comment.verseStart}`
      : `${comment.verseStart}-${comment.verseEnd}`;
  const fecha = new Date(comment.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });

  return (
    <article className="rounded-lg border border-border p-3">
      <header className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{comment.authorAlias}</span>
        <span className="text-muted">
          v.{range} · {fecha}
        </span>
      </header>
      <p className="mt-1 whitespace-pre-wrap leading-7">{comment.body}</p>

      {user && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <form action={alternarLike}>
            <input type="hidden" name="commentId" value={comment.id} />
            <input type="hidden" name="back" value={backPath} />
            <button
              type="submit"
              className={`rounded border border-border px-2 py-0.5 ${comment.likedByMe ? "bg-accent text-white" : "hover:bg-accent-soft"}`}
            >
              ♥ {comment.likeCount}
            </button>
          </form>
          {comment.parentId === null && (
            <button
              type="button"
              onClick={() => setReplying((r) => !r)}
              className="rounded border border-border px-2 py-0.5 hover:bg-accent-soft"
            >
              Responder {comment.replyCount > 0 ? `(${comment.replyCount})` : ""}
            </button>
          )}
        </div>
      )}

      {replying && user && comment.parentId === null && (
        <form action={publicarComentario} className="mt-2">
          <input type="hidden" name="parentId" value={comment.id} />
          <input type="hidden" name="bookCode" value={bookCode} />
          <input type="hidden" name="chapter" value={chapter} />
          <input type="hidden" name="verseStart" value={comment.verseStart} />
          <input type="hidden" name="verseEnd" value={comment.verseEnd} />
          <textarea
            name="body"
            required
            minLength={1}
            maxLength={4000}
            rows={2}
            placeholder={`Responder a ${comment.authorAlias}…`}
            className="mt-2 w-full rounded border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="mt-2 rounded bg-accent px-3 py-1 text-sm font-medium text-white hover:opacity-90"
          >
            Responder
          </button>
        </form>
      )}

      {replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              replies={[]}
              user={user}
              backPath={backPath}
              bookCode={bookCode}
              chapter={chapter}
            />
          ))}
        </div>
      )}
    </article>
  );
}
