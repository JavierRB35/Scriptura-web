import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Scriptura · comunidad interconfesional de lectura bíblica</p>
        <p>
          Gratuita y financiada por su propietario ·{" "}
          <Link href="/informacion" className="underline underline-offset-2 hover:text-foreground">
            Información y fuentes
          </Link>
        </p>
      </div>
    </footer>
  );
}
