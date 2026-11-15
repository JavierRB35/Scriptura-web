// Catálogo canónico de libros bíblicos: única fuente para la siembra de
// biblical_books / biblical_canons / canon_books y para la aplicación.
// Origen: catálogo de 73 libros de la app original (REUTILIZAR, auditoría Fase 0).

import { z } from "zod";
import raw from "./catalog.json";

export type Testament = "AT" | "NT";

export interface BookEntry {
  code: string;
  name_es: string;
  testament: Testament;
  deuterocanonical: boolean;
  osis_code: string;
}

export interface CanonEntry {
  code: string;
  name: string;
}

const bookSchema = z.object({
  code: z.string().min(1),
  name_es: z.string().min(1),
  testament: z.enum(["AT", "NT"]),
  deuterocanonical: z.boolean(),
  osis_code: z.string().min(1),
});

const catalogSchema = z.object({
  canons: z.array(z.object({ code: z.string().min(1), name: z.string().min(1) })),
  books: z.array(bookSchema),
});

// Fallo rápido si el dato base deja de ser válido.
const parsed = catalogSchema.parse(raw);

export const CANONS: CanonEntry[] = parsed.canons;
export const BOOKS: BookEntry[] = parsed.books;

export const CATHOLIC_CANON_CODE = "catolica73";
export const PROTESTANT_CANON_CODE = "protestante66";

/** Código → libro. */
export const BOOK_BY_CODE: ReadonlyMap<string, BookEntry> = new Map(
  BOOKS.map((b) => [b.code, b])
);

/** Libros de un canon en orden canónico (católico: los 73; protestante: los 66). */
export function booksOfCanon(canonCode: string): BookEntry[] {
  return canonCode === PROTESTANT_CANON_CODE
    ? BOOKS.filter((b) => !b.deuterocanonical)
    : BOOKS;
}
