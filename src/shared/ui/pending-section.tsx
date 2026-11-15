// Estado vacío informativo y honesto para secciones aún no construidas (§3, §0.2).

export function PendingSection({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{description}</p>
      <div className="mt-4 rounded-xl border border-border bg-accent-soft px-5 py-4 text-sm">
        <strong className="font-medium">Estado:</strong> en construcción · {phase}. No
        hay contenido simulado: esta sección mostrará datos reales cuando esté operativa.
      </div>
    </div>
  );
}
