// Slugs estables de libros para URLs legibles (§6.1): /biblia/genesis/1
import { BOOKS, BOOK_BY_CODE, type BookEntry } from "./catalog";

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** slug → libro del catálogo. */
export const BOOK_BY_SLUG: ReadonlyMap<string, BookEntry> = new Map(
  BOOKS.map((b) => [slugify(b.name_es), b])
);

export function slugOf(code: string): string {
  return slugify(BOOK_BY_CODE.get(code)?.name_es ?? code);
}
