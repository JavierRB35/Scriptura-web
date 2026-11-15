import type { Metadata } from "next";

export const metadata: Metadata = { title: "Información y fuentes" };

export default function InformacionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Información y fuentes</h1>

      <section className="mt-8 space-y-6 leading-7">
        <div>
          <h2 className="font-semibold">Qué es Scriptura</h2>
          <p className="mt-2 text-muted">
            Una comunidad digital abierta e interconfesional para leer las Escrituras,
            comprender sus contenidos, compartir reflexiones y descubrir perspectivas
            diferentes. La plataforma no establece qué confesión posee la interpretación
            correcta: la Biblia ocupa el centro y las personas dialogan en torno a ella.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Gratuita</h2>
          <p className="mt-2 text-muted">
            Scriptura es completamente gratuita y está financiada por su propietario.
            No hay suscripciones de pago, funcionalidades exclusivas ni solicitudes de
            donaciones.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Textos bíblicos y derechos</h2>
          <p className="mt-2 text-muted">
            La primera edición prevista es la <strong>Reina-Valera 1909</strong>, en su
            versión histórica de dominio público, con procedencia documentada de{" "}
            <a
              href="https://ebible.org/spaRV1909/"
              className="underline underline-offset-2"
              rel="noreferrer"
              target="_blank"
            >
              ebible.org
            </a>
            . Cada edición publicada incluirá su situación de derechos, verificable
            desde la interfaz. No se utiliza la Biblia de la Universidad de Navarra ni
            sus materiales protegidos.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Estado del desarrollo</h2>
          <p className="mt-2 text-muted">
            El desarrollo por fases y su avance están documentados en el{" "}
            <a
              href="https://github.com/JavierRB35/ScripturaWeb"
              className="underline underline-offset-2"
              rel="noreferrer"
              target="_blank"
            >
              repositorio público del proyecto
            </a>
            . La apertura al público solo ocurrirá cuando todas las funcionalidades
            estén operativas y verificadas.
          </p>
        </div>
      </section>
    </div>
  );
}
