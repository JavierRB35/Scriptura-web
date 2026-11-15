import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { proponerDebate } from "@/community/actions";

export const metadata: Metadata = { title: "Proponer debate" };

// Propuesta de debate por un miembro (§8.2): nunca se publica directamente.

export default function ProponerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-12 text-muted">Cargando…</p>}>
      <ProponerBody searchParams={searchParams} />
    </Suspense>
  );
}

async function ProponerBody({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Proponer debate</h1>
        <p className="mt-3 text-muted">
          Necesitas una cuenta para proponer debates.{" "}
          <Link href="/entrar" className="underline underline-offset-2">
            Entra
          </Link>{" "}
          o{" "}
          <Link href="/registro" className="underline underline-offset-2">
            regístrate
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Proponer debate</h1>
      <p className="mt-2 text-sm text-muted">
        Las propuestas son revisadas por el equipo editorial antes de publicarse
        (§8.2). Los debates deben estar vinculados a las Escrituras e invitar a la
        reflexión, sin inducir una respuesta confesional obligatoria.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={proponerDebate} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Título
          <input
            name="titulo"
            required
            minLength={5}
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Pregunta principal
          <input
            name="pregunta"
            required
            minLength={10}
            maxLength={500}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Descripción y contexto
          <textarea
            name="descripcion"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Pasajes relacionados (una referencia por línea, p. ej. «Jn 3,16-21»)
          <textarea
            name="pasajes"
            rows={3}
            placeholder={"Jn 3,16-21\nRom 5,8"}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Enviar propuesta
        </button>
      </form>
    </div>
  );
}
