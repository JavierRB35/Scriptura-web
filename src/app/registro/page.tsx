import type { Metadata } from "next";
import { RegisterForm } from "@/auth/ui/auth-forms";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
      <p className="mt-2 text-sm text-muted">
        Participa en la comunidad: publica reflexiones, responde y acompaña debates.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
