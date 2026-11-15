// Cabecera con las cinco secciones principales (D13) y estado de sesión real.

import Link from "next/link";
import { getCurrentUser } from "@/auth/session";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";

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
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-2 px-3 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          <span className="text-lg font-semibold tracking-[-.03em] text-accent sm:text-xl">Scriptura</span>
        </Link>
        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-0.5 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap rounded-lg px-3 py-2 text-muted transition-colors hover:bg-accent-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1 text-xs sm:gap-2 sm:text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden text-muted xl:inline">
                {user.alias}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/entrar" className="whitespace-nowrap rounded-lg px-1.5 py-2 text-muted hover:text-foreground sm:px-2.5">
                Entrar
              </Link>
              <Link
                href="/registro"
                className="whitespace-nowrap rounded-lg bg-[#1F5C45] px-2.5 py-2 font-semibold text-white transition-colors hover:bg-[#174B38] sm:px-4"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <nav aria-label="Principal móvil" className="border-t border-border xl:hidden">
        <ul className="mx-auto grid max-w-[1240px] grid-cols-5 items-stretch gap-0.5 px-1 py-1 text-[clamp(.72rem,3vw,.875rem)] sm:px-7 lg:px-9">
          {NAV.map((item) => (
            <li key={item.href} className="min-w-0">
              <Link href={item.href} className="flex min-h-11 min-w-0 items-center justify-center rounded-lg px-0.5 py-2 text-center leading-tight text-muted hover:bg-accent-soft hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-2">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
