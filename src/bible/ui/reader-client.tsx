"use client";

// Lector bíblico interactivo: selección de versículos, panel contextual
// (esqueleto honesto: los comentarios llegan en Fase 3), tamaño de letra.
// La preferencia de tamaño vive en localStorage vía useSyncExternalStore
// (sin efectos con setState, compatible con hidratación).

import { useMemo, useState, useSyncExternalStore } from "react";
import { Literata } from "next/font/google";
import type { VerseRow } from "@/bible/queries";
import { displayBibleVerse } from "@/bible/display-text";

interface Props {
  slug: string;
  bookName: string;
  bookCode: string;
  chapter: number;
  editionAbbr: string;
  verses: VerseRow[];
  initialRange: { start: number; end: number } | null;
}

// Misma intención tipográfica de la lectura Android: cuerpo de libro, no UI.
const readerFont = Literata({ subsets: ["latin"], display: "swap" });

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
  if (prev.start === n && prev.end === n) return null; // deseleccionar
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
}: Props) {
  const [selected, setSelected] = useState(initialRange);
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

  const refLabel = useMemo(
    () =>
      selected
        ? `${bookName} ${chapter}:${
            selected.start === selected.end ? selected.start : `${selected.start}-${selected.end}`
          }`
        : null,
    [selected, bookName, chapter]
  );

  const selectedText = useMemo(() => {
    if (!selected) return "";
    return verses
      .filter((v) => v.verseNumber >= selected.start && v.verseNumber <= selected.end)
      .map((v) => `${v.verseNumber} ${displayBibleVerse(v.text, { bookCode, chapter, verseNumber: v.verseNumber })}`)
      .join("\n");
  }, [selected, verses, bookCode, chapter]);

  async function copyLink() {
    if (!selected) return;
    const url = `${window.location.origin}/biblia/${slug}/${chapter}?v=${selected.start}-${selected.end}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // portapapeles no disponible: no se simula éxito
    }
  }

  return (
    <div>
      {/* Barra de herramientas de lectura */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-2 text-sm backdrop-blur">
        <span className="text-muted">
          {editionAbbr} · Capítulo {chapter}
        </span>
        <div className="flex items-center gap-1">
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

      {/* V17: cada versículo tiene número visible y párrafo propio.
          La edición RV1909 mantiene exactamente su ortografía histórica.
          Las versales decorativas del inicio se normalizan solo al mostrar.
          Android separaba los versículos con \n\n: aquí se respeta el
          ritmo de lectura con espacio vertical, sin alterar la base. */}
      <article
        aria-label={`Texto bíblico de ${bookName} ${chapter}`}
        className={`${readerFont.className} mx-auto max-w-[44rem] space-y-2 pb-5 sm:space-y-3`}
        style={{ fontSize: `${19 * fontScale / 100}px` }}
      >
        {verses.map((v) => {
          const inRange =
            Boolean(selected && v.verseNumber >= selected.start && v.verseNumber <= selected.end);
          const selectVerse = () => setSelected((prev) => verseClickLogic(prev, v.verseNumber));
          return (
            <div
              key={v.verseKey}
              id={`v${v.verseNumber}`}
              data-verse-number={v.verseNumber}
              className={
                inRange
                  ? "grid scroll-mt-24 grid-cols-[2.4rem_minmax(0,1fr)] gap-x-2 rounded-lg bg-accent-soft px-1 py-1.5 transition-colors sm:px-2"
                  : "grid scroll-mt-24 grid-cols-[2.4rem_minmax(0,1fr)] gap-x-2 rounded-lg px-1 py-1.5 transition-colors hover:bg-accent-soft/50 sm:px-2"
              }
            >
              <button
                type="button"
                onClick={selectVerse}
                aria-label={`Seleccionar versículo ${v.verseNumber}`}
                aria-pressed={inRange}
                className="flex min-h-10 w-full items-start justify-center rounded-md pt-[.25em] text-[.8em] font-semibold leading-[1.7] text-accent tabular-nums transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {v.verseNumber}
              </button>
              <p
                className="min-w-0 cursor-pointer leading-[1.7] text-foreground"
                onClick={selectVerse}
              >
                {v.text ? (
                  displayBibleVerse(v.text, { bookCode, chapter, verseNumber: v.verseNumber })
                ) : (
                  <em className="text-muted">
                    (Este versículo no tiene texto independiente en esta edición; su
                    contenido forma parte del anterior por diferencias de numeración.)
                  </em>
                )}
              </p>
            </div>
          );
        })}
      </article>

      {/* Panel contextual desplegable (esqueleto Fase 2, §6.3) */}
      {selected && (
        <aside
          aria-label="Panel contextual del pasaje"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface shadow-lg lg:static lg:mt-8 lg:max-w-2xl lg:rounded-xl lg:border lg:shadow-none"
        >
          <div className="mx-auto flex max-w-2xl items-start justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{refLabel}</p>
              <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted">{selectedText}</p>
              <p className="mt-2 text-sm text-muted">
                Los comentarios y reflexiones sobre pasajes llegarán con la comunidad
                (Fase 3).
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
              >
                Cerrar
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
