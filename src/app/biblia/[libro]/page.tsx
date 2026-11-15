import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BOOK_BY_SLUG, slugOf } from "@/bible/slug";
import { getPublishedEdition, getEditionBooks } from "@/bible/queries";

interface Props {
  params: Promise<{ libro: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { libro } = await params;
  const book = BOOK_BY_SLUG.get(libro);
  return { title: book ? book.name_es : "Biblia" };
}

// Rejilla de capítulos de un libro (libros largos en rejilla, §6).
// params se consume dentro del límite de Suspense (PPR).

export default function BookPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="mx-auto mt-6 max-w-3xl px-4 text-muted">Cargando…</p>}>
      <BookBody params={params} />
    </Suspense>
  );
}

async function BookBody({ params }: Props) {
  const { libro } = await params;
  const book = BOOK_BY_SLUG.get(libro);
  if (!book) notFound();

  const edition = await getPublishedEdition();
  if (!edition) notFound();

  const books = await getEditionBooks(edition.id);
  const info = books.find((b) => b.code === book.code);

  let content;
  if (!info) {
    // El libro existe en el catálogo pero no en esta edición (p. ej.
    // deuterocanónicos en RV1909): estado honesto, sin datos inventados.
    content = (
      <>
        <p className="mt-3 text-muted">
          Este libro no está incluido en la edición publicada actualmente
          ({edition.fullName}), cuyo canon cubre {edition.canonCoverage}. Las ediciones
          con los deuterocanónicos se incorporarán cuando haya fuentes verificadas y
          derechos acreditados.
        </p>
        <Link href="/biblia" className="mt-4 inline-block underline underline-offset-2">
          Volver al índice
        </Link>
      </>
    );
  } else {
    const chapters = Array.from({ length: info.chapters }, (_, i) => i + 1);
    content = (
      <>
        <p className="mt-1 text-sm text-muted">
          {info.chapters} capítulos · {edition.fullName}
        </p>
        <ul className="mt-8 grid grid-cols-5 gap-2 sm:grid-cols-8">
          {chapters.map((n) => (
            <li key={n}>
              <Link
                href={`/biblia/${slugOf(book.code)}/${n}`}
                className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface font-medium transition-colors hover:border-accent hover:bg-accent-soft"
              >
                {n}
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav aria-label="Miga de pan" className="text-sm text-muted">
        <Link href="/biblia" className="underline underline-offset-2">
          Biblia
        </Link>{" "}
        / {book.name_es}
      </nav>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{book.name_es}</h1>
      {content}
    </div>
  );
}
