import Link from "next/link";

// Portada en construcción (Fase 1): identidad y estado real del proyecto.
// Sin datos ficticios (§0.2): lo que aún no existe se presenta como pendiente.

const ESTADO = [
  { area: "Biblia", fase: "Fase 2", listo: false },
  { area: "Comunidad y debates", fase: "Fase 3", listo: false },
  { area: "Administración y moderación", fase: "Fase 4", listo: false },
  { area: "Asistente de IA con fuentes verificadas", fase: "Fase 5", listo: false },
  { area: "Lecturas diarias por correo", fase: "Fase 6", listo: false },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
          En construcción
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Leer, comprender, reflexionar, compartir y descubrir.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Scriptura será una comunidad digital abierta e interconfesional en torno a
          las Escrituras: la Biblia en el centro, con debates guiados, reflexiones
          compartidas y acompañamiento de lectura con fuentes verificadas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/biblia"
            className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Ir a la Biblia
          </Link>
          <Link
            href="/registro"
            className="rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-accent-soft"
          >
            Crear cuenta
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Estado del proyecto
        </h2>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
          {ESTADO.map((item) => (
            <li key={item.area} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span>{item.area}</span>
              <span className="text-sm text-muted">
                {item.listo ? "Disponible" : `Pendiente · ${item.fase}`}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          La plataforma se abrirá al público cuando todas las funcionalidades estén
          operativas y verificadas.{" "}
          <Link href="/informacion" className="underline underline-offset-2">
            Más información
          </Link>
        </p>
      </section>
    </div>
  );
}
