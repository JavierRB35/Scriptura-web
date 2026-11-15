// Cabecera con las cinco secciones principales (D13) y estado de sesión real.

import Link from "next/link";
import { getCurrentUser } from "@/auth/session";
import { LogoutButton } from "./logout-button";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/biblia", label: "Biblia" },
  { href: "/debates", label: "Debates" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/mi-espacio", label: "Mi espacio" },
];

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-accent">Scriptura</span>
        </Link>
        <nav aria-label="Principal" className="hidden sm:block">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded px-3 py-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="hidden text-muted sm:inline">
                {user.alias}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/entrar" className="rounded px-3 py-1.5 text-muted hover:text-foreground">
                Entrar
              </Link>
              <Link
                href="/registro"
                className="rounded bg-accent px-3 py-1.5 font-medium text-white transition-opacity hover:opacity-90"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <nav aria-label="Principal móvil" className="border-t border-border sm:hidden">
        <ul className="flex overflow-x-auto px-2 py-1 text-sm">
          {NAV.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className="block rounded px-3 py-1.5 text-muted">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
