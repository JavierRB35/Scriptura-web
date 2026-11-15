# PLAN DE EJECUCIÓN — SCRIPTURA WEB

**Reglas:** las fases no son lanzamientos públicos; la web permanece protegida hasta la finalización total (§21). No iniciar una fase con dependencias críticas rotas de la anterior. Permitir trabajo paralelo con componentes desacoplados.
**Cómo usar este documento:** marcar [x] al completar y anotar la fecha. Es el registro vivo de avance para la continuidad entre sesiones (directriz §4).

## Fase 0 — Auditoría y preparación ✅ (2026-11-15)

- [x] Verificar repositorios (`Scriptura` existe y auditable; `ScripturaWeb` (renombrado luego a `Scriptura-web`) creado vacío como destino).
- [x] Auditoría del repositorio original → `03-AUDITORIA-FASE0.md`.
- [x] Selección de arquitectura → `02-ARQUITECTURA.md`.
- [x] Base documental del repositorio: directriz, especificación funcional, decisiones D01–D25 (en la especificación), auditoría, plan.

## Fase 1 — Infraestructura y persistencia ✅ (2026-11-15)

- [x] Proyecto Next.js + TypeScript con estructura modular de `02-ARQUITECTURA.md`.
- [x] Esquema PostgreSQL inicial y migraciones versionadas (entidades de §16):
      10 migraciones (extensiones, sistema, biblia, usuarios, comunidad, reputación,
      moderación, IA con pgvector, liturgia/correo, RLS y concesiones). Runner idempotente
      `npm run db:migrate`; verificado en PostgreSQL 16 real.
- [x] Catálogo canónico sembrado (73 libros, cánones católico 73 y protestante 66) con
      pruebas de integridad; origen: auditoría Fase 0.
- [x] Autenticación y roles — código completo: registro, verificación de correo,
      sesión (proxy con `getUser()` validado), recuperación, perfiles automáticos con
      alias provisional y roles acumulables comprobados en base de datos.
      **Pendiente:** verificación E2E contra una instancia Supabase real (credenciales).
- [x] Entornos: `.env.example` documentado, PostgreSQL local con pgvector
      (`docker compose up -d`), separación dev/pre/producción descrita en arquitectura.
- [x] Pipeline de pruebas: Vitest unitarias (8) + integración real contra PostgreSQL
      (13: migraciones, siembra, perfiles, roles, comentarios/respuestas/likes,
      reputación, idempotencia de envíos) y CI de GitHub Actions con servicio
      pgvector. **Resultado local: 21/21 superadas; typecheck y lint limpios; build de
      producción correcto; smoke test del servidor compilado (200 en rutas públicas,
      307 en /admin sin sesión).**
- [x] Despliegue técnico protegido (2026-11-15): proyecto Vercel `scriptura-web`
      vinculado a `main` (URL pública https://scriptura-web-eight.vercel.app, muestra
      solo la página de estado; sin apertura pública del producto). Modo degradado
      controlado si faltan variables. **Supabase**: proyecto `ScripturaWeb`
      (eu-west-3 París) con las 10 migraciones aplicadas y catálogo sembrado
      (55 tablas, 73 libros). Variables de entorno inyectadas en Vercel (producción,
      preview y desarrollo) y autenticación configurada (Site URL, redirecciones,
      verificación de correo obligatoria).
- [x] Verificación E2E de autenticación contra Supabase real (usuario técnico de
      prueba creado y eliminado tras la comprobación).

## Fase 2 — Biblioteca y lectura ✅ (2026-11-15)

- [x] Importador reproducible USFM (`scripts/import-bible.ts`): descarga o fichero
      local, huella SHA-256 del zip y del contenido, validación de 66 libros ·
      1.189 capítulos · 31.102 versículos, capítulos por libro según tabla canónica,
      numeración secuencial, importación transaccional idempotente y registro de
      lotes con errores/advertencias (§5.5).
- [x] Importación íntegra y verificada de **Reina-Valera 1909** (ebible.org, dominio
      público) con metadatos completos (§5.4). Los 18 versículos sin texto en esta
      edición (numeración inglesa, p. ej. Jon 1:17→2:1) se conservan con texto vacío
      y se registran como advertencias (§5.2), explicados con honestidad en el lector.
- [x] Catálogo de libros/cánones (sembrado en Fase 1).
- [x] Lectura: URLs estables `/biblia/[libro]/[capitulo]`, índice y rejilla de
      capítulos con recuentos reales, anterior/siguiente entre libros (ventana
      LAG/LEAD sobre la rejilla real de la edición), tamaño de letra persistente,
      modo claro/oscuro/auto con conmutador (§6.1).
- [x] Búsqueda textual (ILIKE, orden canónico) y por referencia (parser propio:
      «Jn 3,16», «1 Corintios 13:1-7», prefijos inequívocos; sin inventar resultados).
- [x] Selección contextual de versículos con panel desplegable (esqueleto honesto:
      copia de enlace profundo `?v=inicio-fin` validado en servidor; los comentarios
      llegarán con la comunidad en Fase 3).
- [x] Pruebas de integridad bíblica (§22.5) satisfactorias: 51/51 pruebas totales,
      incluidas 6 de integridad (textos de control Gn 1:1 / Jn 3:16 / Sal 23:1 /
      Ap 22:21, caracteres del español, numeración secuencial, 18 vacíos declarados);
      la CI importa la Biblia real y verifica la integridad en cada push.

## Fase 3 — Comunidad

- [ ] Perfiles, alias únicos, preferencias de privacidad (historial privado por defecto).
- [ ] Comentarios asociados a pasajes validados; respuestas; likes (reglas §7.3).
- [ ] Debates: ciclo editorial completo, propuestas de usuarios, seguimiento.
- [ ] Favoritos de pasajes y notificaciones internas configurables.
- [ ] Reputación: eventos verificables, reglas versionadas en configuración, reconocimientos.
- [ ] Aislamiento de comunidad frente a visitantes probado automatizadamente (§18.7).

## Fase 4 — Administración y moderación

- [ ] Panel privado con roles administrador/editor/moderador y comprobación de permisos en cada operación.
- [ ] Denuncias, cola de revisión, medidas, apelaciones, auditoría.
- [ ] Gestión editorial de debates y catálogo de traducciones.
- [ ] Métricas administrativas reales (§15.4).

## Fase 5 — Inteligencia artificial

- [ ] Biblioteca documental con metadatos y condiciones de uso (§12.3).
- [ ] Ingesta, troceado, embeddings (pgvector) y recuperación.
- [ ] Asistente de lectura y asistencia editorial con citas verificables obligatorias.
- [ ] Interfaz `AiProvider` sustituible; límites, cuotas y registro de consumo.
- [ ] Batería de pruebas de comportamiento IA (§12.7) satisfactoria.

## Fase 6 — Lecturas diarias por correo

- [ ] Modelo de calendario litúrgico de España (celebraciones, ciclos, variantes) en tablas propias.
- [ ] Suscripciones independientes con confirmación, zona horaria IANA y hora de envío.
- [ ] Plantilla de correo responsive; textos completos solo con derechos (RV1909 atribuida), referencia y enlace si no.
- [ ] Cola duradera idempotente; reintentos; control de duplicados y rebotes (§13.6).
- [ ] Pruebas de fechas litúrgicas representativas (§22.6).

## Fase 7 — Integración y aceptación

- [ ] Escenarios E2E A–I (§22.3) automatizados.
- [ ] Pruebas de seguridad (§22.4) y revisión de accesibilidad WCAG 2.2 AA.
- [ ] Rendimiento medido; copias de seguridad y restauración comprobadas.
- [ ] Informe final de preparación y solicitud de autorización de apertura pública.

## Registro de intervenciones del propietario pendientes

| Momento | Asunto |
|---|---|
| Fase 1 | Credenciales: Supabase, Vercel, Resend, proveedor IA |
| Fase 6/7 | Revisión jurídica RGPD (categorías especiales, menores) antes de tratamiento real |
| Fase 7 | Autorización de apertura pública |
