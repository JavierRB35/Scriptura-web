import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLibraryBooks } from "@/library/catalog";

export const metadata: Metadata = {
  title: "Biblioteca de textos antiguos",
  description: "Lee los evangelios apócrifos conservados en Scriptura, con traducciones españolas, referencias a manuscritos y notas de procedencia.",
  robots: { index: false, follow: true },
};

export default function BibliotecaPage() {
  const books = getLibraryBooks();
  const categories = [...new Set(books.map((book) => book.category))];

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-6 sm:px-8 sm:pt-10 lg:px-10">
      <nav aria-label="Miga de pan" className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-accent hover:underline">Inicio</Link>
        <span aria-hidden="true"> / </span>
        Biblioteca
      </nav>
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-accent">
          Documentos históricos · Lectura abierta
        </p>
        <h1
          className="text-[clamp(2.3rem,4.2vw,3.5rem)] font-normal leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-library-literata), Georgia, serif" }}
        >
          Biblioteca
        </h1>
        <p className="mt-4 text-base leading-[1.8] text-muted sm:text-lg">
          Explora escritos cristianos antiguos, sus diferentes tradiciones y sus
          manuscritos. Esta colección es complementaria a la Biblia, no forma
          parte de la edición canónica de las Escrituras.
        </p>
        <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted">
          <strong className="text-foreground">Aviso editorial:</strong> las versiones
          españolas disponibles son traducciones de trabajo realizadas desde
          textos ingleses de dominio público. Están completas como borradores,
          pero pendientes de revisión lingüística y filológica independiente.
        </p>
      </header>

      <div className="mb-8 mt-7 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="text-sm text-muted">
          <strong className="text-foreground">{books.length}</strong>{" "}
          {books.length === 1 ? "obra disponible" : "obras disponibles"}
        </p>
        <Link href="/biblia" className="text-sm font-semibold text-accent underline underline-offset-4">
          Ir a la Biblia
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-6 text-muted">
          Aún no hay obras disponibles para lectura en la Biblioteca.
        </p>
      ) : (
        categories.map((category) => (
          <section key={category} className="mb-12" aria-label={category}>
            <h2
              className="mb-5 text-[1.5rem] font-medium tracking-tight"
              style={{ fontFamily: "var(--font-library-literata), Georgia, serif" }}
            >
              {category}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.filter((book) => book.category === category).map((book) => (
                <li key={book.id} className="min-w-0">
                  <Link
                    href={"/biblioteca/" + book.id}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {book.cover && (
                      <div className="relative aspect-[16/7] w-full overflow-hidden bg-accent-soft">
                        <Image
                          src={book.cover}
                          alt={book.coverAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex h-full flex-col p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[.13em] text-muted">{book.extent}</p>
                      <h3
                        className="mt-3 text-xl font-medium leading-snug tracking-tight group-hover:text-accent"
                        style={{ fontFamily: "var(--font-library-literata), Georgia, serif" }}
                      >
                        {book.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-[1.7] text-muted">{book.description}</p>
                      <span className="mt-5 inline-flex items-center gap-2 border-t border-border pt-4 text-sm font-semibold text-accent">
                        Leer obra <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <footer className="border-t border-border pt-6 text-sm leading-7 text-muted">
        La Biblioteca está preparada para incorporar otras obras documentadas.
        Cada incorporación deberá incluir texto, procedencia y derechos
        acreditados antes de aparecer en el catálogo.
      </footer>
    </div>
  );
}
