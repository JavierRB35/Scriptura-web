import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, currentUserHasRole } from "@/auth/session";

export const metadata: Metadata = { title: "Administración" };

// Página por usuario: nunca se prerenderiza ni se cachea.
export const instant = false;

// Panel privado (Fase 4). Ya protege el acceso: exige sesión y rol administrador,
// comprobados en servidor (no basta con ocultar el enlace).

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/admin");

  const isAdmin = await currentUserHasRole("admin");
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Administración</h1>
        <p className="mt-3 text-muted">
          No tienes permisos de administración. Si deberías tenerlos, solicita al
          propietario que te conceda el rol correspondiente.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Administración</h1>
      <ul className="mt-6 space-y-3">
        <li>
          <Link
            href="/admin/debates"
            className="block rounded-xl border border-border bg-surface p-5 hover:border-accent"
          >
            <span className="text-lg font-medium">Debates</span>
            <p className="mt-1 text-sm text-muted">
              Revisar propuestas de la comunidad, aceptar y publicar, o rechazar con
              motivo.
            </p>
          </Link>
        </li>
      </ul>
      <p className="mt-6 text-sm text-muted">
        Moderación, métricas y auditoría llegarán con la Fase 4.
      </p>
    </div>
  );
}
