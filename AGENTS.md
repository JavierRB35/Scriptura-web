# Instrucciones para agentes de IA y desarrolladores

**Regla suprema: este repositorio (`main`) es la única fuente de verdad. Todo trabajo empieza leyendo GitHub y termina con commit/push verificable aquí.** Ver `docs/00-DIRECTRIZ-GITHUB.md`.

## Antes de empezar

1. Lee `README.md` → tabla de estado de fases.
2. Lee `docs/04-PLAN-EJECUCION.md` → qué está hecho y qué toca ahora.
3. Lee la sección relevante de `docs/01-ESPECIFICACION-FUNCIONAL.md` (el documento rector; sus decisiones D01–D25 son vinculantes y no se reabren).
4. **Antes de cualquier trabajo de interfaz, diseño, SEO o imágenes**, lee `docs/05-DIRECTRIZ-IDENTIDAD-VISUAL.md` (V01–V17 vinculantes) y `docs/06-CATALOGO-RECURSOS-GRAFICOS.md` (ubicación, formatos y prompts). No reabrir decisiones visuales aprobadas.

## Reglas de trabajo

- **Ninguna funcionalidad ficticia** (§0.2): sin datos ni respuestas simuladas. Los estados vacíos son honestos.
- **Ningún contenido de la Biblia de Navarra** en este repositorio, jamás (§5.1). Primera edición: Reina-Valera 1909, dominio público, de ebible.org.
- Textos bíblicos publicados: **inmutables**; solo cambian mediante nueva importación trazable.
- **V17: TODOS los versículos deben mostrarse OBLIGATORIAMENTE numerados y separados por un salto de línea:** cada versículo en su propio bloque/línea, nunca varios concatenados en un párrafo. Aplica al lector y secuencias de versículos en todas las pantallas, móvil y escritorio. Mantener texto original intacto y comprobarlo en pruebas. Véanse `docs/01-ESPECIFICACION-FUNCIONAL.md` §6.4 y `docs/05-DIRECTRIZ-IDENTIDAD-VISUAL.md` §5.1.
- Comunidad solo para registrados, bloqueado en servidor **y** base de datos (§18.7).
- **Identidad visual vigente:** editorial contemporánea, Literata + Source Sans 3, verde/marfil con oro y azul secundarios; lector bíblico SIN imágenes decorativas; imágenes solo donde aporten color y no interfieran. Ver directriz 05.
- **Recursos gráficos:** inventario de 20 piezas propuesto, NO obligatorio crear todas ni seleccionar una técnica pictórica única; IA y/o imágenes de terceros con derechos y atribución verificados. Ver catálogo 06.
- Cambios menores y seguros directamente en `main`; ramas/PR solo con riesgo o tamaño que lo justifiquen.
- Sin perfeccionismo improductivo (§0.1): analizar lo necesario, decidir, implementar, verificar, avanzar.

## Comandos esenciales

```bash
npm install
docker compose up -d                       # PostgreSQL local con pgvector (puerto 5433)
cp .env.example .env.local                 # y rellenar valores
npm run db:migrate && npm run db:seed      # esquema + catálogo de libros
npm run dev                                # desarrollo en :3000
npm run typecheck && npm run lint          # calidad (obligatorio antes de commit)
npm test                                   # unitarias + integración (requiere DATABASE_URL)
npm run build                              # compilación de producción
```

## Estructura

- `src/<módulo>/` — dominios modulares (bible, community, reputation, moderation, auth, ai, liturgy, email, admin, shared). Ver `docs/02-ARQUITECTURA.md`.
- `db/migrations/` — migraciones SQL versionadas (aplicarlas solo con `npm run db:migrate`).
- `scripts/` — herramientas (runner de migraciones, sembrado).
- `tests/unit`, `tests/integration` — pruebas Vitest; la CI los ejecuta con PostgreSQL real.

## Al terminar

1. `typecheck`, `lint` y pruebas en verde.
2. Commit descriptivo y push a `main` (la CI debe quedar verde).
3. Actualiza `docs/04-PLAN-EJECUCION.md` si cambia el estado de una fase.
