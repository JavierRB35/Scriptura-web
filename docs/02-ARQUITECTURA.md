# ARQUITECTURA TÉCNICA — SCRIPTURA WEB

**Decisión:** confirmada en Fase 0 (2026-11-15) a partir de la auditoría (`03-AUDITORIA-FASE0.md`) y la especificación §17.
**Estado:** vigente. Cualquier cambio requerirá registrar la justificación en este documento.

## Principio

**Monolito modular bien estructurado** con servicios gestionados. Sin microservicios, sin abstracciones injustificadas (§0.1, §17.1).

## Tabla de tecnologías

| Componente | Tecnología | Motivación |
|---|---|---|
| Frontend + backend | **Next.js (App Router) + TypeScript** | Capa de servidor integrada; SSR para lectura pública y API routes para operaciones comunitarias; un único despliegue |
| Base de datos | **PostgreSQL (Supabase)** | Relacional, migraciones versionadas, Row Level Security |
| Búsqueda semántica | **pgvector** | Embeddings en el mismo PostgreSQL, sin servicio adicional |
| Autenticación | **Supabase Auth** | Correo+contraseña, verificación, recuperación, roles propios en tablas |
| Almacenamiento de archivos | **Supabase Storage** | Documentos de la biblioteca de IA, avatares |
| Alojamiento | **Vercel** | Preview por PR, protección de despliegue hasta apertura autorizada |
| Correo transaccional | **Resend** (o equivalente tras interfaz interna) | Lecturas diarias y correos de servicio |
| IA | Proveedor sustituible mediante **interfaz interna** (`AiProvider`) | Evitar dependencia (§17.5); claves solo en el servidor |
| Tareas programadas | Cola persistente en PostgreSQL + scheduler (Vercel Cron desencadena, la cola manda) | Idempotencia de envíos diarios (§13.4) |
| Pruebas | Vitest (unitarias) · Playwright (E2E) · pruebas de integración contra PostgreSQL efímero | §22 |

## Módulos del monolito (dominios)

```
src/
  bible/          # fuentes, ediciones, cánones, importación, lectura, búsqueda
  community/      # comentarios, respuestas, likes, favoritos, debates
  reputation/     # eventos, reglas versionadas, reconocimientos
  moderation/     # denuncias, casos, sanciones, apelaciones
  auth/           # perfiles, roles, preferencias, privacidad
  ai/             # RAG, biblioteca documental, citas verificables, consumo
  liturgy/        # calendario, celebraciones, lecturas, variantes
  email/          # suscripciones, plantillas, cola de envíos, reintentos
  admin/          # panel, métricas, auditoría
  shared/         # db, validación, errores, ui primitives
```

Regla de dependencia: los módulos se comunican mediante sus interfaces públicas; `shared` no depende de ningún dominio.

## Reglas fijas

1. **Datos de negocio en PostgreSQL.** El almacenamiento del servidor web nunca es fuente de verdad (§17.3).
2. **Autorización en servidor y base de datos** (RLS en Supabase). Ocultar en el cliente no basta (§4.1, §18.6).
3. **Secretos fuera del código**: variables de entorno del servidor; jamás en el bundle cliente. `.env.example` documenta nombres sin valores.
4. **Región UE** en los proveedores que lo permitan; verificar transferencias internacionales (§17.4).
5. **Migraciones versionadas** (estructura y datos semilla) — el esquema de §16 es la referencia funcional, adaptando nombres si se conserva el comportamiento.
6. **Entornos**: desarrollo, preproducción (datos sintéticos identificados) y producción protegida hasta autorización de apertura (§17.6).
7. **Textos bíblicos inmutables tras publicación**: importación reproducible desde USFM/OSIS de fuentes documentadas (RV1909 de ebible.org como primera edición); prohibido el contenido de la Universidad de Navarra (§5).
