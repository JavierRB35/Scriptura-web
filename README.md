# Scriptura Web

Plataforma web pública, gratuita e interconfesional para leer la Biblia, comprender sus contenidos, compartir reflexiones y descubrir otras perspectivas. **Leer, comprender, reflexionar, compartir y descubrir.**

> **Directriz obligatoria:** este repositorio (rama `main`) es la **única fuente de verdad** del proyecto. Todo trabajo comienza leyendo GitHub y termina actualizando GitHub. Ver [`docs/00-DIRECTRIZ-GITHUB.md`](docs/00-DIRECTRIZ-GITHUB.md).

## Estado actual (2026-11-15)

| Fase | Estado |
|---|---|
| **Fase 0** — Auditoría y preparación | ✅ Completada |
| **Fase 1** — Infraestructura y persistencia | ⏳ Siguiente |
| Fases 2–7 | Pendientes |

La aplicación original Android ([JavierRB35/Scriptura](https://github.com/JavierRB35/Scriptura)) fue auditada como origen de datos y criterios; **no** es código reutilizable para la web y su contenido de la Biblia de Navarra está excluido permanentemente del nuevo proyecto.

## Documentación vigente

| Documento | Contenido |
|---|---|
| [`docs/00-DIRECTRIZ-GITHUB.md`](docs/00-DIRECTRIZ-GITHUB.md) | Directriz: GitHub como única fuente de verdad |
| [`docs/01-ESPECIFICACION-FUNCIONAL.md`](docs/01-ESPECIFICACION-FUNCIONAL.md) | Especificación funcional aprobada (documento rector: misión, decisiones D01–D25, modelo de datos, criterios de aceptación) |
| [`docs/02-ARQUITECTURA.md`](docs/02-ARQUITECTURA.md) | Arquitectura técnica vigente |
| [`docs/03-AUDITORIA-FASE0.md`](docs/03-AUDITORIA-FASE0.md) | Auditoría de la app original y clasificación REUTILIZAR/ADAPTAR/RECONSTRUIR |
| [`docs/04-PLAN-EJECUCION.md`](docs/04-PLAN-EJECUCION.md) | Plan por fases con estado de avance (registro de continuidad) |

## Reglas esenciales (resumen)

1. **Ninguna funcionalidad ficticia**: sin datos, botones ni respuestas simuladas.
2. **Biblia íntegra e inmutable**: primera edición Reina-Valera 1909 (dominio público, ebible.org), importación reproducible y verificada; prohibido contenido de la Universidad de Navarra.
3. **Comunidad solo para registrados**, bloqueado en servidor y base de datos, no solo visualmente.
4. **Gratuita y financiada por el propietario**: sin pagos ni donaciones.
5. **Pruebas reales**: una función está completada solo con código operativo, persistencia real, permisos correctos y pruebas satisfactorias.
6. Modificaciones menores y seguras directamente en `main`; ramas/PR solo cuando el riesgo lo justifique.

## Desarrollo

Por determinar en Fase 1 (Next.js + TypeScript + Supabase, ver arquitectura). Este apartado se actualizará con la puesta en marcha del proyecto cuando exista código.

## Licencias y fuentes

- Biblia: Reina-Valera 1909 — dominio público (verificación en Fase 2, fuente inicial `https://ebible.org/spaRV1909/`).
- Geografía bíblica (futura biblioteca IA): OpenBible.info CC BY 4.0; etiquetas Wikidata CC0 (heredada de la app original con atribución).
- Los secretos y credenciales nunca se versionan aquí.
