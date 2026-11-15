import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLibraryBook, getLibraryBooks } from "@/library/catalog";
import { parseLibraryMarkdown } from "@/library/markdown";
import { readLibraryBook } from "@/library/source";
import { LibraryDocumentReader } from "@/library/ui/document-reader";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getLibraryBooks().map((book) => ({ id: book.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = getLibraryBook(id);
  return {
    title: book ? book.title + " · Biblioteca" : "Biblioteca",
    description: book?.description,
    robots: { index: false, follow: true },
    ...(book ? { alternates: { canonical: "/biblioteca/" + book.id } } : {}),
  };
}

export default function LibraryBookPage({ params }: Props) {
  return (
    <Suspense fallback={
      <p className="mx-auto max-w-3xl px-5 py-8 text-muted" role="status">
        Cargando lectura…
      </p>
    }>
      <BookBody params={params} />
    </Suspense>
  );
}

async function BookBody({ params }: Props) {
  const { id } = await params;
  const book = getLibraryBook(id);
  if (!book) notFound();

  const markdown = await readLibraryBook(book);
  const document = parseLibraryMarkdown(markdown);
  const books = getLibraryBooks();
  const position = books.findIndex((entry) => entry.id === id);
  const previous = position > 0 ? books[position - 1] : null;
  const next = position >= 0 ? books[position + 1] ?? null : null;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6 sm:px-7 sm:pt-9 lg:px-10">
      <nav aria-label="Miga de pan" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent hover:underline">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/biblioteca" className="hover:text-accent hover:underline">Biblioteca</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{book.title}</span>
      </nav>

      <div className="mb-7 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-accent">{book.category}</p>
          <h1
            className="mt-3 text-[clamp(2.05rem,4vw,3.2rem)] font-normal leading-[1.2] tracking-[-.035em]"
            style={{ fontFamily: "var(--font-library-literata), Georgia, serif" }}
          >
            {book.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-[1.7] text-muted">{book.description}</p>
        </div>
        <Link
          href="/biblioteca"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-soft"
        >
          ← Todas las obras
        </Link>
      </div>

      {book.cover && (
        <figure className="mb-7 max-w-[520px] overflow-hidden rounded-xl border border-border bg-surface">
          <div className="relative aspect-[16/9]">
            <Image src={book.cover} alt={book.coverAlt} fill className="object-contain" sizes="(max-width: 640px) 100vw, 520px" />
          </div>
          <figcaption className="px-4 py-3 text-xs leading-5 text-muted">
            Recurso documental asociado a esta obra. Consulta su procedencia en el catálogo de imágenes.
          </figcaption>
        </figure>
      )}

      <aside className="mb-7 grid gap-3 rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted sm:grid-cols-2 sm:gap-6 sm:p-5">
        <div>
          <p><strong className="text-foreground">Extensión conservada:</strong> {book.extent}</p>
          <p className="mt-1"><strong className="text-foreground">Testimonio de referencia:</strong> {book.sourceWitness}</p>
          <p className="mt-1"><strong className="text-foreground">Título de partida:</strong> {book.originalTitle}</p>
        </div>
        <div>
          <p><strong className="text-foreground">Traducción inglesa:</strong> {book.sourceTranslator} (dominio público)</p>
          <p className="mt-1"><strong className="text-foreground">Edición española:</strong> traducción de trabajo desde el inglés.</p>
          <a href={book.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-accent underline underline-offset-2">
            Consultar texto fuente y derechos
          </a>
        </div>
      </aside>

      {book.draft && (
        <p className="mb-6 border-l-[3px] border-accent pl-4 text-sm leading-[1.7] text-muted">
          <strong className="text-foreground">Traducción provisional.</strong> Este texto no se ha cotejado todavía
          de forma independiente con el manuscrito griego o copto. Las lagunas,
          las reconstrucciones y la numeración original se mantienen diferenciadas.
          No forma parte de la Biblia canónica.
        </p>
      )}

      <LibraryDocumentReader document={document} />

      <nav aria-label="Otras obras de la Biblioteca" className="mt-9 flex flex-col justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        {previous ? (
          <Link href={"/biblioteca/" + previous.id} className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-accent hover:bg-accent-soft">
            ← {previous.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={"/biblioteca/" + next.id} className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-accent hover:bg-accent-soft">
            {next.title} →
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
