import Image from "next/image";
import Link from "next/link";
import { Literata, Source_Sans_3 } from "next/font/google";
import styles from "./page.module.css";

// La portada es estrictamente visual: los enlaces siguen apuntando a las
// mismas rutas existentes y no se simula actividad ni servicios pendientes.
// Estado verificado con README / docs/04-PLAN-EJECUCION.md (2026-11-15).
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
  { area: "Biblia y búsqueda", fase: "Disponible", listo: true },
  { area: "Comunidad y debates", fase: "En desarrollo", listo: false },
  { area: "Administración y moderación", fase: "En desarrollo", listo: false },
  { area: "Asistente de IA con fuentes verificadas", fase: "En desarrollo", listo: false },
  { area: "Lecturas diarias por correo", fase: "En desarrollo", listo: false },
];

export default function Home() {
  return (
    <div className={`${styles.landing} ${literata.variable} ${sourceSans.variable}`}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>La Biblia en el centro</p>
          <h1 className={styles.heading} id="landing-title">
            Leer las Escrituras.{" "}
            <span className={styles.headingEmphasis}>
              Descubrir otras perspectivas.
            </span>
          </h1>
          <p className={styles.intro}>
            Un espacio para leer, comprender y reflexionar sobre la Biblia
            con calma. Explora las Escrituras y descubre el proyecto de una
            comunidad abierta al diálogo y al conocimiento compartido.
          </p>
          <div className={styles.actions}>
            <Link href="/biblia" className={styles.primaryAction}>
              Explorar la Biblia
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/registro" className={styles.secondaryAction}>
              Crear cuenta
            </Link>
          </div>
          <p className={styles.provenance}>
            <span className={styles.provenanceMark} aria-hidden="true" />
            Reina-Valera 1909, edición histórica de dominio público.
            Lectura y búsqueda ya disponibles.
          </p>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.artworkFrame}>
            <Image
              src="/images/editorial/scriptura-inicio-hero.svg"
              alt=""
              width={1600}
              height={900}
              priority
              sizes="(max-width: 740px) 100vw, (max-width: 900px) 48vw, 45vw"
              className={styles.artwork}
            />
          </div>
          <div className={styles.visualCaption}>
            <span className={styles.captionLabel}>Scriptura</span>
            <span className={styles.captionText}>
              Leer, comprender, reflexionar y compartir.
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="descubrir-scriptura">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Una experiencia editorial</span>
          <h2 className={styles.sectionTitle} id="descubrir-scriptura">
            Una forma más serena de acercarse a las Escrituras.
          </h2>
          <p className={styles.sectionDescription}>
            La lectura ocupa el lugar principal. Los espacios de reflexión
            y las herramientas documentales se incorporarán conforme estén
            operativos y verificados.
          </p>
        </div>
        <div className={styles.features}>
          <article className={styles.feature}>
            <span className={styles.featureNumber}>01</span>
            <h3 className={styles.featureTitle}>Leer con claridad</h3>
            <p className={styles.featureDescription}>
              Una biblioteca bíblica con capítulos navegables, versículos
              numerados y búsqueda por texto o referencia.
            </p>
          </article>
          <article className={styles.feature}>
            <span className={styles.featureNumber}>02</span>
            <h3 className={styles.featureTitle}>Reflexionar en comunidad</h3>
            <p className={styles.featureDescription}>
              Un espacio de debate respetuoso y perspectivas compartidas,
              actualmente en desarrollo.
            </p>
          </article>
          <article className={styles.feature}>
            <span className={styles.featureNumber}>03</span>
            <h3 className={styles.featureTitle}>Comprender con fuentes</h3>
            <p className={styles.featureDescription}>
              Acompañamiento de lectura fundamentado en documentos
              verificables, previsto para una fase posterior.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.progress} aria-labelledby="estado-scriptura">
        <div>
          <span className={styles.sectionKicker}>Desarrollo transparente</span>
          <h2 className={styles.progressTitle} id="estado-scriptura">
            Lo que ya puedes explorar y lo que estamos preparando.
          </h2>
          <p className={styles.progressText}>
            La Biblia está disponible. El resto de la plataforma se abrirá
            públicamente cuando las funcionalidades previstas estén operativas
            y verificadas.
          </p>
          <Link href="/informacion" className={styles.moreLink}>
            Información y fuentes
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ul className={styles.statusList} aria-label="Estado de los módulos de Scriptura">
          {ESTADO.map((item) => (
            <li key={item.area} className={styles.statusItem}>
              <span className={styles.statusName}>{item.area}</span>
              <span className={`${styles.statusLabel} ${item.listo ? styles.ready : ""}`}>
                {item.fase}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
