import type { Metadata } from "next";
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
      <p className="mt-3 text-muted">
        Panel en construcción (Fase 4): gestión editorial, moderación, métricas y
        auditoría operarán desde aquí.
      </p>
    </div>
  );
}
