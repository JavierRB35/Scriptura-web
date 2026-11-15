import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { LibraryBook } from "./catalog";

// Solo se leen ficheros autorizados en manifest.json; el cliente jamás
// proporciona una ruta local. El rastreo de Next incluye este directorio.
export async function readLibraryBook(book: LibraryBook): Promise<string> {
  if (!/^es\/[a-z0-9-]+\.md$/.test(book.sourceFile)) {
    throw new Error("Ruta editorial de biblioteca no válida");
  }
  return readFile(join(process.cwd(), "data", "apocrypha", book.sourceFile), "utf8");
}
