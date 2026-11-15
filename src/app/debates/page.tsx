import type { Metadata } from "next";
import { PendingSection } from "@/shared/ui/pending-section";

export const metadata: Metadata = { title: "Debates" };

export default function DebatesPage() {
  return (
    <PendingSection
      title="Debates"
      description="Debates guiados vinculados a las Escrituras, con textos relacionados, respuestas y propuestas de nuevos temas por los miembros. Espacio reservado a personas registradas."
      phase="Fase 3"
    />
  );
}
