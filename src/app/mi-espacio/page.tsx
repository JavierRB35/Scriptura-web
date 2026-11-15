import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/session";

export const metadata: Metadata = { title: "Mi espacio" };

// Página por usuario: nunca se prerenderiza ni se cachea.
export const instant = false;

// Área personal (Fase 1): demuestra el ciclo sesión → perfil → roles reales.
// Historial, favoritos, debates seguidos y notificaciones llegan en Fase 3.

export default async function MiEspacioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/mi-espacio");

  const fechaAlta = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
  }).format(user.joinedAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Mi espacio</h1>

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Perfil
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Alias</dt>
            <dd className="font-medium">{user.alias}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Miembro desde</dt>
            <dd className="font-medium">{fechaAlta}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Historial visible para otros</dt>
            <dd className="font-medium">{user.historyPublic ? "Sí" : "No (privado)"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Roles</dt>
            <dd className="font-medium">
              {user.roles.length > 0 ? user.roles.join(", ") : "Miembro"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Podrás cambiar tu alias y configurar privacidad y notificaciones cuando se
          complete la Fase 3.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Próximamente
        </h2>
        <ul className="mt-3 list-inside list-disc text-sm text-muted">
          <li>Historial de aportaciones y favoritos</li>
          <li>Debates seguidos y notificaciones</li>
          <li>Reconocimientos y nivel de participación</li>
        </ul>
      </section>
    </div>
  );
}
