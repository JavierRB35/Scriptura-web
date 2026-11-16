# D26 — Biblia católica íntegra (73 libros): integración y control editorial

**Fecha:** 16-11-2026 · **Fuente de verdad:** GitHub `main`.

## Objetivo y estado efectivo

El propietario ha elegido la Biblia católica íntegra como edición principal de Scriptura-web. El catálogo ya contiene 73 libros; la edición actualmente publicada en la base de datos es **Reina-Valera 1909 (RV1909), 66 libros**. **NO declarar publicada la Biblia católica mientras no se hayan cargado y comprobado sus textos completos en PostgreSQL.**

El desarrollo incorporado a la rama principal prepara la publicación de una transcripción íntegra de la **Biblia de Félix Torres Amat**, traducción católica de la Vulgata, histórica y en dominio público. El identificador de edición es `spaTorresAmat1835`. La traducción original del siglo XIX y una transcripción digital moderna **no son automáticamente el mismo objeto jurídico**: no importar un archivo de una web contemporánea sin verificar su licencia y trazabilidad. No incorporar texto protegido de la Biblia de Navarra.

## Cobertura exigida

- 73 libros (46 del Antiguo Testamento y 27 del Nuevo), en el orden de `src/bible/catalog.json`.
- Siete deuterocanónicos íntegros: `Tb` (14 capítulos), `Jdt` (16), `Sb` (19), `Si` (51), `Ba` (6), `1M` (16) y `2M` (15).
- Además de Ester 1–10 y Daniel 1–12: Ester 11–16, Daniel 3 (oración de Azarías/cántico de los tres jóvenes hasta al menos v. 90) y Daniel 13–14, de acuerdo con la **numeración Vulgata/Torres Amat** que adopta el importador. Los pasajes griegos intercalados y las diferencias internas de versificación se deben cotejar con el testigo físico/digital concreto; no basta con añadir capítulos vacíos.
- Total de capítulos esperados bajo este convenio: **1.334**. Esto no equivale a garantizar la integridad filológica: debe revisarse cada libro, incluido el contenido original, con una fuente independiente.
- Versículos con su número y separados, sin contenido sintético, generativo ni inventado. Si existen subdivisiones auténticas, preservar `key` y documentarlas.

## Testigo digital y derechos — pendiente

Documentar y conservar: (1) edición histórica concreta y URL del facsímil original, (2) URL de la transcripción, (3) derechos y permiso de redistribución de la transcripción, (4) cotejo del texto con facsímil o testigos independientes, (5) posibles ausencias y diferencias, y (6) SHA-256 del archivo y del contenido. La presencia de una página web accesible no concede licencia para copiar su base textual.

**Bloqueo editorial actual:** todavía no se dispone en el repositorio de un testigo JSON íntegro de 73 libros, revisado y redistribuible. En consecuencia, no se ejecutó una importación ni se alteró la Biblia publicada en producción. No reemplazar esta evidencia por una declaración falsa de éxito.

## Esquema JSON admitido

Archivo de entrada UTF-8 `testigo-torres-amat.json` (nombre orientativo):

```json
{
  "edition": "spaTorresAmat1835",
  "source": {
    "title": "Título fiel de la edición facsimilar",
    "edition_year": "1835",
    "original_url": "https://origen-del-facsimil.example/",
    "transcription_url": "https://fuente-digital-licenciada.example/",
    "transcription_rights": "Descripción y evidencia de licencia redistribuible",
    "proofread": true
  },
  "books": [
    {
      "code": "Gn",
      "chapters": [
        {
          "number": 1,
          "verses": [
            { "number": 1, "text": "Texto cotejado del versículo original" }
          ]
        }
      ]
    }
  ]
}
```

Este bloque ilustra **solamente la estructura**: es deliberadamente parcial y su contenido **NO debe publicarse**. El validador exige el JSON completo y no rellena posiciones faltantes.

## Procedimiento reproducible

1. Obtener un testigo completo de publicación legalmente autorizada. Comparar la numeración del testigo, también en Baruc/Ester/Daniel y sus inserciones, con los convenios de la edición; adaptar el importador solo con evidencias.
2. Verificar la declaración de derechos de transcripción y realizar el cotejo, **antes** de marcar `proofread=true`.
3. Ejecutar `npm run db:import-catholic -- --file testigo-torres-amat.json --check`. La validación comprueba 73 libros, 1.334 capítulos, versículos secuenciales y no vacíos; informa de SHA-256.
4. Aplicar las migraciones del repositorio y `npm run db:seed` si corresponde. Configurar `DATABASE_URL` con acceso autorizado.
5. Importar primero sin publicación: `npm run db:import-catholic -- --file testigo-torres-amat.json`. Confirmar libro/capítulo/versículo y comprobar muestras reales de cada libro y pasajes adicionales.
6. Tras revisión técnica y jurídica, ejecutar `npm run db:import-catholic -- --file testigo-torres-amat.json --publish`. La importación es transaccional e idempotente; una edición ya publicada con hash distinto no se reescribe.
7. Verificar en PostgreSQL `SELECT identifier, publication_status, canon_coverage FROM bible_editions ORDER BY created_at;` y conteos reales de `edition_books`, `bible_chapters`, `bible_verses`. Comprobar `/biblia`, búsqueda, navegación cruzada, numeración y fuentes.
8. Confirmar que `getPublishedEdition()` prefiere `spaTorresAmat1835` **únicamente cuando exista una edición publicada**; RV1909 permanece como histórico independiente. No aplicar modernizaciones de RV1909 a Torres Amat.

## Código trazable

- `src/bible/catholic-import.ts`: invariante de integridad y procedencia.
- `scripts/import-catholic-bible.ts`: importación transaccional con hashes y edición separada.
- `src/bible/queries.ts`: prioridad condicional y navegación entre libros reales de la edición.
- `src/bible/display-text.ts`, `src/bible/ui/reader-client.tsx`, rutas de capítulos y búsqueda: aislamiento editorial de la modernización RV1909.
- `tests/unit/catholic-import.test.ts`, `tests/unit/reader-render.test.ts`: regresiones estructurales y de presentación.

**Limitación:** estas pruebas demuestran que el validador rechaza textos incompletos; **no** prueban que exista ya un testigo real cotejado ni que el catálogo completo esté publicado en producción.

## Fuentes históricas localizadas para construir el testigo

- Original en la Biblioteca de la Universidad de Sevilla, **La Sagrada Biblia. Tomo I (1824)**: https://idus.us.es/items/60154398-b068-4bc8-ba22-9d407d4ca8f6 (facsimilar auténtico, pero solo un tomo; buscar los siguientes en la colección).
- Edición Torres Amat ilustrada por Doré, **1883–1884, cuatro tomos**: https://biblico.net/biblias-en-pdf/ (enlaces a los originales digitalizados de la Universidad de Sevilla). No adoptar una transcripción de esta edición como si fuera la segunda de 1832–1835 sin advertir las diferencias.
- Volúmenes de **Wikisource** e imágenes digitalizadas: https://es.wikisource.org/wiki/La_Sagrada_Biblia_(XV) (cada página puede tener estado distinto de revisión; comprobar derechos de las transcripciones y atribuir si aplica).
- Testigos de lectura actual para cotejos puntuales (NO autorizan por sí solos una copia masiva de sus bases de datos): https://fidesviva.org/es/biblia y https://iterfidei.com/es/biblia. Ambos exponen los 73 libros y atribuyen la traducción a Torres Amat; se debe comprobar la procedencia concreta, numeración y licencia del corpus antes de reutilizarlo.

**No existe todavía en el proyecto una transcripción íntegra y revisada con derechos de reutilización documentados.** Tampoco se han incorporado documentos facsimilares completos al repositorio; los enlaces anteriores son referencias para la obtención y cotejo.
