"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/auth/supabase-browser";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded px-3 py-1.5 text-muted transition-colors hover:text-foreground"
    >
      Salir
    </button>
  );
}
