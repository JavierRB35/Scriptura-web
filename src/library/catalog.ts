// Catálogo editorial centralizado: cada libro se incorpora mediante manifest.json
// + su archivo de lectura. La UI no contiene listas ni rutas por libro.
import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import archive from "../../../data/apocrypha/manifest.json";

interface LibraryMetadata {
  order?: number;
  category?: string;
  summary?: string;
  extent?: string;
  cover?: string;
  alt?: string;
}

interface ArchiveWork {
  id: string;
  title_es: string;
  title_en: string;
  source_url: string;
  translator: string;
  translation_es_file?: string;
  translation_es_status?: string;
  translation_es_source_witness?: string;
  translation_es_units?: number;
  web_publication_status?: string;
  library?: LibraryMetadata;
}

export interface LibraryBook {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  category: string;
  extent: string;
  sourceUrl: string;
  sourceTranslator: string;
  sourceWitness: string;
  sourceFile: string;
  draft: boolean;
  cover: string | null;
  coverAlt: string;
}

const records = (archive as { works: ArchiveWork[] }).works;
const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const safeSource = /^es\/[a-z0-9-]+\.md$/;
const safeCover = /^\/images\/apocrypha\/[a-z0-9-]+\.webp$/;

function hasSource(path: string | undefined): boolean {
  return Boolean(path && safeSource.test(path) && existsSync(join(process.cwd(), "data", "apocrypha", path)));
}
function verifiedCover(path: string | undefined): string | null {
  if (!path || !safeCover.test(path)) return null;
  return existsSync(join(process.cwd(), "public", path.slice(1))) ? path : null;
}

export function getLibraryBooks(): LibraryBook[] {
  return records
    .filter(
      (work) =>
        (work.web_publication_status === "public_draft" ||
          work.web_publication_status === "published") &&
        (work.translation_es_status === "draft_completed_pending_editorial_review" ||
          work.translation_es_status === "reviewed") &&
        safeId.test(work.id) &&
        hasSource(work.translation_es_file) &&
        Boolean(work.library?.summary) &&
        Boolean(work.library?.category)
    )
    .sort((a, b) => (a.library?.order ?? 999) - (b.library?.order ?? 999))
    .map((work) => ({
      id: work.id,
      title: work.title_es,
      originalTitle: work.title_en,
      description: work.library?.summary ?? "",
      category: work.library?.category ?? "Otros textos",
      extent: work.library?.extent ?? "Texto completo conservado",
      sourceUrl: work.source_url,
      sourceTranslator: work.translator,
      sourceWitness: work.translation_es_source_witness ?? "Edición documentada",
      sourceFile: work.translation_es_file!,
      draft: work.web_publication_status === "public_draft",
      cover: verifiedCover(work.library?.cover),
      coverAlt: work.library?.alt ?? ("Documento histórico asociado a " + work.title_es),
    }));
}

export function getLibraryBook(id: string): LibraryBook | undefined {
  if (!safeId.test(id)) return undefined;
  return getLibraryBooks().find((book) => book.id === id);
}
