"use client";

// Formularios reales de autenticación contra Supabase Auth (§4.3).

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/auth/supabase-browser";

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
      {message}
    </p>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const buttonClass =
  "w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirigir") ?? "/mi-espacio";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setPending(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <label className="block text-sm font-medium" htmlFor="email">
        Correo electrónico
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>
      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Contraseña
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <FieldError message={error} />
      <button type="submit" disabled={pending} className={`${buttonClass} mt-6`}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="mt-4 text-sm text-muted">
        ¿Sin cuenta?{" "}
        <Link href="/registro" className="underline underline-offset-2">
          Crear cuenta
        </Link>{" "}
        ·{" "}
        <Link href="/recuperar" className="underline underline-offset-2">
          He olvidado la contraseña
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const password2 = String(form.get("password2") ?? "");

    if (password !== password2) {
      setPending(false);
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setPending(false);
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setPending(false);
    if (error) {
      setError(
        error.message === "User already registered"
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo completar el registro. Revisa el correo e inténtalo de nuevo."
      );
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-accent-soft px-5 py-4 text-sm">
        Si el correo es válido, recibirás un mensaje de verificación. Confírmalo para
        activar tu cuenta.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="block text-sm font-medium" htmlFor="email">
        Correo electrónico
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Contraseña (mínimo 8 caracteres)
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="mt-4 block text-sm font-medium" htmlFor="password2">
        Repite la contraseña
        <input
          id="password2"
          name="password2"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <FieldError message={error} />
      <button type="submit" disabled={pending} className={`${buttonClass} mt-6`}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p className="mt-4 text-sm text-muted">
        Solo pedimos un correo y una contraseña: no solicitamos confesión religiosa ni
        datos personales innecesarios. Tu historial será privado por defecto.
      </p>
    </form>
  );
}

export function RecoverForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(form.get("email") ?? ""),
      { redirectTo: `${window.location.origin}/auth/callback?next=/mi-espacio` }
    );
    setPending(false);
    if (error) {
      setError("No se pudo iniciar la recuperación. Inténtalo de nuevo.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-accent-soft px-5 py-4 text-sm">
        Si el correo corresponde a una cuenta, recibirás un enlace para restablecer la
        contraseña.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="block text-sm font-medium" htmlFor="email">
        Correo de la cuenta
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <FieldError message={error} />
      <button type="submit" disabled={pending} className={`${buttonClass} mt-6`}>
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}
