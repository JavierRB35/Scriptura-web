import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, currentUserHasRole } from "@/auth/session";
import { adminMetrics, recentAuditEvents } from "@/moderation/service";

export const metadata: Metadata = { title: "Administración" };

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-12 text-muted">Cargando…</p>}>
      <AdminBody />
    </Suspense>
  );
}

async function AdminBody() {
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

  const [metrics, audit] = await Promise.all([adminMetrics(), recentAuditEvents(15)]);

  const cards: { label: string; value: string | number; href?: string }[] = [
    { label: "Miembros registrados", value: metrics.users },
    { label: "Reflexiones publicadas", value: metrics.comments },
    { label: "Respuestas", value: metrics.replies },
    { label: "Debates activos", value: metrics.debates },
    { label: "Denuncias abiertas", value: metrics.openReports, href: "/admin/moderacion" },
    { label: "Apelaciones pendientes", value: metrics.openAppeals, href: "/admin/moderacion" },
    { label: "Restricciones activas", value: metrics.activeRestrictions },
    { label: "Suscripciones confirmadas", value: metrics.subscriptions },
    { label: "Consultas IA registradas", value: metrics.aiEvents },
    {
      label: "Correos (enviados / fallidos / pendientes)",
      value: `${metrics.emailJobs.sent} / ${metrics.emailJobs.failed} / ${metrics.emailJobs.pending}`,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Administración</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Métricas reales (§15.4)
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {cards.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href ?? "#"}
                className={`block rounded-xl border border-border bg-surface px-4 py-3 ${c.href ? "hover:border-accent" : "pointer-events-none"}`}
              >
                <span className="text-sm text-muted">{c.label}</span>
                <p className="text-xl font-semibold">{c.value}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Datos agregados calculados desde registros reales; sin exposición de datos
          personales innecesaria.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Auditoría reciente
        </h2>
        {audit.length === 0 ? (
          <p className="mt-3 text-muted">Sin eventos registrados todavía.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {audit.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span>
                  <code className="rounded bg-accent-soft px-1.5 py-0.5 text-xs">{a.action}</code>
                  {a.actorAlias && <span className="ml-2 text-muted">por {a.actorAlias}</span>}
                </span>
                <span className="text-xs text-muted">
                  {new Date(a.createdAt).toLocaleString("es-ES", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Gestión
        </h2>
        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/admin/debates"
              className="block rounded-xl border border-border bg-surface p-5 hover:border-accent"
            >
              <span className="text-lg font-medium">Debates</span>
              <p className="mt-1 text-sm text-muted">
                Revisar propuestas de la comunidad, aceptar y publicar, o rechazar
                con motivo.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/moderacion"
              className="block rounded-xl border border-border bg-surface p-5 hover:border-accent"
            >
              <span className="text-lg font-medium">Moderación</span>
              <p className="mt-1 text-sm text-muted">
                Cola de denuncias con contexto, medidas proporcionales y
                apelaciones.
              </p>
            </Link>
          </li>
        </ul>
        <p className="mt-6 text-sm text-muted">
          La concesión de roles se realiza directamente en la base de datos
          (tabla user_roles) por seguridad; la interfaz de gestión de permisos
          llega con el resto de Fase 4.
        </p>
      </section>
    </div>
  );
}
