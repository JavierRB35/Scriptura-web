import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/session";
import { cambiarAlias, alternarHistorialPublico } from "@/auth/profile-actions";
import { retirarComentario, marcarNotificacionesLeidas, alternarFavorito } from "@/community/actions";
import {
  getReputationSummary,
  listNotifications,
  listFavorites,
  listMyComments,
} from "@/community/service";
import { slugOf } from "@/bible/slug";

export const metadata: Metadata = { title: "Mi espacio" };

// Área personal completa (§3.5): perfil editable, reputación, favoritos,
// historial y notificaciones.

export default async function MiEspacioPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-12 text-muted">Cargando…</p>}>
      <MiEspacioBody />
    </Suspense>
  );
}

async function MiEspacioBody() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?redirigir=/mi-espacio");

  const [reputation, notifications, favorites, mine] = await Promise.all([
    getReputationSummary(user.id),
    listNotifications(user),
    listFavorites(user),
    listMyComments(user),
  ]);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Mi espacio</h1>

      {/* Perfil */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">Perfil</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <form action={cambiarAlias} className="flex items-end gap-2">
            <label className="text-sm font-medium">
              Alias (único, 3–24 caracteres)
              <input
                name="alias"
                defaultValue={user.alias}
                required
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_áéíóúüñÁÉÍÓÚÜÑ.-]+"
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Guardar
            </button>
          </form>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Miembro desde</dt>
            <dd className="font-medium">
              {new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(user.joinedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Historial visible para otros</dt>
            <dd className="font-medium">{user.historyPublic ? "Sí" : "No (privado)"}</dd>
          </div>
          <div>
            <dt className="text-muted">Roles</dt>
            <dd className="font-medium">{user.roles.length > 0 ? user.roles.join(", ") : "Miembro"}</dd>
          </div>
        </dl>
        <form action={alternarHistorialPublico} className="mt-4">
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent-soft"
          >
            {user.historyPublic ? "Hacer privado mi historial" : "Hacer visible mi historial"}
          </button>
        </form>
        <p className="mt-3 text-xs text-muted">
          Aunque ocultes tu historial, tus comentarios publicados seguirán
          apareciendo en las conversaciones (§4.4).
        </p>
      </section>

      {/* Reputación */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Participación
        </h2>
        <p className="mt-3 text-2xl font-semibold">
          {reputation.total} <span className="text-base font-normal text-muted">puntos</span>
        </p>
        <p className="mt-1">
          Nivel: <strong>{reputation.levelName}</strong>
          {reputation.nextLevel && reputation.pointsToNext !== null && (
            <span className="text-muted">
              {" "}· {reputation.pointsToNext} puntos para «{reputation.nextLevel}»
            </span>
          )}
        </p>
        <p className="mt-2 text-xs text-muted">
          Puntuación calculada desde eventos verificables (aportaciones y valoraciones
          recibidas) con tope diario; reglas versionadas auditables.
        </p>
      </section>

      {/* Notificaciones */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Notificaciones {unread > 0 && <span className="text-accent">({unread} sin leer)</span>}
          </h2>
          {unread > 0 && (
            <form action={marcarNotificacionesLeidas}>
              <button
                type="submit"
                className="rounded border border-border px-3 py-1 text-xs hover:bg-accent-soft"
              >
                Marcar todo leído
              </button>
            </form>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No tienes notificaciones. Recibirás avisos de respuestas, reconocimientos y
            actividad de debates que sigas.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className={n.readAt ? "text-muted" : "font-medium"}>
                  {n.link ? (
                    <Link href={n.link} className="underline-offset-2 hover:underline">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {new Date(n.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Favoritos */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Pasajes guardados
        </h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Selecciona versículos en el lector y pulsa «Guardar pasaje».
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {favorites.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link
                  href={`/biblia/${slugOf(f.bookCode)}/${f.chapter}?v=${f.verseStart}-${f.verseEnd}`}
                  className="text-accent underline-offset-2 hover:underline"
                >
                  {f.bookName} {f.chapter}:
                  {f.verseStart === f.verseEnd ? f.verseStart : `${f.verseStart}-${f.verseEnd}`}
                </Link>
                <form action={alternarFavorito}>
                  <input type="hidden" name="bookCode" value={f.bookCode} />
                  <input type="hidden" name="chapter" value={f.chapter} />
                  <input type="hidden" name="verseStart" value={f.verseStart} />
                  <input type="hidden" name="verseEnd" value={f.verseEnd} />
                  <input type="hidden" name="back" value="/mi-espacio" />
                  <button
                    type="submit"
                    className="rounded border border-border px-2 py-0.5 text-xs hover:bg-accent-soft"
                  >
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Historial propio */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Mis reflexiones
        </h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Todavía no has publicado reflexiones.{" "}
            <Link href="/biblia" className="underline underline-offset-2">
              Elige un pasaje
            </Link>{" "}
            para empezar.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {mine.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link
                  href={`/biblia/${slugOf(c.bookCode)}/${c.chapter}?v=${c.verseStart}-${c.verseEnd}`}
                  className="underline-offset-2 hover:underline"
                >
                  {c.bookName} {c.chapter}:{c.verseStart}
                  <span className="ml-2 text-muted">{c.excerpt.slice(0, 60)}…</span>
                </Link>
                <form action={retirarComentario}>
                  <input type="hidden" name="commentId" value={c.id} />
                  <input type="hidden" name="back" value="/mi-espacio" />
                  <button
                    type="submit"
                    className="rounded border border-border px-2 py-0.5 text-xs hover:bg-accent-soft"
                  >
                    Retirar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
