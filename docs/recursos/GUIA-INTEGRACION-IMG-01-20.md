# ENTREGAS VISUALES APROBADAS — REGISTRO E INTEGRACIÓN

**Fecha:** 2026-11-15  
**Fuente de verdad:** `JavierRB35/Scriptura-web`, rama `main`.  
**Referencias vinculantes:** [Catálogo gráfico](../06-CATALOGO-RECURSOS-GRAFICOS.md) y [Directriz de identidad visual](../05-DIRECTRIZ-IDENTIDAD-VISUAL.md).

## Estado real

El responsable del proyecto ha **aceptado artísticamente las propuestas IMG-01 a IMG-20** en conversación, incluida la versión final elegida después de las iteraciones/rechazos de cada ID. Esta aceptación **no certifica** que los archivos gráficos originales estén incorporados al repositorio, ni que sean ya los formatos de producción. **No marcar como «implementado» ni referenciar rutas inexistentes.**

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

1. Recuperar **la versión visual expresamente aceptada** de cada ID, no una iteración rechazada. Mantener el identificador estable. Si no se dispone de sus bytes, solicitar la exportación del original; **no recrear arbitrariamente una imagen distinta ni declararla entregada**.
2. Crear la versión maestra y exportaciones reales en los formatos y proporciones del catálogo. Para SVG, reconstruir trazados limpios, sin incrustar una captura raster como falso vector. Preparar recorte móvil solo cuando proceda.
3. Crear `docs/recursos/manifest.json` cuando se reciban los archivos. Cada entrada: `id`, `path`, `version`, `approval`, `source_type`, `generator_or_author`, `source_reference`, `rights_basis`, `license`, `attribution`, `verification_date`, `width`, `height`, `format`, `alt`, `placements`, `variants`. Usar `null` para datos desconocidos, nunca inventar licencias, fuentes o verificaciones.
4. Integrar únicamente en la pantalla real correspondiente. Comprobar que el archivo existe antes de enlazarlo. En Next.js, usar carga adaptativa para imágenes editoriales y prioridad solo para el hero visible; evitar descargas innecesarias. Proveer texto alternativo informativo o `alt=""` si puramente decorativo.
5. Verificar contraste, móvil, recortes, peso, carga con imágenes desactivadas (correo), favicon pequeño y Open Graph. No colocar ilustraciones dentro de la columna de versículos.
6. Hacer commit en `main` con archivos y manifiesto; registrar SHA y actualizar estado por ID a `integrado` solo tras comprobar la existencia real.

**Estado de entrega al 2026-11-15:** 20 conceptos aceptados; preparación y carga de binarios finales **pendientes de verificar**. Este documento es una instrucción de integración, no un certificado de publicación de imágenes.
