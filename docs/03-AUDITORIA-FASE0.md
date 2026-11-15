# AUDITORÍA FASE 0 — APLICACIÓN SCRIPTURA ORIGINAL

**Fecha:** 2026-11-15
**Objeto:** `JavierRB35/Scriptura` (rama `main`, último commit `9defcd6`, actualizado 2026-11-12)
**Método:** clonación y revisión directa del código, README (33 KB), `docs/`, `tools/`, `qa/` y workflows CI.

## 1. Estado del repositorio

- Existe, es público y está activo. Serie 0.x (desarrollo preliminar), versión funcional ~0.8.3.
- 122 archivos. Compilación y QA automatizadas mediante 4 GitHub Actions (APK firmado, backup QA, definiciones QA, QA visual).

## 2. Arquitectura encontrada

- **App Android nativa**, Java 17, SDK 34, AGP 8.7.3, Gradle 8.9. Módulo único `app` (~9.000 líneas, ~50 clases).
- **Sin backend ni servidor propio.** Todos los datos en SQLite y almacenamiento privado del dispositivo. Sin cuentas de usuario.
- **Texto bíblico:** importado por cada usuario desde un **EPUB privado de la Biblia de la Universidad de Navarra** (no incluido en el repositorio — correcto). Validación de importación: 73 libros y ≥25.000 versículos, reemplazo transaccional con restauración ante fallo.
- **Liturgia (Misa):** enlaces y referencias obtenidos por análisis HTML de `lecturasdeldia.org` (proyecto independiente; texto oficial del leccionario propiedad de la CEE). No es API oficial.
- **IA:** Gemini principal con respaldo opcional Groq. Claves cifradas (AES-GCM + Android Keystore), consentimientos explícitos por sesión. Las respuestas se fundamentan exclusivamente en texto recuperado localmente y solo se aceptan si citan versículos existentes; no se envía el EPUB completo.
- **Módulos adicionales:** atlas geográfico (1.342 fichas; OpenBible.info CC BY 4.0, etiquetas Wikidata CC0; teselas OpenStreetMap), galería de arte (62 obras vía Wikimedia con verificación de licencia), contexto histórico (100 fichas editoriales propias offline), glosario/definiciones, anotaciones (notas y subrayados con anclajes a versículos), progreso de lectura, recordatorios, actualizador de APK vía GitHub Releases.
- **Pruebas:** 21 clases de test JUnit cubriendo lógica crítica (anclajes, versiones, referencias, geografía, historial IA).

## 3. Clasificación de componentes

### REUTILIZAR (traslado directo de datos/activos)

| Componente | Evidencia | Destino |
|---|---|---|
| Catálogo de 73 libros con códigos y nombres | `Books.java` (LinkedHashMap completa, AT 46 + NT 27) | Datos semilla de `biblical_books`/`biblical_canons` |
| Catálogo geográfico y licencias | `tools/build_geography_catalog.py`, `docs/GEOGRAFIA_CAPITULOS.md`, `docs/OPENBIBLE-LICENSE.txt` | Biblioteca documental IA / futuro atlas |
| Fichas de contexto histórico (100) | `assets/contexto_*.json`, `HistoricalContextStore.java` | Biblioteca documental IA |
| Identidad visual (paleta, estilos) | `res/values/scriptura_colors.xml`, `scriptura_styles.xml`, `docs/IDENTIDAD_VISUAL_V2.md` | Base del diseño editorial web |
| Prácticas de trazabilidad y QA | Estructura del README, informes en `docs/`, tests unitarios de lógica | Convenciones de Scriptura-web |

### ADAPTAR (reimplementar el criterio en la plataforma web)

| Componente | Lección a conservar |
|---|---|
| Validación de importación bíblica | Umbrales verificables (libros/versículos), transaccionalidad, reversión, informe de resultado parcial vs error |
| IA fundamentada | Recuperar texto solo del repositorio local autorizado; responder únicamente con citas verificables; consentimiento y registro de consumo |
| Anclajes de anotaciones | Referencias a pasajes reales validadas, nunca cadenas sueltas |
| Enfoque de estados vacíos y honestidad de UI | Sin datos ficticios; explicación de lo que falta y acción real para conseguirlo |

### RECONSTRUIR (incompatible con el objetivo web)

- Toda la interfaz Android (Activities, vistas, MainActivity de 3.269 líneas).
- Persistencia SQLite local → PostgreSQL gestionado.
- Importador de EPUB privado → **importador reproducible desde fuentes estructuradas (USFM/OSIS) de `ebible.org`, empezando por Reina-Valera 1909 (dominio público)**. Los EPUB antiguos de Scriptura no serán la fuente de verdad (especificación §5.5).
- Liturgia por scraping → modelo de datos propio de calendario litúrgico (tablas de §16.7) con criterio editorial documentado.
- Sin autenticación → Supabase Auth con roles, comunidad y moderación.

## 4. Riesgos identificados

1. **Contenido Navarra:** no debe migrar a Scriptura-web en ninguna forma (texto, notas, introducciones). El repositorio original no lo contiene; esta prohibición queda registrada aquí de forma permanente.
2. **Textos del leccionario (CEE):** propiedad de la Conferencia Episcopal Española; `lecturasdeldia.org` no es fuente oficial. El servicio de correo usará textos reproducibles (RV1909, dominio público, con atribución) y referencias con enlaces legítimos, sin pretender jamás la traducción litúrgica oficial (§13.3).
3. **Claves de IA:** en la web deben residir como secretos de entorno del servidor, nunca en el cliente (diferencia crítica respecto a la app, donde vivían en el Keystore del dispositivo).
4. **Scraping frágil:** la extracción HTML de terceros puede romperse; el nuevo calendario litúrgico será dato propio versionado en base de datos.

## 5. Arquitectura final elegida

Confirmada la propuesta de la especificación §17.2 ante la evidencia de que **no existe código web heredado reutilizable**: monolito modular Next.js + TypeScript con Supabase (PostgreSQL + pgvector + Auth + Storage), despliegue en Vercel, correo con Resend y proveedor de IA sustituible por interfaz interna. El patrimonio reutilizable son **datos, criterios de integridad y decisiones de producto**, no código. Detalle en `02-ARQUITECTURA.md`.

## 6. Bloqueos reales

- Ninguno para iniciar la Fase 1. Requerirán intervención del propietario cuando llegue el momento: credenciales de Supabase/Vercel/Resend/proveedor IA, y decisiones jurídicas (RGPD, política de menores) antes de abrir producción.

**Conclusión:** auditoría suficiente; no repetir salvo cambios relevantes en `Scriptura` (§25.1). Continuar directamente con la Fase 1.
