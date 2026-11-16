import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { subscribe } from "@/email/service";

export const metadata: Metadata = { title: "Lecturas diarias por correo" };

// Suscripción independiente del registro comunitario (§13.1), con doble
// opt-in. Sin proveedor de correo configurado: error honesto al intentar.

export default function LecturasDiariasPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-12 text-muted">Cargando…</p>}>
      <Suscripcion />
    </Suspense>
  );
}

async function Suscripcion() {
  async function alta(formData: FormData) {
    "use server";
    const result = await subscribe({
      email: String(formData.get("email") ?? ""),
      timezone: String(formData.get("timezone") ?? "Europe/Madrid"),
    });
    const params = new URLSearchParams();
    if (result.ok) params.set("enviado", "1");
    else params.set("error", result.error);
    redirect(`/lecturas-diarias?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Lecturas diarias de Misa por correo</h1>
      <p className="mt-3 leading-7 text-muted">
        Recibe cada mañana las lecturas del día con el texto bíblico íntegro de la
        edición publicada (dominio público), la celebración litúrgica y enlaces a
        la lectura en Scriptura. Servicio gratuito e independiente del registro en
        la comunidad.
      </p>

      <form action={alta} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Correo electrónico
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Zona horaria
          <select name="timezone" defaultValue="Europe/Madrid" className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-accent">
            <option value="Europe/Madrid">España peninsular (Madrid)</option>
            <option value="Atlantic/Canary">Canarias</option>
            <option value="America/Mexico_City">México (CDMX)</option>
            <option value="America/Argentina/Buenos_Aires">Argentina</option>
            <option value="America/Bogota">Colombia</option>
            <option value="America/Los_Angeles">Pacifico EE. UU.</option>
          </select>
        </label>
        <p className="text-xs text-muted">
          Recibirás un correo de confirmación antes de ningún envío (doble
          opt-in). Cada correo incluye un enlace de baja inmediata.
        </p>
        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Suscribirme
        </button>
      </form>
    </div>
  );
}

