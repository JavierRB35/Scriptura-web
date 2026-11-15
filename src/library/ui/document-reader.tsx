import Link from "next/link";
import type { LibraryDocument } from "../markdown";
import { tokenizeLibraryInline } from "../markdown";

function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeLibraryInline(text).map((token, index) => {
        switch (token.kind) {
          case "strong":
            return <strong key={index} className="font-semibold">{token.value}</strong>;
          case "em":
            return <em key={index}>{token.value}</em>;
          case "code":
            return <code key={index} className="rounded bg-accent-soft px-1 py-0.5 text-[.88em]">{token.value}</code>;
          case "link":
            return (
              <a
                key={index}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words text-accent underline underline-offset-2 hover:opacity-80"
              >
                {token.value}
              </a>
            );
          default:
            return <span key={index}>{token.value}</span>;
        }
      })}
    </>
  );
}

export function LibraryDocumentReader({ document }: { document: LibraryDocument }) {
  return (
    <>
      {document.outline.length > 0 && (
        <details className="mb-8 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5">
          <summary className="cursor-pointer select-none font-semibold text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            Índice del texto · {document.outline.length} apartados
          </summary>
          <nav aria-label="Índice del libro" className="mt-4 grid max-h-80 grid-cols-1 gap-1 overflow-y-auto border-t border-border pt-3 text-sm sm:grid-cols-2">
            {document.outline.map((part) => (
              <Link
                key={part.id}
                href={"#" + part.id}
                className="rounded-md px-2 py-2 text-foreground hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {part.title}
              </Link>
            ))}
          </nav>
        </details>
      )}
      <article className="min-w-0 rounded-xl border border-border bg-surface px-5 py-7 shadow-[0_6px_28px_rgba(25,36,29,.035)] sm:px-9 sm:py-10">
        <div className="mx-auto max-w-[730px]">
          {document.blocks.map((block, index) => {
            if (block.kind === "heading") {
              // El H1 de la obra ya se presenta en su ficha de lectura.
              if (block.level === 1) return null;
              return block.level === 2 ? (
                <h2
                  id={block.id}
                  key={index}
                  className="scroll-mt-8 mb-4 mt-10 border-t border-border pt-7 text-[clamp(1.38rem,2.5vw,1.85rem)] font-medium leading-snug tracking-tight first:mt-0"
                  style={{ fontFamily: "var(--font-library-literata), Georgia, serif" }}
                >
                  {block.text}
                </h2>
              ) : (
                <h3
                  id={block.id}
                  key={index}
                  className="scroll-mt-8 mb-4 mt-8 text-[1.14rem] font-semibold leading-relaxed"
                  style={{ fontFamily: "var(--font-library-literata), Georgia, serif" }}
                >
                  {block.text}
                </h3>
              );
            }
            if (block.kind === "divider") return <hr key={index} className="my-10 border-border" />;
            if (block.kind === "list") {
              return (
                <ul key={index} className="mb-5 list-disc space-y-2 pl-6 text-[1.04rem] leading-[1.85] text-foreground sm:text-[1.09rem]">
                  {block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}
                </ul>
              );
            }
            if (block.number !== undefined) {
              return (
                <p key={index} className="mb-5 flex items-start gap-3 text-[1.06rem] leading-[1.83] sm:text-[1.14rem]">
                  <span className="mt-[.18em] min-w-9 shrink-0 text-sm font-semibold tabular-nums text-accent" aria-label={"Apartado " + block.number}>
                    ({block.number})
                  </span>
                  <span className="min-w-0"><Inline text={block.text} /></span>
                </p>
              );
            }
            return (
              <p key={index} className="mb-5 text-[1.06rem] leading-[1.83] sm:text-[1.14rem]">
                <Inline text={block.text} />
              </p>
            );
          })}
        </div>
      </article>
    </>
  );
}
