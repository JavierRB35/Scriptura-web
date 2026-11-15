# DIRECTRIZ VINCULANTE — IDENTIDAD VISUAL, DISEÑO Y SEO DE SCRIPTURA WEB

**Estado:** APROBADA · **Fecha:** 2026-11-15 · **Ámbito:** diseño de producto, interfaces, imágenes, experiencia de lectura, accesibilidad y SEO.
**Repositorio fuente de verdad:** [JavierRB35/Scriptura-web](https://github.com/JavierRB35/Scriptura-web), rama `main`.
**Documentos relacionados:** [01-ESPECIFICACION-FUNCIONAL.md](01-ESPECIFICACION-FUNCIONAL.md) (D01–D25, especialmente D02, D06, D08, D13, D14, D23), [06-CATALOGO-RECURSOS-GRAFICOS.md](06-CATALOGO-RECURSOS-GRAFICOS.md) (brief operativo de recursos).

> **OBLIGATORIO PARA CUALQUIER DESARROLLADOR O DISEÑADOR:** consultar esta directriz antes de crear o modificar páginas, componentes visuales, recursos gráficos, metadatos y experiencia de lectura. Las decisiones V01–V17 están cerradas. No reabrirlas sin una nueva instrucción expresa del propietario. No convertir el catálogo propuesto en trabajo superfluo ni bloquear funcionalidades por adornos.

## 1. Principio rector

Scriptura es una biblioteca bíblica digital editorial contemporánea, pública en su lectura y reservada a registrados en su comunidad. La Biblia manda; el diseño, las ilustraciones, los debates y las insignias facilitan comprender, descubrir y participar, pero jamás compiten con la Escritura. La identidad será **serena, luminosa, literaria, fiable, inclusiva y coherente**; no una web de pergaminos antiguos ni una red social saturada.

Los textos bíblicos son contenido documental inmutable, separado inequívocamente de opiniones, fuentes secundarias y respuestas de IA. No crear botones, usuarios, reseñas, contadores, comentarios, lecturas o datos ficticios en producción. Respetar permisos y privacidad real a nivel servidor y datos.

## 2. Registro de decisiones visuales aprobadas V01–V17

| ID | Decisión vinculante | Interpretación operativa |
|---|---|---|
| V01 | Imagen y texto equilibrados | Ilustrar cuando mejore descubrimiento o comprensión; no llenar pantallas de fotografías. |
| V02 | Ilustración pictórica como lenguaje de marca | La identidad visual original prefiere piezas pictóricas/editoriales; la técnica exacta NO queda impuesta. |
| V03 | Paisajes y escenas combinados | Admitir paisajes, elementos simbólicos y escenas cuando aporten contexto. |
| V04 | Personajes estilizados y prudentes | Evitar retratos doctrinales, reconstrucciones presentadas como certezas o imaginarios excluyentes. |
| V05 | Logotipo: libro abierto abstracto | Marca SVG legible, distinguible y escalable, con variantes horizontal, compacta y símbolo. |
| V06 | Verde principal, oro y azul secundarios | Recuperar la herencia Android solo como acentos; predomina el lenguaje editorial web. |
| V07 | Literata + Source Sans 3 | Literata para títulos/editorial y texto bíblico; Source Sans 3 para interfaz, formularios y conversaciones. |
| V08 | Portada en dos columnas | Texto y acciones separados de la imagen; nunca texto esencial horneado en la ilustración. |
| V09 | Reconocimientos: medallones sobrios | Vectoriales, discretos, sin estética competitiva ni superioridad religiosa. |
| V10 | 20 recursos maestros inicialmente | Inventario de planificación, no cuota de imágenes visibles ni exigencia de crear todas antes de poder avanzar. |
| V11 | Enfoque híbrido de imagen en Biblia | Lector tipográfico limpio; imagen en contexto, descubrimiento y contenidos complementarios. |
| V12 | Escenas: combinación contextual | Representación figurativa prudente cuando sirve al relato; simbolismo cuando aporta más claridad y neutralidad. |
| V13 | Hero equilibrado | Imagen ~45–50% y contenido ~50–55% del primer bloque en escritorio; responsive sin sacrificar CTA. |
| V14 | Páginas interiores editoriales equilibradas | Ilustraciones puntuales en cabeceras y destacados; resto limpio y funcional. |
| V15 | Obras históricas seleccionadas + originales | Colección de arte contextual separada de los recursos de identidad; autoría, procedencia y derechos verificados. |
| V16 | Ubicación y función de imágenes, no técnica obligatoria | Imágenes generadas con IA o reutilizadas con derechos acreditados. El foco de diseño es dónde aparecen, qué aportan y que nunca interfieran. CERRADO el debate sobre técnica artística y número exacto de escenas futuras. |
| V17 | Numeración y separación de versículos OBLIGATORIAS | Todo versículo de la lectura bíblica debe exhibir su número real y comenzar en una línea o bloque independiente; queda prohibida la presentación de versículos consecutivos en un mismo párrafo corrido. |

**Precedencia y aclaración:** V16 concreta el alcance de V02: «pictórico» describe el carácter visual aprobado, pero NO obliga al diseñador a óleo, acuarela u otra técnica exclusiva, ni a generar imágenes nuevas cuando exista un recurso licenciado adecuado. Las obras históricas no deben forzarse artificialmente a parecer imágenes de IA. La estética de todas las páginas debe seguir siendo coherente por composición, marcos, espaciado y color.

## 3. Identidad y tokens de diseño

**Paleta base (propuesta de implementación coherente con `src/app/globals.css`):**

| Token | Hex | Uso |
|---|---|---|
| `--background` | `#FAF7F2` | Fondo general marfil |
| `--surface` | `#FFFFFF` (alternativa papel `#FFFCF6`) | Lector y tarjetas |
| `--foreground` | `#26241F` | Texto principal |
| `--accent` | `#1F5C45` | Enlaces destacados y botones principales |
| `--accent-soft` | `#E7EFE9` | Superficies comunitarias y selección contextual |
| `--muted` | `#6F6A5E` | Texto secundario legible |
| `--border` | `#E4DED2` | Separadores suaves |
| Oro secundario | `#B58647` | Detalles, reconocimientos; NO texto pequeño sobre marfil |
| Azul noche | `#0D2338` | Acento documental muy limitado |

**Modo oscuro:** conservar como punto de partida el fondo `#16150F`, superficie `#1E1D16`, texto `#ECE7DB`, acento `#7FBFA4`. Ofrecer claro / oscuro / sistema con preferencia persistente, sin introducir destellos ni pérdida de contraste.

**Tipografía:** Literata con caracteres españoles para cabeceras/editorial y texto bíblico; Source Sans 3 con caracteres españoles para menús, botones, formularios, metadatos y comentarios. Familias autoalojadas mediante la solución del proyecto cuando sea apropiado; usar fallback serif/sans. Evitar descargar numerosas variantes. Escala de referencia: titular de portada 48–64 px desktop; H2 30–38; titulares de tarjetas 20–24; Biblia 19–21 px y line-height 1.65–1.75, ajustable por usuario; comentarios 16–17 px; interfaz 15–16 px. Adaptar fluidamente a móvil. No usar imágenes de texto bíblico.

**Superficies y componentes:** bordes finos, radios aproximados de 8–14 px, sombras muy tenues, escala de espaciado 4/8 px y blancos generosos. Contenedor general orientativo 1200 px; columna legible de Escritura 680–760 px o unas 65–75 letras/caracteres por línea; panel contextual de escritorio aproximado 300–360 px. Botones con objetivo táctil adecuado, estados de foco, hover, error y deshabilitado. No usar sombras agresivas, neón, vidrio translúcido, pergaminos de fondo o múltiples estilos de iconografía. Iconos vectoriales coherentes (p. ej. Lucide), no mezcla indiscriminada de estilos.

## 4. Ubicación y límites de las imágenes (MANDATORIO)

| Pantalla / área | Colocación permitida | Restricción clave |
|---|---|---|
| **Inicio / hero** | En la columna visual derecha del bloque de dos columnas, ~45–50% desktop | Título, descripción y CTA en la columna izquierda como HTML; en móvil priorizar contenido y situar imagen después o reducirla. |
| **Inicio / accesos** | Miniaturas selectivas en tarjetas de sección | No miniatura obligatoria por tarjeta; evitar ruido visual y duplicación. |
| **Biblia / catálogo** | Cabecera compacta o lateral; apertura de categorías o materiales editoriales | No obstaculizar selección de libro, capítulo o traducción. |
| **Biblia / capítulo** | **CERO imágenes decorativas intercaladas** en los versículos | Sin imagen de fondo de texto, sin marcas de agua, sin overlays sobre Escritura. |
| **Biblia / panel contextual** | Dentro del área complementaria, bajo el contexto y opcionalmente con pie | No desplazar permanentemente el texto principal ni romper anclaje de lectura. |
| **Debates** | Cabecera moderada; miniatura solo si el debate lo requiere | Los debates y conversaciones continúan comprensibles sin imagen; acceso privado según D06. |
| **Comunidad** | Cabecera tenue, avatares e insignias | Prioridad a personas, aportaciones y datos reales; sin grandes imágenes decorativas recurrentes. |
| **Mi espacio** | Avatar opcional, emblemas y pequeños recursos de estado | Diseño funcional; mantener privacidad y sin decoraciones que releguen historial/favoritos. |
| **Lecturas diarias** | Cabecera de presentación y posible encabezado de correo optimizado | El contenido de las lecturas y preferencias sigue siendo textual y accesible. |
| **IA / fuentes** | Imagen contextual muy discreta en introducción o documento | No confundir decoración, fuentes documentales y texto generado por IA. |
| **Administración** | Solo iconos funcionales y estados visuales | Sin ilustraciones decorativas. |

**Distribución ilustrativa, NO cuota matemática:** portada hasta ~50% del bloque; catálogo/descubrimiento hasta ~25% en áreas destacadas; contexto/debates hasta ~15%; comunidad/perfiles hasta ~10%; columna del capítulo bíblico 0%. Es orientación de *ocupación visual local*, no porcentaje que deba cumplirse página por página. Si una imagen no añade información ni valor cromático claro, omitirla.

**Reglas universales:** la imagen aporta color y atmósfera sin tapar el tema central; no incrustar títulos, botones, citas, usuarios ni contenido dinámico. Reservar encuadre y puntos focales adecuados para recortes móviles; no colocar overlays de texto esencial. Respetar proporciones, no deformar, no generar collage ni fondos de lectura. Las escenas son **interpretaciones artísticas**, no representación histórica verificada; si hay obra histórica, indicar título, artista, fecha aproximada, origen y derechos cuando correspondan.

## 5. UX por área

**Inicio:** presentación de marca y acceso inmediato a Biblia; equilibrio Biblia–comunidad aprobado (D02). La actividad privada no debe filtrarse a visitantes; para visitantes mostrar explicaciones públicas y llamadas a entrar/registrarse, no contadores ni comentarios simulados.

**Biblioteca:** información sobre edición, procedencia y derechos, búsqueda por referencia, catálogo por libros y capítulos, navegación anterior/siguiente, favoritos donde proceda, claro/oscuro y ajuste de tamaño. Marcar visualmente número de versículo sin competir con el texto.

**Panel contextual:** en escritorio lateral, en móvil panel accesible; preservar posición y selección. Etiquetas explícitas: «Texto bíblico», «Comentario de la comunidad», «Fuente documental» y «Respuesta de IA». Nunca mezclar estilos como si fueran la misma autoridad.

**Comunidad/debates:** tarjetas sobrias y conversaciones fluidas; reputación discreta, sin juegos visuales competitivos. Estados vacíos honestos. En móvil, navegación principal de cinco destinos visibles o accesibles con etiquetas; evitar esconder uno por desbordamiento horizontal.

**Administración:** tablas, filtros y mensajes operativos claros, no estética de landing.

## 5.1. Norma de lectura bíblica V17 — OBLIGATORIA Y NO OPCIONAL

**TODOS LOS VERSÍCULOS DEBEN MOSTRAR SU NÚMERO Y UN SALTO DE LÍNEA ENTRE VERSÍCULOS.**

1. **Numeración visible:** anteponer a cada versículo su número canónico según la edición y versificación seleccionadas. No omitir, ocultar ni inventar números.
2. **Cada versículo empieza en su propia línea/bloque:** cuando se rendericen versículos consecutivos, el siguiente nunca continúa en la misma línea ni en el mismo párrafo corrido del anterior. Cada versículo tiene separación mediante **salto de línea obligatorio**. Si el texto es largo, puede ajustarse dentro de su propio bloque.
3. **Jerarquía y legibilidad:** el número será visualmente discreto pero inequívocamente legible y accesible. La separación entre versículos debe conservarse en móviles, tabletas y escritorio, también al cambiar tamaño de fuente o modo claro/oscuro. Un salto de línea no implica necesariamente una línea en blanco adicional.
4. **Integridad de la Biblia:** numeración, saltos y separación son decisiones de presentación. No insertar saltos ni modificar palabras en el contenido original almacenado. Preservar identificadores y selección de versículos individuales/múltiples para enlaces y comentarios.
5. **Alcance:** aplica al lector bíblico completo y a cualquier vista que presente una secuencia de versículos como texto de lectura (por ejemplo paneles de pasaje o citas extensas); no se puede desactivar mediante preferencias de diseño. No se exige reproducir números adicionales en un simple enlace de referencia que no muestra texto.
6. **Criterio de aceptación bloqueante:** ninguna pantalla de lectura bíblica puede considerarse terminada si algún versículo visible carece de número correcto, si dos versículos consecutivos comparten un único bloque/párrafo corrido, o si la separación se pierde en móvil. Incluir verificaciones de renderizado y accesibilidad.

**Ejemplo esquemático, NO texto de una edición:** `1 [texto del primer versículo]` seguido en la línea siguiente por `2 [texto del segundo versículo]`; así sucesivamente. La numeración debe ser contenido real y accesible, no una marca puramente decorativa.

## 6. Reglas de SEO y accesibilidad aplicables al diseño

- SEO público centrado en capítulos, libros, ediciones, fuentes e información pública; los debates, comentarios y perfiles **no son indexables públicamente** según D06/D23.
- Cada página pública real: título único, descripción apropiada, H1 y jerarquía coherente, URL estable por edición/libro/capítulo, `canonical` correcto, navegación de capítulos y enlaces internos. Sin indexar textos todavía no importados.
- Generar `sitemap.xml` con URLs públicas efectivamente publicadas, `robots.txt` apropiado y metadatos Open Graph; nunca confiar en robots para proteger datos privados. El sitio técnico preapertura permanece protegido.
- Imagen de contenido: nombre descriptivo, `alt` con función informativa; `alt=""` para ilustraciones puramente decorativas. `width`/`height` o proporción para prevenir saltos; fuente optimizada AVIF/WebP donde convenga, SVG vectorial controlado. Texto no incrustado en ilustraciones. Open Graph puede renderizar tipografía controlada desde plantilla.
- Objetivo WCAG 2.2 AA: texto normal contraste al menos 4.5:1 y elementos no textuales relevantes 3:1 según contexto, foco visible, teclado, textos escalables, zonas pulsables, `prefers-reduced-motion`. El oro sobre marfil no se usa como texto pequeño.
- Medir Core Web Vitals en uso real (LCP, INP, CLS); no prometer cifras sin medición. No demorar la imagen inicial principal con lazy loading innecesario; sí aplicar carga diferida a imágenes fuera de pantalla.
- Derechos de imágenes: generación IA sujeta a condiciones del proveedor o medios reutilizados con licencia/dominio público verificado; las licencias libres pueden exigir atribución y no implican ausencia de condiciones. Conservar autor, título, URL, licencia, fecha de verificación y modificaciones si aplican.

## 7. Producción, aceptación y control de cambios

El inventario inicial y el brief por pieza están en [06-CATALOGO-RECURSOS-GRAFICOS.md](06-CATALOGO-RECURSOS-GRAFICOS.md): **20 recursos maestros**, de los cuales **6 son piezas ilustrativas**, y 14 son logotipos, SVG, estados, plantillas/composiciones. No equivale a «20 ilustraciones» ni a exigir veinte imágenes diferentes en la web. Las obras históricas seleccionadas son *contenido* catalogado aparte y pueden crecer cuando haya necesidad editorial, sin una cifra artificial.

La selección/generación puede usar IA y/o obras verificadamente reutilizables; no imponer técnicas pictóricas nuevas ni series masivas. Revisar cada recurso una vez con criterios objetivos: ubicación/recorte, legibilidad, coherencia de marca, derechos, accesibilidad, tamaño y ausencia de contenido ficticio. Corregir únicamente incumplimientos concretos. Ninguna imagen nueva es requisito para declarar implementada una funcionalidad técnica que puede operar correctamente sin ella, salvo pieza esencial de marca/publicación.

**No se generan recursos ni se modifica el código por el hecho de aprobar esta directriz.** Su aplicación se hará en las fases de implementación pertinentes, con commits trazables en este mismo repositorio.

## 8. Compatibilidad y prioridad documental

Esta directriz **complementa**, no sustituye, `01-ESPECIFICACION-FUNCIONAL.md` (D01–D25). Ante conflicto manda la seguridad, legislación, privacidad, integridad de textos y especificación funcional. Entre directrices estrictamente gráficas prevalece este documento sobre identidades Android antiguas y propuestas de debate anteriores. V01–V17 constituyen el registro vigente de decisiones visuales; no deducir una V17 ni fabricar nuevos requisitos por cuenta propia.
