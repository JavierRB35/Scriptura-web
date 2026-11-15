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

## Ampliación editorial de lectura (2026-11-15)

- [x] Cotejo de «crió» en 25 referencias con dos sentidos históricos.
- [x] Primera tanda de demostrativos y enclíticos: 441 versículos únicos revisados, sin alterar el texto de origen; pruebas de integridad en CI.
- [x] Tanda 3 (2026-11-15): 198 versículos con «llamóle», «hacimiento de gracias», «es menester que», «en derredor», usos de «mancebo(s)» y «vianda(s)». Cotejados 216 candidatos: 18 preservados por contexto. Prueba de integración contra fuente RV1909.
- [ ] Revisar las 18 excepciones de la tanda 3 y los restantes arcaísmos polisémicos con intervención editorial verificable.
- [ ] Auditar exhaustivamente todo el corpus antes de etiquetar una adaptación como completa.


## Ampliación — Biblioteca de textos antiguos (2026-11-15)

- [x] Catálogo público `/biblioteca` con categorías de los seis evangelios extracanonicos y acceso desde navegación/portada.
- [x] Lector genérico por identificador; original y versión española ligados al manifiesto, apartados y numeración preservados.
- [x] Soporte para altas futuras: nueva fuente, Markdown, metadatos y derechos en manifiesto; sin página personalizada por obra.
- [x] Avisos editoriales visibles de que son **traducciones de trabajo** y fuentes extracanonicas, con `noindex` mientras no haya revisión.
- [x] Validaciones de estructura, integridad y test unitario del catálogo.
- [ ] Cotejar y revisar de manera independiente las seis versiones españolas antes de declararlas ediciones revisadas.
- [ ] Verificar y subir los archivos de imágenes de los evangelios, todavía no comprobados en `public/images/apocrypha`.

## Fase 3 — Comunidad

- [ ] Perfiles, alias únicos, preferencias de privacidad (historial privado por defecto).
- [ ] Comentarios asociados a pasajes validados; respuestas; likes (reglas §7.3).
- [ ] Debates: ciclo editorial completo, propuestas de usuarios, seguimiento.
- [ ] Favoritos de pasajes y notificaciones internas configurables.
- [ ] Reputación: eventos verificables, reglas versionadas en configuración, reconocimientos.
- [ ] Aislamiento de comunidad frente a visitantes probado automatizadamente (§18.7).

## Fase 4 — Administración y moderación ✅ (2026-11-15)

- [x] Panel privado (/admin) con métricas reales calculadas desde registros
      (miembros, aportaciones, debates, denuncias/apelaciones abiertas,
      restricciones activas, suscripciones, consumo IA, correos) y auditoría
      reciente visible; acceso restringido por rol comprobado en servidor.
- [x] Roles diferenciados admin/editor/moderador (acumulables, verificados en
      cada operación sensible; la concesión se realiza en BD por seguridad).
- [x] Denuncias: /denuncia para miembros, catálogo cerrado de motivos,
      sin duplicados abiertos por denunciante/objetivo; cola con contexto del
      contenido (extracto y autor, sin exponer datos de más).
- [x] Medidas proporcionales con justificación obligatoria (§11.3): ocultar,
      restaurar, restricción temporal de 1 a 90 días, advertencia; todo
      registrado en audit_events y visible en el panel.
- [x] Apelaciones: /apelar con verificación de medida reciente; estimada
      restaura contenido y levanta restricciones; desestimada las mantiene;
      resultado notificado al afectado.
- [x] Gestión editorial de debates (Fase 3). Publicación de nuevas ediciones
      exige validaciones del importador (Fase 2); interfaz de catálogo
      llegará si se amplía el catálogo.
- [x] 118/118 pruebas, incluido el flujo completo denuncia→ocultación→
      restricción→apelación→decisión con verificación de visibilidad por
      políticas RLS.

## Fase 5 — Inteligencia artificial 🔄 (2026-11-15: asistente de lectura operativo)

- [x] Biblioteca documental con metadatos y condiciones de uso (§12.3):
      knowledge_sources/documents/chunks con estado editorial; ingesta
      idempotente por (fuente, título, versión) con troceado por párrafos.
- [x] Recuperación (§12.2): versículos SIEMPRE del repositorio bíblico
      autorizado (referencia detectada en cualquier posición de la pregunta
      + coincidencias léxicas tsvector/GIN); fragmentos por texto completo
      y por similitud pgvector cuando existan embeddings. Funciona sin
      proveedor de IA (vía léxica real, no simulada).
- [x] Proveedor sustituible (§17.5): interfaz OpenAI-compatible
      (AI_PROVIDER_BASE_URL/API_KEY/MODEL + AI_EMBEDDING_MODEL), claves solo
      en servidor; modo degradado honesto sin configuración.
- [x] Asistente de lectura (§12.1, §12.6): /biblia/asistente con
      consentimiento explícito revocable (user_consents), cuota diaria en
      system_settings, registro de consumo en ai_usage_events y fuentes
      entregadas en ai_source_references.
- [x] Validación de citas (§12.4, §12.7): toda cita debe proceder de las
      fuentes entregadas (referencia inventada → respuesta rechazada, no
      mostrada); detección de inyección en preguntas; prompt de sistema fijo
      que trata las fuentes como dato, no como instrucciones.
- [ ] Asistente editorial (§12.1): capacidad aprobada pendiente de interfaz;
      la recuperación fundamentada ya disponible es su base.
- [ ] Pruebas de comportamiento con proveedor real (§12.7 E2E): la batería
      unitaria de citas/inyección está en verde; la E2E requiere clave.
- [ ] 146/146 pruebas en verde; CI valida todo el flujo sin proveedor.

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
