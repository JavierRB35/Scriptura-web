# ENTREGAS VISUALES APROBADAS — REGISTRO E INTEGRACIÓN

**Fecha:** 2026-11-15  
**Fuente de verdad:** `JavierRB35/Scriptura-web`, rama `main`.  
**Referencias vinculantes:** [Catálogo gráfico](../06-CATALOGO-RECURSOS-GRAFICOS.md) y [Directriz de identidad visual](../05-DIRECTRIZ-IDENTIDAD-VISUAL.md).

## Estado real

El responsable del proyecto ha **aceptado artísticamente las propuestas IMG-01 a IMG-20** en conversación, incluida la versión final elegida después de las iteraciones/rechazos de cada ID. **Se han incorporado al repositorio 20 derivados raster WebP**, uno por imagen aprobada, en `public/images/approved/IMG-01.webp` a `IMG-20.webp`. Su inventario con procedencia y limitaciones figura en [`manifest.json`](manifest.json). Estos derivados **no son automáticamente las exportaciones finales** exigidas por el catálogo; el código debe consultar el manifiesto y no enlazar rutas SVG/PNG aún inexistentes. No marcar como «integrado en UI» hasta que una vista real lo use y se compruebe su presentación.

Las piezas generadas como imágenes rasterizadas no se convierten en vectores reales simplemente cambiando su extensión a `.svg`. Deben reconstruirse como SVG donde el catálogo lo exige. La identidad aprobada en las imágenes sociales y de correo debe contrastarse con los logos maestros aprobados; no introducir versiones incompatibles de la marca. No presentar texto simulado de libros como contenido bíblico.

## Mapa de integración obligatorio

| ID | Recurso final previsto | Uso exclusivo / condición | Preparación requerida |
|---|---|---|---|
| IMG-01 | `public/brand/scriptura-logo-horizontal.svg` | Cabecera escritorio, pie y documentos | Vector real; variantes claro/oscuro; texto «Scriptura» exacto |
| IMG-02 | `public/brand/scriptura-logo-compacto.svg` | Cabecera móvil y espacios estrechos | Vector real; legibilidad a tamaños reducidos |
| IMG-03 | `public/brand/scriptura-simbolo.svg` | Favicon, icono de app, avatar institucional | Vector real 1:1; prueba a 24 px |
| IMG-04 | `public/images/editorial/scriptura-inicio-hero.webp` | Inicio, columna visual del hero; nunca fondo del texto | 2400×1350 16:9, recorte móvil 4:3 |
| IMG-05 | `public/images/editorial/scriptura-biblioteca.webp` | Introducción al catálogo de Biblia; nunca en versículos | 1600×1200 4:3 |
| IMG-06 | `public/images/editorial/scriptura-debates.webp` | Cabecera o destacado editorial de Debates | 1600×1200 4:3 |
| IMG-07 | `public/images/editorial/scriptura-comunidad.webp` | Introducción de Comunidad, no perfiles individuales | 1600×1200 4:3 |
| IMG-08 | `public/images/editorial/scriptura-fuentes.webp` | Introducción de IA y fuentes documentales | 1600×1200 4:3 |
| IMG-09 | `public/images/editorial/scriptura-lecturas-diarias.webp` | Cabecera/suscripción de lecturas diarias | 1600×1200 4:3 |
| IMG-10 | `public/images/ui/scriptura-motivo-editorial.svg` | Separadores puntuales; jamás tras versículos | Ornamento vectorial ligero |
| IMG-11 | `public/images/ui/scriptura-insignia-explorador.svg` | Reconocimiento «Explorador» en perfil | SVG 128×128, accesible |
| IMG-12 | `public/images/ui/scriptura-insignia-colaborador.svg` | Reconocimiento «Colaborador» en perfil | SVG 128×128, accesible |
| IMG-13 | `public/images/ui/scriptura-insignia-reflexivo.svg` | Reconocimiento «Reflexivo» en perfil | SVG 128×128, accesible |
| IMG-14 | `public/images/ui/scriptura-insignia-referente.svg` | Reconocimiento «Referente» en perfil | SVG 128×128, accesible |
| IMG-15 | `public/images/ui/scriptura-estado-sin-comentarios.svg` | Solo cuando realmente no haya comentarios | SVG 400×300 4:3; sin publicaciones ficticias |
| IMG-16 | `public/images/ui/scriptura-estado-sin-favoritos.svg` | Solo favoritos vacíos del usuario | SVG 400×300 4:3; no simular elementos guardados |
| IMG-17 | `public/images/ui/scriptura-estado-sin-debates.svg` | Solo debates seguidos/resultados vacíos | SVG 400×300 4:3; no simular debates |
| IMG-18 | `public/images/social/scriptura-og-general.png` | Open Graph general de páginas públicas | 1200×630; marca validada y texto determinista |
| IMG-19 | `public/images/social/scriptura-og-biblia.png` | Open Graph de Biblia/libros/capítulos públicos | 1200×630; títulos reales dinámicos, sin citas inventadas |
| IMG-20 | `public/images/email/scriptura-cabecera-correo.webp` | Cabecera opcional de correos de lecturas diarias | 1200×400; peso bajo; correo usable sin imágenes |

## Protocolo de recepción y publicación (sin validaciones redundantes)

1. Partir de **la versión visual expresamente aceptada** de cada ID, ahora disponible como raster en `public/images/approved/IMG-XX.webp`. No recuperar variantes rechazadas, no inventar diseños nuevos y conservar identificadores. **Excepción de coherencia:** IMG-01 fue aprobada como paisaje, aunque la ficha normativa IMG-01 exige un logotipo horizontal; no emplear el paisaje como sustituto del logotipo de cabecera.
2. Crear la versión maestra y exportaciones reales en los formatos y proporciones del catálogo. Para SVG, reconstruir trazados limpios, sin incrustar una captura raster como falso vector. Preparar recorte móvil solo cuando proceda.
3. Crear `docs/recursos/manifest.json` cuando se reciban los archivos. Cada entrada: `id`, `path`, `version`, `approval`, `source_type`, `generator_or_author`, `source_reference`, `rights_basis`, `license`, `attribution`, `verification_date`, `width`, `height`, `format`, `alt`, `placements`, `variants`. Usar `null` para datos desconocidos, nunca inventar licencias, fuentes o verificaciones.
4. Integrar únicamente en la pantalla real correspondiente. Comprobar que el archivo existe antes de enlazarlo. En Next.js, usar carga adaptativa para imágenes editoriales y prioridad solo para el hero visible; evitar descargas innecesarias. Proveer texto alternativo informativo o `alt=""` si puramente decorativo.
5. Verificar contraste, móvil, recortes, peso, carga con imágenes desactivadas (correo), favicon pequeño y Open Graph. No colocar ilustraciones dentro de la columna de versículos.
6. Hacer commit en `main` con archivos y manifiesto; registrar SHA y actualizar estado por ID a `integrado` solo tras comprobar la existencia real.

**Estado de entrega al 2026-11-15:** 20 conceptos aceptados y **20 archivos WebP verificados en `main`**. Pendientes SVG reales y algunas adaptaciones PNG/WebP por dimensión y proporción, integración en pantallas, comprobaciones de accesibilidad e identidad. La documentación **no** da por finalizada la implementación visual.


## Integración real de la landing — 2026-11-15

Se han cotejado el árbol de `main` y `docs/recursos/manifest.json`: **IMG-01 a IMG-20 existen físicamente en `public/images/approved/` como WebP**. No afirmar que faltan los archivos; la falta de versiones SVG de los logos u otras adaptaciones no equivale a ausencia de los originales aceptados.

**Integración directa y trazable, sin generar ni sustituir imágenes** (commit [`a035fb6`](https://github.com/JavierRB35/Scriptura-web/commit/a035fb66c86265ed0549e722d8ada7aaea2c480e)):

| Recurso aprobado | Ruta confirmada en `main` | Uso real actual |
|---|---|---|
| IMG-04 | `public/images/approved/IMG-04.webp` | Ilustración principal de la portada, columna derecha del hero |
| IMG-05 | `public/images/approved/IMG-05.webp` | Miniatura de la tarjeta de biblioteca y lectura en la portada |
| IMG-06 | `public/images/approved/IMG-06.webp` | Miniatura de la tarjeta editorial sobre debates en la portada |
| IMG-08 | `public/images/approved/IMG-08.webp` | Miniatura de la tarjeta editorial sobre fuentes en la portada |

Las imágenes se sirven con `next/image` con tamaños responsive, relación de aspecto editorial y sin texto de interfaz superpuesto. **No** implica todavía convertir/validar formatos vectoriales, contrastes u otros destinos descritos en el catálogo; `production_ready: false` en el manifiesto se conserva hasta finalizar esas adaptaciones. La IMG-01 no debe utilizarse como logotipo: su ficha de manifiesto indica una composición paisajística aunque el catálogo la denomine logotipo horizontal. No inventar sustitutos; resolver ese desfase solo a partir del diseño aprobado.
