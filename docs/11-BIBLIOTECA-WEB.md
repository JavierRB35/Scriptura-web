# Biblioteca web — catálogo documental extensible

**Fecha:** 15-11-2026  
**Estado:** implementada en `main`, accesible desde la cabecera y la portada.  
**Rutas:** `/biblioteca` (catálogo público) y `/biblioteca/[id]` (lector genérico).  
**Responsabilidad:** documentación y lectura de obras extracanonicas; el texto de la Biblia canónica y su módulo `/biblia` no se alteran.

## Contenido inicial real

Las seis traducciones españolas de trabajo archivadas en `data/apocrypha/es/` están incorporadas al catálogo:

- Evangelio de Tomás: 114 dichos, con índice de dichos.
- Evangelio de María: paginación 7–10 y 15–19, marcadores de lagunas.
- Evangelio de Pedro: 60 unidades numeradas en párrafos separados.
- Protoevangelio de Santiago: 25 capítulos con párrafos numerados y una variante independiente de los capítulos 18–21.
- Evangelio de la infancia de Tomás: 19 capítulos y anotaciones de procedencia de los manuscritos posteriores.
- Evangelio de Judas: páginas 33–58, fragmentos incompletos y notas críticas.

Todas las obras se presentan con sus nombres, extensión, descripción, fuente de referencia, traductor de la edición inglesa y enlace de origen. **Se etiquetan como traducciones de trabajo no revisadas de forma independiente y ajenas al canon de la Biblia RV1909.** El visitante puede leerlas, pero no se afirman derechos sobre traducciones de terceros ni autenticidad apostólica de los escritos. Sus páginas usan `noindex` hasta la futura revisión editorial.

## Implementación

- `src/library/catalog.ts`: única puerta de acceso al catálogo. Lee `data/apocrypha/manifest.json`; filtra estados públicos reconocidos, valida identificadores y rutas y ordena por `library.order`.
- `src/library/source.ts`: carga de documentos Markdown en el servidor desde rutas previamente aprobadas por el catálogo; nunca se admite una ruta libre proporcionada por el visitante.
- `src/library/markdown.ts`: parser limitado, sin HTML ejecutable. Interpreta cabeceras, párrafos, listas, notas y enlaces `http(s)`. Separa las unidades `(1)`, `(2)`… sin alterar los números históricos.
- `src/library/ui/document-reader.tsx`: lector con índice de capítulos/dichos, tipografía editorial, presentación accesible de unidades numeradas y sección de notas.
- `src/app/biblioteca/page.tsx`: catálogo por categorías que se crean a partir de los propios metadatos.
- `src/app/biblioteca/[id]/page.tsx`: una única ruta de lectura para todos los libros, con enlaces anterior/siguiente, miga de pan, metadatos y título SEO por obra.
- `src/app/biblioteca/layout.tsx`: tipografías Literata y Source Sans 3, variables de identidad visual ya aprobadas.
- `src/shared/ui/site-header.tsx` y `src/app/page.tsx`: menú de Biblioteca y acceso desde la portada. Menú móvil distribuido en 3 columnas y 2 filas; en tablet/escritorio muestra 6 opciones en una sola fila cuando cabe.
- `next.config.ts`: incluye `data/apocrypha/es/*.md` en el rastreo de archivos del lector al desplegar en Vercel.
- `tests/unit/library.test.ts`: catálogo, apertura de los seis documentos, índices, numeración y seguridad del parser; `scripts/verify-apocrypha-translations.py` sigue verificando las seis obras iniciales en CI.
- Los documentos permanecen **versionados en GitHub**. No se duplican en Supabase ni se generan comentarios o interacciones ficticias.

## Procedimiento para añadir un nuevo libro (sin cambiar la interfaz)

1. Elegir un identificador estable, único y seguro (letras minúsculas, dígitos y guiones, por ejemplo `didache`); documentar título, categoría, testimonio, autoría/traducción y situación de derechos. **No incorporar traducciones protegidas**.
2. Archivar el texto de referencia inalterado en `data/apocrypha/en/didache.txt` si se utiliza una edición inglesa. Documentar URL, origen, licencia, idioma y hash SHA-256.
3. Crear la versión española validada estructuralmente en `data/apocrypha/es/didache.md`, preservando las divisiones reales del texto, números, lagunas y notas. No inventar versículos. Registrar su SHA de objeto Git, equivalente al de GitHub para ese fichero.
4. Añadir un elemento nuevo a `data/apocrypha/manifest.json` con los mismos campos editoriales exigidos a las seis obras actuales. Campos especialmente importantes:
   - `id`, `title_es`, `title_en`, `source_url`, `translator`, `text_sha256`, `file`;
   - `translation_es_file: "es/didache.md"`, `translation_es_github_blob_sha`, `translation_es_status: "draft_completed_pending_editorial_review"` o `"reviewed"`;
   - `web_publication_status: "not_published"` mientras se prepara, y `"public_draft"` o `"published"` cuando esté lista para ser visible;
   - `library: { "order": 7, "category": "Cristianismo primitivo", "summary": "Descripción real y verificable", "extent": "Capítulos y unidades reales" }`.
5. Hacer commit a `main`. Tras el despliegue, la Biblioteca mostrará automáticamente la nueva obra en su categoría y se abrirá en `/biblioteca/didache`; no hay que crear una nueva página `page.tsx` ni insertar enlaces en la navegación.
6. Ejecutar `npm run typecheck`, `npm run lint`, `npm run test:unit`, `python3 scripts/verify-apocrypha-translations.py` y `npm run build`. Confirmar que no se ha alterado el catálogo canónico.
7. Si un libro sigue `not_published` o no tiene fichero y ficha completos, **no aparece en el catálogo**; así se evitan libros ficticios.

### Imágenes futuras

El campo opcional `library.cover` puede apuntar a `/images/apocrypha/<id>.webp`, y `library.alt` debe describir el recurso. Solo se añadirá el campo cuando el archivo local exista, sus derechos estén documentados y la imagen corresponda realmente al libro (o se identifique expresamente como ilustración posterior). Si falta la imagen, el lector y las tarjetas funcionan sin generar recursos ficticios. Las seis imágenes planificadas en `docs/09-IMAGENES-EVANGELIOS-APOCRIFOS.md` **no se han verificado como archivos presentes en `public/images/apocrypha`**, de modo que no se muestran hasta completar su incorporación.

## Calidad y límites

- Las páginas de la Biblioteca son **lectura pública**; no tienen sistema de comentarios ni favoritos propio. Si se añade interacción comunitaria, habrá que diseñar permisos, referencias persistentes y moderación verificables.
- La lectura de obras extracanonicas no altera las reglas V17 del lector bíblico. Las unidades numeradas de apócrifos también se muestran separadas cuando la fuente contiene números; las páginas de María y Judas conservan sus marcas de folio, no versículos inexistentes.
- Nada en el catálogo acredita por sí solo que los manuscritos se conservaran completos, fueran escritos por sus personajes titulares ni que el texto haya sido revisado por especialistas.
- Antes de declarar cada libro «edición revisada» se requiere cotejo filológico y revisión humana. Esta limitación es visible en la interfaz.

## Aceptación

- `/biblioteca` muestra todas las obras marcadas como visibles en el manifiesto.
- Cada enlace abre la obra real completa; todas las secciones numeradas y las notas están presentes.
- Texto bíblico y biblioteca extracanonica permanecen separados, con procedencia explícita.
- En móvil el menú conserva legibles los seis destinos principales sin desbordamiento horizontal.
- Un registro nuevo válido en el manifiesto, con texto y estado visible, se incorpora sin cambios de código.
- Rutas desconocidas se rechazan sin leer archivos arbitrarios del servidor.
