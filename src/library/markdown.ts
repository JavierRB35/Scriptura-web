// Parseo conservador de los Markdown documentales de la biblioteca.
// No ejecuta HTML ni acepta marcado de usuario; React escapa el texto.
export type LibraryBlock =
  | { kind: "heading"; level: number; text: string; id: string }
  | { kind: "paragraph"; text: string; number?: number }
  | { kind: "list"; items: string[] }
  | { kind: "divider" };

export interface LibraryDocument {
  blocks: LibraryBlock[];
  outline: { id: string; title: string; level: number }[];
}

export function headingId(title: string, level: number): string {
  const saying = /^Dicho\s+(\d+)\./i.exec(title);
  if (saying) return "dicho-" + saying[1];
  const chapter = /^Capítulo\s+(\d+)/i.exec(title);
  if (chapter) {
    return "capitulo-" + chapter[1] + (level === 3 ? "-alternativo" : "");
  }
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Unidades numeradas: un párrafo puede incluir (1), (2) y (3).
// Se transforman en bloques separados sin cambiar ni una palabra del contenido.
export function splitNumberedParagraph(text: string): LibraryBlock[] {
  const markers = [...text.matchAll(/(^|\s)\((\d{1,3})\)\s/g)];
  if (markers.length === 0) return [{ kind: "paragraph", text }];
  const blocks: LibraryBlock[] = [];
  const first = markers[0].index ?? 0;
  const prefix = text.slice(0, first).trim();
  if (prefix) blocks.push({ kind: "paragraph", text: prefix });
  for (let i = 0; i < markers.length; i++) {
    const match = markers[i];
    const next = markers[i + 1];
    const from = (match.index ?? 0) + match[0].length;
    const to = next ? (next.index ?? text.length) : text.length;
    const number = Number(match[2]);
    const body = text.slice(from, to).trim();
    blocks.push({ kind: "paragraph", number, text: body });
  }
  return blocks;
}

export function parseLibraryMarkdown(markdown: string): LibraryDocument {
  const blocks: LibraryBlock[] = [];
  const outline: LibraryDocument["outline"] = [];
  const seenIds = new Map<string, number>();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let inNotes = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    const value = paragraph.join(" ").trim();
    if (value) {
      blocks.push(...(inNotes ? [{ kind: "paragraph", text: value } as LibraryBlock] : splitNumberedParagraph(value)));
    }
    paragraph = [];
  }
  function flushList() {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const title = heading[2];
      if (/^Notas (?:de |de la )?traducción/i.test(title) || /^Notas de la traducción de referencia/i.test(title)) inNotes = true;
      const baseId = headingId(title, level);
      const count = seenIds.get(baseId) ?? 0;
      seenIds.set(baseId, count + 1);
      const id = count === 0 ? baseId : baseId + "-" + (count + 1);
      blocks.push({ kind: "heading", level, text: title, id });
      if (level > 1) outline.push({ id, title, level });
      continue;
    }
    if (line === "---") {
      flushParagraph();
      flushList();
      blocks.push({ kind: "divider" });
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return { blocks, outline };
}

export type InlineToken =
  | { kind: "text" | "strong" | "em" | "code"; value: string }
  | { kind: "link"; value: string; href: string };

export function tokenizeLibraryInline(text: string): InlineToken[] {
  const result: InlineToken[] = [];
  const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|\*[^*\n]+\*|https?:\/\/[^\s)]+)/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > cursor) result.push({ kind: "text", value: text.slice(cursor, at) });
    const token = match[0];
    if (token.startsWith("**")) result.push({ kind: "strong", value: token.slice(2, -2) });
    else if (token.startsWith("*")) result.push({ kind: "em", value: token.slice(1, -1) });
    else if (token.startsWith("`")) result.push({ kind: "code", value: token.slice(1, -1) });
    else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(token);
      if (link) result.push({ kind: "link", value: link[1], href: link[2] });
    } else {
      result.push({ kind: "link", value: token, href: token });
    }
    cursor = at + token.length;
  }
  if (cursor < text.length) result.push({ kind: "text", value: text.slice(cursor) });
  return result;
}
