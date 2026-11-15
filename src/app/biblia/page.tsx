import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublishedEdition, getEditionBooks } from "@/bible/queries";
import { slugOf } from "@/bible/slug";

export const metadata: Metadata = { title: "Biblia" };

// Índice de la Biblia con datos reales de la base de datos (edición publicada).
// El contenido consulta la base de datos por petición (streaming bajo PPR);
// si no hay edición publicada, estado honesto (§0.2).

export default function BibliaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Biblia</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Cargando índice…</p>}>
        <BibleIndex />
      </Suspense>
    </div>
  );
}

async function BibleIndex() {
  const edition = await getPublishedEdition();

  if (!edition) {
    return (
      <p className="mt-3 text-muted">
        Todavía no hay ninguna edición bíblica publicada. La primera edición prevista
        es la Reina-Valera 1909 (dominio público), pendiente de importación y
        verificación.
      </p>
    );
  }

  const books = await getEditionBooks(edition.id);
  const antiguo = books.filter((b) => b.testament === "AT");
  const nuevo = books.filter((b) => b.testament === "NT");

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <form action="/biblia/buscar" className="mt-6 flex w-full max-w-xl gap-2">
          <input
            type="search"
            name="q"
            placeholder="Buscar texto o referencia (p. ej. «de tal manera» o «Jn 3,16»)"
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
        <p className="mt-2 w-full text-sm text-muted">
          {edition.fullName} ({edition.abbreviation}) · {edition.canonCoverage} ·{" "}
          {edition.language} ·{" "}
          <Link href="/informacion" className="underline underline-offset-2">
            derechos y procedencia
          </Link>
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Antiguo Testamento · {antiguo.length} libros
        </h2>
        <BooksList books={antiguo} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Nuevo Testamento · {nuevo.length} libros
        </h2>
        <BooksList books={nuevo} />
      </section>
    </>
  );
}

function BooksList({
  books,
}: {
  books: Awaited<ReturnType<typeof getEditionBooks>>;
}) {
  return (
    <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((b) => (
        <li key={b.code}>
          <Link
            href={`/biblia/${slugOf(b.code)}`}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <span className="font-medium">{b.name_es}</span>
            <span className="text-sm text-muted">{b.chapters} cap.</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
