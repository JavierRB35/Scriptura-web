# CATÁLOGO DE RECURSOS GRÁFICOS — BRIEF PARA DISEÑADOR Y GENERACIÓN CON IA

**Estado:** brief de producción derivado de V01–V16 (aprobado en cuanto a ubicación, formato y función) · **Fecha:** 2026-11-15. **No implica que los recursos ya existan.**
**Obligatorio leer antes:** [05-DIRECTRIZ-IDENTIDAD-VISUAL.md](05-DIRECTRIZ-IDENTIDAD-VISUAL.md), [01-ESPECIFICACION-FUNCIONAL.md](01-ESPECIFICACION-FUNCIONAL.md).
**Fuente de verdad y destino de recursos aprobados:** `JavierRB35/Scriptura-web`, rama `main`.

## 1. Brief maestro para el diseñador (COPIABLE)

> Diseña y/o selecciona los recursos visuales de **Scriptura**, plataforma digital interconfesional para leer la Biblia, comprender textos y compartir reflexiones. Su identidad es **editorial contemporánea, sobria, cálida, elegante y accesible**. Color principal verde profundo `#1F5C45`, marfil `#FAF7F2`, texto `#26241F`, detalles oro envejecido `#B58647` y azul noche `#0D2338`; complementarios suaves y naturales permitidos. Tipografía del sitio: **Literata** (lectura y titulares editoriales) y **Source Sans 3** (interfaz). El logotipo parte de un **libro abierto abstracto**. Las imágenes aportarán color y atmósfera, pero **no cubrirán texto, botones, referencias, usuarios ni información funcional**. Portada de dos columnas: ~50–55% contenido y ~45–50% imagen en escritorio. En móviles, el texto y las acciones tendrán prioridad. No ilustrar el interior del lector bíblico: la columna de los versículos debe ser exclusivamente tipográfica. Preferir composición ordenada, foco claro y luz natural; admitir ilustraciones pictóricas originales, imágenes generadas con IA y obras/recursos de terceros con derechos comprobados. Las escenas pueden ser figurativas y prudentes o simbólicas según el contexto, y nunca se presentarán como reconstrucción histórica probada. Evitar estética de fantasía épica, pergaminos como fondo de lectura, textos ilegibles inventados, símbolos doctrinales empleados como marca universal, efectos visuales invasivos y material sin permiso. Producir **una pieza por ID**, revisable de forma independiente, y exportarla en el formato indicado. No añadir texto escrito en las ilustraciones; los textos se añaden en web con HTML. El diseñador entregará archivos editables cuando aplique, exportaciones optimizadas y metadatos de autoría/licencia. Un recurso puede omitirse en una pantalla si no aporta valor. Validar recorte móvil, peso, legibilidad y derechos.

**Límite explícito:** el usuario NO ha seleccionado una técnica como óleo, acuarela o fresco obligatoria. La IA es un medio posible, no una exigencia; no iniciar un debate adicional sobre estilos pictóricos. El criterio esencial es integración funcional y color.

## 2. Inventario maestro: 20 recursos propuestos

**Convención:** medidas en píxeles indican **lienzo maestro recomendado**, no las dimensiones que el navegador deba descargar. **SVG** es vectorial con `viewBox`. Archivos generados con IA: conservar fuente editable/maestro y exportar derivados WebP (AVIF opcional según compatibilidad y pipeline). Para escala móvil, usar recortes derivados del mismo recurso y revisar que el sujeto no quede cortado. Para logos y medallones, vector real y monocromo verificable.

| ID | Nombre / nombre de archivo sugerido | Lugar exacto | Formato maestro y proporción | Tema / función |
|---|---|---|---|---|
| IMG-01 | `scriptura-logo-horizontal.svg` | Cabecera de escritorio, pie, cabeceras de documentos | SVG, relación flexible ~4:1 | Libro abstracto + «Scriptura», accesible en claro/oscuro |
| IMG-02 | `scriptura-logo-compacto.svg` | Móvil, correo, espacios estrechos | SVG, ~2:1 | Mismo símbolo con denominación compacta |
| IMG-03 | `scriptura-simbolo.svg` | Favicon, icono de app, avatar institucional | SVG, 1:1, `viewBox` cuadrado | Solo libro abierto abstracto reconocible a 24 px |
| IMG-04 | `scriptura-inicio-hero.webp` | **Inicio**, columna de imagen del primer bloque | Maestro 2400×1350, 16:9; variante 4:3 por recorte | Bienvenida, camino hacia conocimiento y contemplación |
| IMG-05 | `scriptura-biblioteca.webp` | **Biblia**, cabecera lateral o tarjeta de introducción al catálogo, no en versículos | 1600×1200, 4:3 | Libro y estudio, biblioteca/escritura verosímil |
| IMG-06 | `scriptura-debates.webp` | **Debates**, cabecera o tarjeta editorial destacada | 1600×1200, 4:3 | Diálogo respetuoso alrededor de ideas y textos |
| IMG-07 | `scriptura-comunidad.webp` | **Comunidad**, cabecera introductoria, no repetida en cada perfil | 1600×1200, 4:3 | Diversidad de lectores, pertenencia y escucha |
| IMG-08 | `scriptura-fuentes.webp` | **IA y fuentes**, introducción documental o apoyo contextual | 1600×1200, 4:3 | Biblioteca, investigación, procedencia verificable |
| IMG-09 | `scriptura-lecturas-diarias.webp` | **Lecturas diarias**, cabecera de la página de suscripción | 1600×1200, 4:3 | Hábito lector tranquilo y luz de día |
| IMG-10 | `scriptura-motivo-editorial.svg` | Separadores puntuales y portada, nunca detrás de versículos | SVG tileable o trazo escalable | Geometría editorial sutil inspirada en páginas/caminos |
| IMG-11 | `scriptura-insignia-explorador.svg` | Reconocimientos en perfil, tarjetas compactas | SVG, 1:1, `viewBox` 128×128 | Exploración, aprendizaje, brújula |
| IMG-12 | `scriptura-insignia-colaborador.svg` | Igual | SVG, 1:1, `viewBox` 128×128 | Aporte, pluma o intercambio |
| IMG-13 | `scriptura-insignia-reflexivo.svg` | Igual | SVG, 1:1, `viewBox` 128×128 | Lectura atenta, libro, hoja |
| IMG-14 | `scriptura-insignia-referente.svg` | Igual | SVG, 1:1, `viewBox` 128×128 | Orientación positiva, luz abstracta |
| IMG-15 | `scriptura-estado-sin-comentarios.svg` | Estado vacío real de comentarios de comunidad registrada | SVG, ~4:3; `viewBox` 400×300 | Diálogo aún por comenzar, sin falsificar publicaciones |
| IMG-16 | `scriptura-estado-sin-favoritos.svg` | Favoritos vacíos en Mi espacio | SVG, ~4:3; `viewBox` 400×300 | Libro/marcador con representación amable |
| IMG-17 | `scriptura-estado-sin-debates.svg` | Debates seguidos vacíos / resultados de participación permitidos | SVG, ~4:3; `viewBox` 400×300 | Conversación o tarjeta editorial sin contenido ficticio |
| IMG-18 | `scriptura-og-general.png` | Open Graph genérico de páginas públicas | 1200×630, ~1.91:1, PNG o JPEG | Composición de marca con patrón/IMG-04, sin textos generados por IA |
| IMG-19 | `scriptura-og-biblia.png` | Open Graph de Biblia, libros y capítulos públicos | 1200×630, ~1.91:1, PNG o JPEG | Composición con símbolo y motivo de biblioteca; títulos dinámicos mediante plantilla |
| IMG-20 | `scriptura-cabecera-correo.webp` | Lecturas diarias por email, cabecera decorativa opcional | 1200×400, 3:1, exportación ligera para email | Identidad Scriptura calmada; correo sigue útil con imágenes bloqueadas |

**Suma:** 3 logotipos + 6 ilustraciones de sección (IMG-04 a IMG-09) + 1 motivo + 4 insignias + 3 estados vacíos + 2 recursos sociales + 1 cabecera de correo = **20 recursos maestros**. **Solo 6 requieren ilustración pictórica original**; los otros 14 son principalmente vectores o composiciones de marca. La reutilización con permisos adecuados es válida; no hacer imágenes nuevas sin motivo.

## 3. Prompts particulares por imagen ilustrativa (IMG-04 a IMG-09)

**Instrucción común:** aplicar **solo** el brief maestro y la ficha del ID activo; no arrastrar escenas/personajes/objetos de otros IDs. Una sola ilustración por pieza, sin collage, texto, interfaz o marcas de agua. Reservar recorte razonable en los bordes; foco legible a resolución de tarjeta. El diseñador puede optar por IA o una obra de terceros adecuada con licencia validada, adaptando la selección al propósito.

### IMG-04 — Portada: «El camino de la lectura»

**Prompt:** «Crea una imagen principal editorial para el inicio de Scriptura. Tema: apertura al conocimiento, reflexión, acogida y descubrimiento. Composición panorámica, paisaje mediterráneo evocador con sendero o elementos arquitectónicos discretos, luz natural cálida y profundidad atmosférica; también es válida una composición figurativa muy moderada si resulta más eficaz. Emplea colores armonizados con marfil y verde profundo, variedad cromática natural y foco visual claro. Destino: columna derecha de un hero a dos columnas, ocupando alrededor del 45–50% de ese bloque. **No superpongas títulos ni botones; no requieras texto sobre la imagen.** Conservar motivo principal en zona central para recortes 16:9 → 4:3; sin personajes doctrinalmente identificables ni escenas bíblicas presentadas como hechos históricos.»

**Entrega:** maestro 2400×1350 (16:9), WebP optimizado, posible recorte 4:3 validado. **No usar como fondo de página**.

### IMG-05 — Biblioteca: «La palabra y el estudio»

**Prompt:** «Diseña un apoyo visual editorial para la entrada a la biblioteca bíblica: libro abierto, escritura como objeto material, mesa de estudio o espacio de biblioteca, luz agradable y sentido de profundidad. Composición contenida, legible en tarjeta o cabecera lateral, con colores cálidos y verde discreto. Evita texto de páginas legible o pseudoescritura generada artificialmente. Esta imagen solo introduce el catálogo; no aparece nunca intercalada en capítulos o versículos.»

**Entrega:** 1600×1200 (4:3), WebP, foco central y recorte 1:1 opcional.

### IMG-06 — Debates: «Diálogo y escucha»

**Prompt:** «Ilustración contextual para la sección de debates bíblicos: encuentro respetuoso entre ideas y perspectivas, personas estilizadas conversando o metáfora visual de diálogo alrededor de textos; ambiente tranquilo y acogedor. Sin confrontación teatral, jerarquías religiosas, símbolos de una única confesión ni mensajes escritos. Dejar despejada la zona próxima al título de la tarjeta, que se compondrá fuera de la imagen. La participación real será presentada por la interfaz, nunca inventada dentro de la ilustración.»

**Entrega:** 1600×1200 (4:3), WebP; mostrar únicamente en cabecera o destacado editorial.

### IMG-07 — Comunidad: «Compartir la lectura»

**Prompt:** «Imagen introductoria para comunidad interconfesional: personas diversas con actitud de escucha, una reunión abierta o una metáfora visual de colaboración y descubrimiento compartido. Composición equilibrada, luminosa, cálida y discreta. No retratar usuarios reales, no inventar avatares identificables, estadísticas, nombres, likes ni reseñas. Debe aportar color sin desplazar los contenidos reales de la comunidad.»

**Entrega:** 1600×1200 (4:3), WebP, uso puntual en introducción, no como plantilla de cada perfil.

### IMG-08 — Fuentes e IA: «Investigar con fundamento»

**Prompt:** «Recurso editorial para explicar una asistencia fundamentada en fuentes: biblioteca ordenada, archivo documental, volúmenes o documentos organizados, luz cálida y sensación de conocimiento contrastable. Si se utilizan personas, que sean figurativas prudentes y secundarias. Evitar robots, cerebros luminosos, redes neuronales recargadas, pseudo-citas o apariencia de que la IA es una autoridad religiosa. Debe quedar visualmente clara la separación entre fuentes humanas documentadas y la interfaz de asistencia.»

**Entrega:** 1600×1200 (4:3), WebP; solo pantalla introductoria o ficha documental.

### IMG-09 — Lecturas diarias: «Un momento de lectura»

**Prompt:** «Ilustración tranquila para presentar la suscripción a lecturas diarias: libro, luz de mañana o una escena cotidiana serena junto a una ventana o paisaje. Transmitir hábito de lectura, accesibilidad y contemplación, sin introducir una liturgia inventada ni símbolos que sugieran que Scriptura institucionalmente excluye otras confesiones. Sin texto, sin fechas, sin referencias bíblicas falsas, sin botones. Adecuada para una cabecera o tarjeta horizontal derivada.»

**Entrega:** 1600×1200 (4:3), WebP, con recorte más horizontal si se precisa.

## 4. Prompts compactos para recursos vectoriales y composiciones (IMG-01–03, 10–20)

**IMG-01 / 02 / 03 — Identidad:** «Diseña un logotipo vectorial original inspirado en un libro abierto abstracto, trazos equilibrados y legible a pequeño tamaño. Entrega variante horizontal, compacta y símbolo aislado, coherentes entre sí; versiones para fondos claros y oscuros y monocroma. Nombre de marca EXACTO: Scriptura. No cruz como emblema institucional principal; no utilizar raster ampliado como SVG falso. Exportar SVG optimizados y versiones de favicon según necesidad técnica.»

**IMG-10 — Motivo editorial:** «Crea un único ornamento SVG geométrico muy sutil inspirado en páginas, márgenes o líneas de caminos. Debe decorar separadores y titulares sin parecer pergamino, poder reducirse a monocromo y nunca aplicarse tras el cuerpo bíblico.»

**IMG-11 / 12 / 13 / 14 — Medallones:** «Crea una familia de cuatro medallones SVG sobrios, con idéntico grosor de trazo, proporciones y geometría: Explorador (exploración), Colaborador (contribución), Reflexivo (lectura atenta), Referente (orientación comunitaria). Reconocimientos por participación, jamás santidad, autoridad doctrinal o victoria competitiva. Diferenciables sin depender exclusivamente del color; versiones pequeñas con tooltip/texto accesible aportado por la interfaz.»

**IMG-15 / 16 / 17 — Estados vacíos:** «Tres ilustraciones vectoriales simples y consistentes: sin comentarios, sin favoritos y sin debates seguidos. Deben expresar un estado auténtico y un camino para iniciar actividad, sin personas, publicaciones ni cifras simuladas. Optimizar como SVG ligero, ocultable para lectores de pantalla si son decorativas.»

**IMG-18 — Imagen social genérica:** «Compón plantilla Open Graph de 1200×630 con símbolo Scriptura, colores de marca y recurso visual reutilizable. La información textual debe ser exacta y colocada con sistema tipográfico controlado; preferir texto dinámico renderizado por plantilla web, no por generación de IA. Asegurar zona segura para recortes de redes sociales.»

**IMG-19 — Imagen social Biblia:** «Prepara variante Open Graph 1200×630 para páginas públicas de ediciones/libros/capítulos. Usar motivo bibliográfico sutil, color de marca y área definida para títulos y edición obtenidos del contenido real. No insertar versículos generados o falsos; la tipografía será compuesta de manera determinista.»

**IMG-20 — Cabecera de correo:** «Diseña cabecera panorámica 1200×400 ligera para emails de lecturas diarias, con marca y motivo sereno derivado de recursos existentes. El email seguirá siendo plenamente comprensible sin cargar imágenes, y tendrá textos alternativos y enlaces reales añadidos en HTML.»

## 5. Colección de arte histórico (NO incluida en los 20)

Las reproducciones de obras históricas seleccionadas (V15) constituyen **contenido documental independiente**, no una familia de recursos de identidad ni seis ilustraciones adicionales obligatorias. Solo integrar una obra cuando exista contexto editorial pertinente y una ficha documentada: autor/artista, título, fecha, institución o fuente, URL de reproducción, licencia/dominio público y condiciones de atribución, fecha de verificación, descripción accesible y vínculo con pasaje o tema. No reutilizar automáticamente las 62 obras inventariadas en la app Android sin verificar los archivos y sus derechos actuales. Las ilustraciones pueden ser históricas o simbólicas; deben distinguirse del texto original y evitar atribuciones inexactas.

## 6. Entrega, ubicación de archivos y metadatos

**Propuesta de rutas de implementación** (crear solo cuando existan los recursos aprobados): `public/brand/` (IMG-01–03), `public/images/editorial/` (IMG-04–09), `public/images/ui/` (IMG-10–17), `public/images/social/` (IMG-18–19), `public/images/email/` (IMG-20). Los documentos de procedencia pueden almacenarse en `docs/recursos/` o el catálogo de medios previsto por el proyecto; sin exposición de datos privados. Todos los cambios versionados con commits a `main`.

Cada ficha de entrega debe registrar `id`, nombre/archivo, dimensiones, formato, autor o herramienta, procedencia, titular de derechos, licencia o base de uso, atribución requerida, URL origen, fecha de verificación, descripción `alt` (si informativa), uso/ubicación, variantes, estado (propuesto/aprobado/descartado). Para generación IA, guardar también las condiciones aplicables del proveedor y si necesita transparencia específica según el contexto normativo.

**Criterios de aceptación mínimos:** (1) utilidad en la ubicación indicada; (2) no oculta ni degrada texto, CTA ni capítulo bíblico; (3) buena presentación en móvil y escritorio; (4) derechos/atribución verificables; (5) recursos ligeros, proporciones y texto alternativo correctos; (6) ningún dato, cifra o cita inventados; (7) coherencia con paleta y tipografía; (8) no atribuir certeza histórica a escenas recreadas. Revisión única salvo defectos concretos. No exigir aprobaciones repetitivas ni generar imágenes no necesarias.

**Alcance de esta entrega documental:** catálogo y prompts, NO imágenes ya creadas ni piezas implementadas en la interfaz.
