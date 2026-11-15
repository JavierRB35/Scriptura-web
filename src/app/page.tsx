import Image from "next/image";
import Link from "next/link";
import { Literata, Source_Sans_3 } from "next/font/google";

// Landing editorial: imágenes aprobadas verificadas en main y datos reales.
// No se alteran enlaces, autenticación ni lógica de negocio.
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
  { area: "Biblioteca de textos antiguos", fase: "Disponible", listo: true },
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
          className="grid grid-cols-1 items-start gap-9 pb-12 pt-9 sm:gap-10 sm:pt-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-12 lg:pb-16 lg:pt-12"
        >
          <div className="min-w-0">
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-accent sm:mb-5">
              <span aria-hidden="true" className="h-px w-8 bg-[#B58647]" />
              Escrituras · Lectura · Diálogo
            </p>

            <h1
              id="scriptura-portada"
              className="max-w-[690px] text-[clamp(2.45rem,3.7vw,3.65rem)] font-normal leading-[1.2] tracking-[-.04em]"
              style={serif}
            >
              La Biblia en el centro.{" "}
              <span className="italic text-accent">
                Descubre otras perspectivas.
              </span>
            </h1>

            <p className="mt-5 max-w-[540px] text-[1.02rem] leading-[1.68] text-muted sm:text-[1.1rem]">
              Una biblioteca abierta para leer y comprender las Escrituras con
              tranquilidad. La comunidad de reflexión y las herramientas de
              acompañamiento se incorporarán conforme estén verificadas.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

            <p className="mt-5 max-w-[540px] border-l-2 border-[#B58647] pl-4 text-[.86rem] leading-[1.6] text-muted">
              <strong className="font-semibold text-foreground">
                Lectura ya disponible:
              </strong>{" "}
              Reina-Valera 1909, edición histórica de dominio público,
              procedente de eBible.org.
            </p>
          </div>

          <figure className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_44px_rgba(31,92,69,.10)]">
            <div className="relative aspect-video w-full overflow-hidden bg-accent-soft">
              <Image
                src="/images/approved/IMG-04.webp"
                alt="El camino de la lectura. Ilustración editorial aprobada para la portada de Scriptura."
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <figcaption className="px-5 py-4 sm:px-6 sm:py-5">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">
                Biblioteca bíblica · Reina-Valera 1909
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Texto íntegro disponible para lectura y búsqueda por referencias.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xl font-medium text-foreground sm:text-2xl" style={serif}>66</p>
                  <p className="mt-1 text-xs text-muted">libros</p>
                </div>
                <div>
                  <p className="text-xl font-medium text-foreground sm:text-2xl" style={serif}>1.189</p>
                  <p className="mt-1 text-xs text-muted">capítulos</p>
                </div>
                <div>
                  <p className="text-xl font-medium text-foreground sm:text-2xl" style={serif}>31.102</p>
                  <p className="mt-1 text-xs text-muted">versículos</p>
                </div>
              </div>
            </figcaption>
          </figure>
        </section>

        <section
          aria-labelledby="scriptura-experiencia"
          className="border-t border-border py-12 sm:py-16"
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

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="overflow-hidden rounded-xl border border-[#C4D5CA] bg-accent-soft p-7 sm:p-8">
              <div className="relative -mx-7 -mt-7 mb-7 aspect-video overflow-hidden bg-accent-soft sm:-mx-8 sm:-mt-8">
                <Image
                  src="/images/approved/IMG-05.webp"
                  alt="Imagen editorial de la biblioteca bíblica"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-accent">01 · Disponible</p>
              <h3 className="mt-5 text-[1.45rem] font-normal leading-[1.3]" style={serif}>
                Leer con claridad
              </h3>
              <p className="mt-3 text-[.98rem] leading-[1.75] text-muted">
                Libros y capítulos navegables, versículos numerados y
                búsqueda de textos y referencias.
              </p>
              <Link
                href="/biblia"
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Abrir la Biblia →
              </Link>
            </article>

            <article className="overflow-hidden rounded-xl border border-border bg-surface p-7 sm:p-8">
              <div className="relative -mx-7 -mt-7 mb-7 aspect-video overflow-hidden bg-accent-soft sm:-mx-8 sm:-mt-8">
                <Image
                  src="/images/approved/IMG-06.webp"
                  alt="Imagen editorial de los debates bíblicos"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-muted">02 · En desarrollo</p>
              <h3 className="mt-5 text-[1.45rem] font-normal leading-[1.3]" style={serif}>
                Reflexionar en comunidad
              </h3>
              <p className="mt-3 text-[.98rem] leading-[1.75] text-muted">
                Espacios para comentar pasajes y compartir perspectivas
                mediante conversaciones respetuosas.
              </p>
            </article>

            <article className="overflow-hidden rounded-xl border border-border bg-surface p-7 sm:p-8">
              <div className="relative -mx-7 -mt-7 mb-7 aspect-video overflow-hidden bg-accent-soft sm:-mx-8 sm:-mt-8">
                <Image
                  src="/images/approved/IMG-08.webp"
                  alt="Imagen editorial de fuentes documentales"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-accent">03 · Disponible</p>
              <h3 className="mt-5 text-[1.45rem] font-normal leading-[1.3]" style={serif}>
                Explorar textos antiguos
              </h3>
              <p className="mt-3 text-[.98rem] leading-[1.75] text-muted">
                Seis evangelios apócrifos con lectura íntegra, manuscritos
                documentados y traducciones provisionales claramente identificadas.
              </p>
              <Link
                href="/biblioteca"
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Abrir Biblioteca →
              </Link>
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
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
