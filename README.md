# Scriptura Web

Plataforma web pública, gratuita e interconfesional para leer la Biblia, comprender sus contenidos, compartir reflexiones y descubrir otras perspectivas. **Leer, comprender, reflexionar, compartir y descubrir.**

> **Directriz obligatoria:** este repositorio (rama `main`) es la **única fuente de verdad** del proyecto. Todo trabajo comienza leyendo GitHub y termina actualizando GitHub. Ver [`docs/00-DIRECTRIZ-GITHUB.md`](docs/00-DIRECTRIZ-GITHUB.md).

## Estado actual (2026-11-15)

| Fase | Estado |
|---|---|
| **Fase 0** — Auditoría y preparación | ✅ Completada |
| **Fase 1** — Infraestructura y persistencia | ✅ Completada |
| **Fase 2** — Biblioteca y lectura | ✅ Completada (RV1909 íntegra y publicada) |
| **Fase 3** — Comunidad | ✅ Completada (comentarios, debates, reputación, aislamiento verificado) |
| **Fase 4** — Administración y moderación | ✅ Completada (moderación con apelaciones, métricas y auditoría) |
| **Fase 5** — Inteligencia artificial | 🔄 Asistente de lectura operativo (editorial pendiente) |
| **Fase 6** — Lecturas diarias por correo | 🔄 Infraestructura completa |
| **Fase 7** — Integración y aceptación | Pendiente |

**Biblia disponible:** Reina-Valera 1909 (dominio público, ebible.org) — 66 libros,
1.189 capítulos, 31.102 versículos, importación reproducible y verificada. Lector,
búsqueda textual y por referencia en `/biblia`.

**Biblioteca de textos antiguos:** disponible en **`/biblioteca`**, con lectura de los seis evangelios extracanonicos traducidos al español y fichas de procedencia. Las seis versiones son **borradores completos, pendientes de revisión editorial**; esta condición está visible en la web. Catálogo extensible por manifiesto, sin crear rutas manuales. Véanse [`data/apocrypha/README.md`](data/apocrypha/README.md) y [`docs/11-BIBLIOTECA-WEB.md`](docs/11-BIBLIOTECA-WEB.md).

**Despliegue técnico (protegido, sin apertura pública del producto):**
https://scriptura-web-eight.vercel.app — despliegue automático desde `main`.
Infraestructura: Vercel (web) + Supabase `ScripturaWeb` (PostgreSQL eu-west-3 París,
autenticación). Sin datos sintéticos en producción.

La aplicación original Android ([JavierRB35/Scriptura](https://github.com/JavierRB35/Scriptura)) fue auditada como origen de datos y criterios; **no** es código reutilizable para la web y su contenido de la Biblia de Navarra está excluido permanentemente del nuevo proyecto.

## Documentación vigente

| Documento | Contenido |
|---|---|
| [`docs/00-DIRECTRIZ-GITHUB.md`](docs/00-DIRECTRIZ-GITHUB.md) | Directriz: GitHub como única fuente de verdad |
| [`docs/01-ESPECIFICACION-FUNCIONAL.md`](docs/01-ESPECIFICACION-FUNCIONAL.md) | Especificación funcional aprobada (documento rector: misión, decisiones D01–D25, modelo de datos, criterios de aceptación) |
| [`docs/02-ARQUITECTURA.md`](docs/02-ARQUITECTURA.md) | Arquitectura técnica vigente |
| [`docs/03-AUDITORIA-FASE0.md`](docs/03-AUDITORIA-FASE0.md) | Auditoría de la app original y clasificación REUTILIZAR/ADAPTAR/RECONSTRUIR |
| [`docs/04-PLAN-EJECUCION.md`](docs/04-PLAN-EJECUCION.md) | Plan por fases con estado de avance (registro de continuidad) |
| [`docs/05-DIRECTRIZ-IDENTIDAD-VISUAL.md`](docs/05-DIRECTRIZ-IDENTIDAD-VISUAL.md) | **Directriz visual vinculante V01–V16**: marca, tipografía, colores, ubicación de imágenes, UX, accesibilidad y SEO |
| [`docs/06-CATALOGO-RECURSOS-GRAFICOS.md`](docs/06-CATALOGO-RECURSOS-GRAFICOS.md) | Inventario inicial de 20 recursos maestros, formatos, ubicación, temas y prompts para diseñador |
| [`docs/08-INVENTARIO-ARCAISMOS.md`](docs/08-INVENTARIO-ARCAISMOS.md) | Arcaísmos encontrados en la RV1909, recuentos y criterios para una adaptación léxica controlada |
| [`docs/09-IMAGENES-EVANGELIOS-APOCRIFOS.md`](docs/09-IMAGENES-EVANGELIOS-APOCRIFOS.md) | Catálogo visual, asociaciones y derechos; verificar archivos efectivos antes de usar |
| [`docs/10-TRADUCCIONES-APOCRIFOS.md`](docs/10-TRADUCCIONES-APOCRIFOS.md) | Inventario de seis traducciones, control de numeración, manuscritos y estado de revisión |
| [`docs/11-BIBLIOTECA-WEB.md`](docs/11-BIBLIOTECA-WEB.md) | Rutas públicas de Biblioteca, lector genérico y protocolo de incorporación de obras futuras |

## Reglas esenciales (resumen)

1. **Ninguna funcionalidad ficticia**: sin datos, botones ni respuestas simuladas.
2. **Biblia íntegra e inmutable**: primera edición Reina-Valera 1909 (dominio público, ebible.org), importación reproducible y verificada; prohibido contenido de la Universidad de Navarra.
3. **Comunidad solo para registrados**, bloqueado en servidor y base de datos, no solo visualmente.
4. **Gratuita y financiada por el propietario**: sin pagos ni donaciones.
5. **Pruebas reales**: una función está completada solo con código operativo, persistencia real, permisos correctos y pruebas satisfactorias.
6. Modificaciones menores y seguras directamente en `main`; ramas/PR solo cuando el riesgo lo justifique.
7. **Diseño y recursos:** respetar decisiones V01–V17 de `docs/05-DIRECTRIZ-IDENTIDAD-VISUAL.md` y briefs de `docs/06-CATALOGO-RECURSOS-GRAFICOS.md`; ninguna imagen decorativa dentro de capítulos bíblicos.
8. **Versículos numerados y separados:** cada versículo debe mostrar su número y comenzar en una nueva línea/bloque; prohibidos versículos consecutivos en párrafo corrido (V17, especificación §6.4).

## Desarrollo

Aplicación Next.js 16 (App Router) + TypeScript con base de datos PostgreSQL (+pgvector) mediante Supabase.

```bash
npm install
docker compose up -d            # PostgreSQL 16 con pgvector en localhost:5433
cp .env.example .env.local      # configurar valores (local: postgres://scriptura:scriptura@localhost:5433/scriptura)
npm run db:migrate              # aplicar migraciones versionadas
npm run db:seed                 # sembrar catálogo de libros y cánones
npm run dev                     # http://localhost:3000
```

Verificaciones (la CI las ejecuta en cada push):

```bash
npm run typecheck   # tipos
npm run lint        # ESLint
npm test            # 21 pruebas: unitarias + integración real contra PostgreSQL
npm run build       # compilación de producción
python3 scripts/verify-apocrypha-translations.py  # seis apócrifos (integridad estructural)
```

Estructura: `src/<módulo>/` (bible, community, reputation, moderation, auth, ai, liturgy, email, admin, shared) · `db/migrations/` · `scripts/` · `tests/`. Detalle en `docs/02-ARQUITECTURA.md` y `AGENTS.md`.

## Licencias y fuentes

- Biblia: Reina-Valera 1909 — dominio público (verificación en Fase 2, fuente inicial `https://ebible.org/spaRV1909/`).
- Geografía bíblica (futura biblioteca IA): OpenBible.info CC BY 4.0; etiquetas Wikidata CC0 (heredada de la app original con atribución).
- Los secretos y credenciales nunca se versionan aquí.
