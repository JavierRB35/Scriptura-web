"use client";

// Conmutador de tema: sistema / claro / oscuro (§6.1). La preferencia vive en
// localStorage (useSyncExternalStore) y se aplica como clase `dark` en <html>.
// La inicialización sin parpadeo la hace el script en línea del layout.

import { useEffect, useSyncExternalStore } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "scriptura-theme";
const EVENT = "scriptura-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function readMode(): Mode {
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}

function apply(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.classList.toggle("light", mode === "light");
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, () => "system" as Mode);

  // Cambios del sistema mientras el modo es "auto".
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readMode() === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function cycle() {
    const order: Mode[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVENT));
    apply(next);
  }

  const labels = { system: "Tema: auto", light: "Tema: claro", dark: "Tema: oscuro" };

  return (
    <button
      type="button"
      aria-label={labels[mode]}
      title={labels[mode]}
      onClick={cycle}
      className="rounded border border-border px-2 py-1 text-xs text-muted hover:bg-accent-soft"
    >
      {labels[mode]}
    </button>
  );
}
