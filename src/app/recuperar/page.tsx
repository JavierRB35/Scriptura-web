import type { Metadata } from "next";
import { RecoverForm } from "@/auth/ui/auth-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-muted">
        Recibirás un correo con un enlace seguro para restablecerla.
      </p>
      <div className="mt-8">
        <RecoverForm />
      </div>
    </div>
  );
}
