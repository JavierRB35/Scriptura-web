import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { enviarApelacion } from "@/moderation/actions";

export const metadata: Metadata = { title: "Apelar una moderación" };

export default function ApelarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviada?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-12 text-muted">Cargando…</p>}>
      <ApelarBody searchParams={searchParams} />
    </Suspense>
  );
}

async function ApelarBody({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviada?: string }>;
}) {
  const { error, enviada } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Apelar una moderación</h1>
        <p className="mt-3 text-muted">
          Necesitas una cuenta.{" "}
          <Link href="/entrar" className="underline underline-offset-2">
            Entra
          </Link>
          .
        </p>
      </div>
    );
  }

  if (enviada) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Apelación registrada</h1>
        <p className="mt-3 text-muted">
          El equipo de moderación la revisará y recibirás el resultado en tus
          notificaciones. Si se estima, el contenido oculto se restaura y las
          restricciones se levantan.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Apelar una moderación</h1>
      <p className="mt-2 text-sm text-muted">
        Si una de tus aportaciones fue ocultada o tu cuenta restringida y crees que
        la medida no procede, puedes apelar (§11.2). Una alerta automatizada no es
        una sanción definitiva: una persona revisará tu caso.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={enviarApelacion} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Explica por qué consideras que la medida no procede
          <textarea
            name="statement"
            required
            minLength={10}
            maxLength={4000}
            rows={6}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Enviar apelación
        </button>
      </form>
    </div>
  );
}
