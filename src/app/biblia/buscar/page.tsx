import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { parseReference } from "@/bible/reference";
import { slugOf } from "@/bible/slug";
import { BOOK_BY_CODE } from "@/bible/catalog";
import { getPublishedEdition, searchVerses } from "@/bible/queries";
import { displayBibleVerse } from "@/bible/display-text";

export const metadata: Metadata = { title: "Buscar en la Biblia" };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

// Búsqueda por referencia y búsqueda textual real (§6.1). searchParams se
// consume dentro del límite de Suspense (PPR).

export default function BuscarPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Buscar en la Biblia</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Buscando…</p>}>
        <BuscarCuerpo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BuscarCuerpo({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  const edition = await getPublishedEdition();
  if (!edition) {
    return (
      <p className="mt-6 text-muted">
        No hay ninguna edición bíblica publicada todavía.
      </p>
    );
  }

  // 1) ¿Es una referencia con capítulo? → enlace directo al capítulo (el
  //    rango de versículos lo valida el lector en servidor).
  const ref = term ? parseReference(term) : null;
  if (ref?.chapter) {
    const params = new URLSearchParams();
    if (ref.verseStart) {
      params.set(
        "v",
        `${ref.verseStart}${ref.verseEnd && ref.verseEnd !== ref.verseStart ? `-${ref.verseEnd}` : ""}`
      );
    }
    const qs = params.toString();
    const url = `/biblia/${slugOf(ref.code)}/${ref.chapter}${qs ? `?${qs}` : ""}`;
    return (
      <>
        <FormBusqueda term={term} />
        <p className="mt-6" role="status">
          Interpretado como referencia →{" "}
          <Link
            href={url}
            className="font-medium text-accent underline underline-offset-2"
          >
            {BOOK_BY_CODE.get(ref.code)?.name_es} {ref.chapter}
            {ref.verseStart
              ? `:${ref.verseStart}${ref.verseEnd ? `-${ref.verseEnd}` : ""}`
              : ""}
          </Link>
        </p>
      </>
    );
  }

  // 2) Búsqueda textual.
  const results = term ? await searchVerses(term, edition.id) : [];
  const bookName = ref ? BOOK_BY_CODE.get(ref.code)?.name_es : null;

  return (
    <>
      <FormBusqueda term={term} />

      {term && (
        <p className="mt-6 text-sm text-muted" role="status">
          {results.length > 0
            ? `${results.length} resultado(s) para «${term}»`
            : `Sin resultados para «${term}»`}
          {bookName && (
            <>
              {" "}· ¿Buscabas el libro{" "}
              <Link
                href={`/biblia/${slugOf(ref!.code)}`}
                className="underline underline-offset-2"
              >
                {bookName}
              </Link>
              ?
            </>
          )}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {results.map((hit) => (
          <li key={`${hit.bookCode}-${hit.chapter}-${hit.verseNumber}`}>
            <Link
              href={`/biblia/${slugOf(hit.bookCode)}/${hit.chapter}?v=${hit.verseNumber}`}
              className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-accent"
            >
              <span className="text-sm font-medium text-accent">
                {hit.bookName} {hit.chapter}:{hit.verseNumber}
              </span>
              <p className="mt-1 leading-7">
                {displayBibleVerse(hit.text, { bookCode: hit.bookCode, chapter: hit.chapter, verseNumber: hit.verseNumber }, edition.identifier)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function FormBusqueda({ term }: { term: string }) {
  return (
    <form action="/biblia/buscar" className="mt-6 flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={term}
        placeholder="Texto o referencia (p. ej. «Jn 3,16»)"
        aria-label="Buscar en la Biblia"
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
      >
        Buscar
      </button>
    </form>
  );
}
