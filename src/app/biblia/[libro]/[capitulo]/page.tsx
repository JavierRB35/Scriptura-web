import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BOOK_BY_SLUG, slugOf } from "@/bible/slug";
import { getPublishedEdition, getChapter } from "@/bible/queries";
import { ReaderClient } from "@/bible/ui/reader-client";

interface Props {
  params: Promise<{ libro: string; capitulo: string }>;
  searchParams: Promise<{ v?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { libro, capitulo } = await params;
  const book = BOOK_BY_SLUG.get(libro);
  return { title: book ? `${book.name_es} ${capitulo}` : "Biblia" };
}

// Lector de capítulo. URL estable /biblia/[libro]/[capitulo] con selector
// profundo ?v=inicio-fin validado en servidor (§6.1, §6.2). params y
// searchParams se consumen dentro del límite de Suspense (PPR).

export default function ChapterPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<p className="mx-auto mt-6 max-w-3xl px-4 text-muted">Cargando…</p>}>
      <ChapterBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ChapterBody({ params, searchParams }: Props) {
  const { libro, capitulo } = await params;
  const { v } = await searchParams;

  const book = BOOK_BY_SLUG.get(libro);
  const chapterNumber = Number(capitulo);
  if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1) notFound();

  const edition = await getPublishedEdition();
  if (!edition) notFound();

  const chapter = await getChapter(book.code, chapterNumber, edition.id);
  if (!chapter) notFound();

  // Validación en servidor del rango de versículos del enlace profundo.
  let initialRange: { start: number; end: number } | null = null;
  if (v) {
    const m = v.match(/^(\d+)(?:-(\d+))?$/);
    if (m) {
      const start = Number(m[1]);
      const end = Number(m[2] ?? m[1]);
      const max =
        chapter.verses.length > 0
          ? chapter.verses[chapter.verses.length - 1].verseNumber
          : 0;
      if (start >= 1 && end >= start && end <= max) {
        initialRange = { start, end };
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-32 pt-5 sm:px-6 sm:pt-8 lg:pb-12">
      <nav aria-label="Miga de pan" className="text-sm text-muted">
        <Link href="/biblia" className="underline underline-offset-2">
          Biblia
        </Link>{" "}
        /{" "}
        <Link
          href={`/biblia/${slugOf(book.code)}`}
          className="underline underline-offset-2"
        >
          {chapter.bookName}
        </Link>{" "}
        / Capítulo {chapter.chapterNumber} de {chapter.chapterCount}
      </nav>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {chapter.bookName} {chapter.chapterNumber}
      </h1>

      <ReaderClient
        slug={libro}
        bookName={chapter.bookName}
        bookCode={chapter.bookCode}
        chapter={chapter.chapterNumber}
        editionAbbr={edition.abbreviation}
        verses={chapter.verses}
        initialRange={initialRange}
      />

      {/* Navegación anterior/siguiente */}
      <nav
        aria-label="Capítulos"
        className="mt-10 flex items-center justify-between border-t border-border pt-6"
      >
        {chapter.prev ? (
          <Link
            href={`/biblia/${chapter.prev.slug}/${chapter.prev.chapter}`}
            className="rounded-lg border border-border px-4 py-2 hover:bg-accent-soft"
          >
            ← {chapter.prev.label}
          </Link>
        ) : (
          <span />
        )}
        {chapter.next ? (
          <Link
            href={`/biblia/${chapter.next.slug}/${chapter.next.chapter}`}
            className="rounded-lg border border-border px-4 py-2 hover:bg-accent-soft"
          >
            {chapter.next.label} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
