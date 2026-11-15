import Link from "next/link";
import { Literata, Source_Sans_3 } from "next/font/google";

// Landing: composición editorial basada únicamente en información comprobada
// en el repositorio. No depende de CSS Modules ni de imágenes sin entregar.
const literata = Literata({
  variable: "--font-landing-literata",
  subsets: ["latin"],
  display: "swap",
});
const sourceSans = Source_Sans_3({
  variable: "--font-landing-sans",
  subsets: ["latin"],
  display: "swap",
});

const ESTADO = [
  { area: "Biblioteca bíblica y búsqueda", fase: "Disponible", listo: true },
  { area: "Comunidad y debates", fase: "En desarrollo", listo: false },
  { area: "Administración y moderación", fase: "En desarrollo", listo: false },
  { area: "Asistente de IA con fuentes verificadas", fase: "En desarrollo", listo: false },
  { area: "Lecturas diarias por correo", fase: "En desarrollo", listo: false },
];

const serif = {
  fontFamily: "var(--font-landing-literata), Georgia, serif",
};

export default function Home() {
  return (
    <div
      className={`${literata.variable} ${sourceSans.variable} overflow-hidden bg-background text-foreground`}
      style={{ fontFamily: "var(--font-landing-sans), system-ui, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <section
          aria-labelledby="scriptura-portada"
          className="grid grid-cols-1 items-center gap-10 pb-16 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14 lg:pb-24 lg:pt-24"
        >
          <div className="min-w-0">
            <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-accent">
              <span aria-hidden="true" className="h-px w-8 bg-[#B58647]" />
              Escrituras · Lectura · Diálogo
            </p>

            <h1
              id="scriptura-portada"
              className="max-w-[690px] text-[clamp(2.75rem,5.3vw,5rem)] font-normal leading-[1.16] tracking-[-.045em]"
              style={serif}
            >
              La Biblia en el centro.{" "}
              <span className="italic text-accent">
                El espacio para descubrir otras perspectivas.
              </span>
            </h1>

            <p className="mt-7 max-w-[570px] text-[1.1rem] leading-[1.85] text-muted sm:text-[1.17rem]">
              Una biblioteca abierta para leer y comprender las Escrituras con
              tranquilidad. La comunidad de reflexión y las herramientas de
              acompañamiento se incorporarán conforme estén verificadas.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/biblia"
                className="inline-flex min-h-12 items-center justify-center gap-4 rounded-lg bg-[#1F5C45] px-7 py-3.5 text-center text-base font-semibold text-white shadow-[0_10px_24px_rgba(31,92,69,.15)] transition-colors hover:bg-[#174B38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Explorar la Biblia
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/registro"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface px-7 py-3.5 text-center text-base font-semibold text-foreground transition-colors hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Crear cuenta
              </Link>
            </div>

            <p className="mt-7 max-w-[540px] border-l-2 border-[#B58647] pl-4 text-sm leading-[1.75] text-muted">
              <strong className="font-semibold text-foreground">
                Lectura ya disponible:
              </strong>{" "}
              Reina-Valera 1909, edición histórica de dominio público,
              procedente de eBible.org.
            </p>
          </div>

          <aside
            aria-label="Datos de la biblioteca bíblica disponible"
            className="relative min-w-0 overflow-hidden rounded-[18px] bg-[#1F5C45] px-6 py-8 text-[#F7F1E5] shadow-[0_28px_65px_rgba(31,92,69,.18)] sm:px-9 sm:py-10 lg:min-h-[550px] lg:px-10 lg:py-12"
          >
            <div className="absolute inset-4 rounded-[10px] border border-[#A3B9A8]/30" aria-hidden="true" />
            <div className="relative flex h-full min-h-[340px] flex-col justify-between gap-12 lg:min-h-[445px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.21em] text-[#D4DECE]">
                  Biblioteca de Scriptura
                </p>
                <div className="mt-10 h-px w-12 bg-[#D6B077]" aria-hidden="true" />
                <h2
                  className="mt-6 max-w-[355px] text-[clamp(2.1rem,3.1vw,3.4rem)] font-normal leading-[1.24] tracking-[-.03em]"
                  style={serif}
                >
                  Lectura sin distracciones.
                </h2>
                <p className="mt-4 max-w-[330px] text-base leading-[1.75] text-[#E5EBE3]">
                  Una edición íntegra de las Escrituras, accesible libro a
                  libro, capítulo a capítulo.
                </p>
              </div>
              <div>
                <div className="grid grid-cols-3 gap-3 border-y border-[#A3B9A8]/40 py-6">
                  <div>
                    <p className="text-[clamp(1.45rem,2.5vw,2.15rem)] leading-tight" style={serif}>
                      66
                    </p>
                    <p className="mt-2 text-xs text-[#D4DECE]">libros</p>
                  </div>
                  <div>
                    <p className="text-[clamp(1.45rem,2.5vw,2.15rem)] leading-tight" style={serif}>
                      1.189
                    </p>
                    <p className="mt-2 text-xs text-[#D4DECE]">capítulos</p>
                  </div>
                  <div>
                    <p className="text-[clamp(1.45rem,2.5vw,2.15rem)] leading-tight" style={serif}>
                      31.102
                    </p>
                    <p className="mt-2 text-xs text-[#D4DECE]">versículos</p>
                  </div>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-[#D4DECE]">
                  Reina-Valera 1909 · Importación verificada en el proyecto
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section
          aria-labelledby="scriptura-experiencia"
          className="border-t border-border py-16 sm:py-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">
              Leer · Comprender · Compartir
            </p>
            <h2
              id="scriptura-experiencia"
              className="mt-5 text-[clamp(2rem,3.2vw,3.15rem)] font-normal leading-[1.28] tracking-[-.035em]"
              style={serif}
            >
              Primero, la lectura. Después, todo lo que puede enriquecerla.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-[1.8] text-muted">
              Un entorno editorial que pone el texto bíblico en primer plano
              y distingue con claridad entre las Escrituras, las opiniones
              de los lectores y las fuentes documentales.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-[#C4D5CA] bg-accent-soft p-7 sm:p-8">
              <p className="text-sm font-semibold text-accent">01 · Disponible</p>
              <h3 className="mt-9 text-[1.55rem] font-normal leading-[1.3]" style={serif}>
                Leer con claridad
              </h3>
              <p className="mt-3 text-[.98rem] leading-[1.75] text-muted">
                Libros y capítulos navegables, versículos numerados y
                búsqueda de textos y referencias.
              </p>
              <Link
                href="/biblia"
                className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Abrir la biblioteca →
              </Link>
            </article>

            <article className="rounded-xl border border-border bg-surface p-7 sm:p-8">
              <p className="text-sm font-semibold text-muted">02 · En desarrollo</p>
              <h3 className="mt-9 text-[1.55rem] font-normal leading-[1.3]" style={serif}>
                Reflexionar en comunidad
              </h3>
              <p className="mt-3 text-[.98rem] leading-[1.75] text-muted">
                Espacios para comentar pasajes y compartir perspectivas
                mediante conversaciones respetuosas.
              </p>
            </article>

            <article className="rounded-xl border border-border bg-surface p-7 sm:p-8">
              <p className="text-sm font-semibold text-muted">03 · En desarrollo</p>
              <h3 className="mt-9 text-[1.55rem] font-normal leading-[1.3]" style={serif}>
                Comprender con fuentes
              </h3>
              <p className="mt-3 text-[.98rem] leading-[1.75] text-muted">
                Acompañamiento documental y asistencia fundamentada en fuentes
                verificables, previstos para una fase posterior.
              </p>
            </article>
          </div>
        </section>

        <section
          aria-labelledby="scriptura-estado"
          className="grid grid-cols-1 gap-10 border-t border-border py-16 sm:py-20 lg:grid-cols-[.9fr_1.1fr]"
        >
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">
              Estado real del proyecto
            </p>
            <h2
              id="scriptura-estado"
              className="mt-5 text-[clamp(1.8rem,2.7vw,2.6rem)] font-normal leading-[1.3] tracking-[-.03em]"
              style={serif}
            >
              Construimos sobre lo que ya funciona.
            </h2>
            <p className="mt-4 text-base leading-[1.8] text-muted">
              La Biblia ya está incorporada. La plataforma completa se abrirá
              públicamente cuando sus funcionalidades estén operativas y
              verificadas.
            </p>
            <Link
              href="/informacion"
              className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Información y fuentes →
            </Link>
          </div>

          <ul className="rounded-xl border border-border bg-surface px-5 py-2 sm:px-7" aria-label="Estado de los módulos de Scriptura">
            {ESTADO.map((item) => (
              <li
                key={item.area}
                className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm font-medium leading-relaxed text-foreground">
                  {item.area}
                </span>
                <span
                  className={item.listo
                    ? "shrink-0 text-xs font-semibold text-accent"
                    : "shrink-0 text-xs text-muted"}
                >
                  {item.fase}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
