import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/auth/ui/auth-forms";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-2 text-sm text-muted">
        Acceso para miembros de la comunidad de Scriptura.
      </p>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
