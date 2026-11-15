import type { Metadata } from "next";
import { BOOKS } from "@/bible/catalog";

export const metadata: Metadata = { title: "Biblia" };

// Estado real (Fase 1): el catálogo canónico existe; los textos llegan con el
// importador de la Fase 2 (Reina-Valera 1909, dominio público). Sin simular
// contenido que no está cargado (§0.2).

export default function BibliaPage() {
  const antiguo = BOOKS.filter((b) => b.testament === "AT");
  const nuevo = BOOKS.filter((b) => b.testament === "NT");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Biblia</h1>
      <p className="mt-3 max-w-2xl text-muted">
        El texto bíblico completo se incorporará tras la importación verificada de la
        primera edición (Reina-Valera 1909, dominio público). Debajo puede consultarse
        ya el catálogo de libros previsto.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-accent-soft px-5 py-4 text-sm">
        <strong className="font-medium">Estado:</strong> catálogo disponible · textos
        pendientes de importación (Fase 2).
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Antiguo Testamento · {antiguo.length} libros</h2>
        <BooksGrid books={antiguo} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Nuevo Testamento · {nuevo.length} libros</h2>
        <BooksGrid books={nuevo} />
      </section>
    </div>
  );
}

function BooksGrid({ books }: { books: typeof BOOKS }) {
  return (
    <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((b) => (
        <li
          key={b.code}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          title={b.deuterocanonical ? "Libro deuterocanónico" : undefined}
        >
          <span className="font-medium">{b.name_es}</span>
          <span className="ml-2 text-muted">{b.code}</span>
          {b.deuterocanonical && (
            <span className="ml-1 text-xs text-accent" title="Deuterocanónico">
              ✦
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
