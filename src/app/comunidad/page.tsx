import type { Metadata } from "next";
import { PendingSection } from "@/shared/ui/pending-section";

export const metadata: Metadata = { title: "Comunidad" };

export default function ComunidadPage() {
  return (
    <PendingSection
      title="Comunidad"
      description="Actividad reciente, reflexiones destacadas, debates activos y participantes reconocidos. Espacio reservado a personas registradas: los visitantes no acceden al contenido comunitario."
      phase="Fase 3"
    />
  );
}
