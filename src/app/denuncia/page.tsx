import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/session";
import { enviarDenuncia } from "@/moderation/actions";

export const metadata: Metadata = { title: "Denunciar contenido" };

const MOTIVOS: { value: string; label: string }[] = [
  { value: "insult", label: "Insultos" },
  { value: "harassment", label: "Acoso" },
  { value: "threat", label: "Amenazas" },
  { value: "spam", label: "Spam" },
  { value: "impersonation", label: "Suplantación" },
  { value: "reputation_manipulation", label: "Manipulación de reputación" },
  { value: "private_info", label: "Información privada de terceros" },
  { value: "abuse", label: "Otros abusos" },
  { value: "other", label: "Otro" },
];

export default function DenunciaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviada?: string; tipo?: string; id?: string }>;
}) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-12 text-muted">Cargando…</p>}>
      <DenunciaBody searchParams={searchParams} />
    </Suspense>
  );
}

async function DenunciaBody({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviada?: string; tipo?: string; id?: string }>;
}) {
  const { error, enviada, tipo, id } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Denunciar contenido</h1>
        <p className="mt-3 text-muted">
          Necesitas una cuenta para denunciar.{" "}
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

  if (enviada) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Denuncia registrada</h1>
        <p className="mt-3 text-muted">
          Gracias. El equipo de moderación la revisará y aplicará la medida
          proporcional si procede. No se notifica al denunciado quién denunció.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Denunciar contenido</h1>
      <p className="mt-2 text-sm text-muted">
        Se moderan los comportamientos (§11.1), no las creencias: las discrepancias
        doctrinales respetuosas están permitidas. Denuncia insultos, acoso,
        amenazas, spam, suplantación o manipulación.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={enviarDenuncia} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Tipo de contenido
          <select
            name="targetType"
            required
            defaultValue={tipo === "debate_comment" ? "debate_comment" : tipo === "debate" ? "debate" : "comment"}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          >
            <option value="comment">Reflexión sobre un pasaje</option>
            <option value="debate_comment">Intervención en un debate</option>
            <option value="debate">Debate</option>
            <option value="profile">Perfil</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Identificador del contenido
          <input
            name="targetId"
            required
            defaultValue={id ?? ""}
            placeholder="El enlace del contenido incluye este identificador"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Motivo
          <select
            name="reason"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          >
            {MOTIVOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Detalles (opcional)
          <textarea
            name="details"
            rows={3}
            maxLength={2000}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Enviar denuncia
        </button>
      </form>
    </div>
  );
}
