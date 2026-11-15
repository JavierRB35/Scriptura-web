# PLAN DE EJECUCIÓN — SCRIPTURA WEB

**Reglas:** las fases no son lanzamientos públicos; la web permanece protegida hasta la finalización total (§21). No iniciar una fase con dependencias críticas rotas de la anterior. Permitir trabajo paralelo con componentes desacoplados.
**Cómo usar este documento:** marcar [x] al completar y anotar la fecha. Es el registro vivo de avance para la continuidad entre sesiones (directriz §4).

## Fase 0 — Auditoría y preparación ✅ (2026-11-15)

- [x] Verificar repositorios (`Scriptura` existe y auditable; `ScripturaWeb` creado vacío como destino).
- [x] Auditoría del repositorio original → `03-AUDITORIA-FASE0.md`.
- [x] Selección de arquitectura → `02-ARQUITECTURA.md`.
- [x] Base documental del repositorio: directriz, especificación funcional, decisiones D01–D25 (en la especificación), auditoría, plan.

## Fase 1 — Infraestructura y persistencia

- [ ] Proyecto Next.js + TypeScript con estructura modular de `02-ARQUITECTURA.md`.
- [ ] Esquema PostgreSQL inicial y migraciones versionadas (entidades de §16).
- [ ] Autenticación (registro, verificación de correo, sesión, recuperación) y tablas de roles.
- [ ] Entornos separados y variables de entorno documentadas (`.env.example`).
- [ ] Pipeline de pruebas ejecutándose (unitarias + integración con PostgreSQL efímero).
- [ ] Despliegue técnico protegido (preview, sin apertura pública).

## Fase 2 — Biblioteca y lectura

- [ ] Importador reproducible USFM/OSIS con verificación de licencia, validación de cantidades y huellas de integridad.
- [ ] Importación íntegra y verificada de **Reina-Valera 1909** (ebible.org, dominio público) con metadatos completos (§5.4).
- [ ] Catálogo de libros/cánones (datos semilla desde la auditoría).
- [ ] Lectura: navegación libro/capítulo, URLs estables, anterior/siguiente, tamaño de letra, claro/oscuro, responsive.
- [ ] Búsqueda textual y por referencia.
- [ ] Selección contextual de versículos validada en servidor; panel desplegable (esqueleto).
- [ ] Pruebas de integridad bíblica (§22.5) satisfactorias.

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
