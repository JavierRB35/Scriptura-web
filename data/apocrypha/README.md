# Archivo documental de evangelios extracanonicos — Scriptura

**Estado:** **6/6 traducciones españolas completas como borradores**; conservados los 6 originales ingleses de dominio público; **0 obras pendientes de traducir**. Las seis traducciones españolas requieren **revisión editorial y filológica independiente** antes de una eventual publicación. No están incorporadas a la base de datos ni al lector web público. Se encuentran separadas de la Biblia canónica Reina-Valera 1909.

## Textos archivados y traducciones

| Obra | Original de referencia inglés | Traducción española de trabajo | División original |
|---|---|---|---|
| Evangelio de Tomás | [en/thomas.txt](en/thomas.txt) | [es/thomas.md](es/thomas.md) | 114 dichos |
| Evangelio de María | [en/mary.txt](en/mary.txt) | [es/mary.md](es/mary.md) | Páginas 7–10 y 15–19 (lagunas 1–6 y 11–14) |
| Evangelio de Pedro | [en/peter.txt](en/peter.txt) | [es/peter.md](es/peter.md) | 60 unidades numeradas |
| Protoevangelio de Santiago | [en/infancyjames.txt](en/infancyjames.txt) | [es/infancyjames.md](es/infancyjames.md) | 25 capítulos y variante breve 18–21 |
| Evangelio de la infancia de Tomás | [en/infancythomas.txt](en/infancythomas.txt) | [es/infancythomas.md](es/infancythomas.md) | 19 capítulos; 17–18 de testigos tardíos |
| Evangelio de Judas | [en/judas.txt](en/judas.txt) | [es/judas.md](es/judas.md) | Páginas 33–58 |

## Fuente y derechos

Traducciones inglesas del investigador y traductor **Mark M. Mattison** publicadas en [Gospels.net](https://www.gospels.net/). El sitio y cada edición declaran explícitamente que las traducciones se han entregado al **dominio público** y pueden copiarse, modificarse y utilizarse libremente.

- https://www.gospels.net/thomas
- https://www.gospels.net/mary
- https://www.gospels.net/peter
- https://www.gospels.net/infancyjames
- https://www.gospels.net/infancythomas
- https://www.gospels.net/judas

La declaración de Mattison **no cubre automáticamente otras traducciones, imágenes ni estudios académicos de terceros**. La fuente declarada de cada texto inglés es copta o griega, según la edición. Las versiones españolas de Scriptura son traducciones **del inglés**, no del manuscrito original.

## Trazabilidad de la colección

- [manifest.json](manifest.json): fuente, licencia, idioma, traductor, fecha inicial del archivo inglés, hash SHA-256 del texto original y referencia SHA de cada traducción española.
- [scripts/import-apocrypha.py](../../scripts/import-apocrypha.py): extracción reproducible de los originales ingleses y comprobación de integridad. Su ejecución **no es una orden de reemplazar traducciones españolas**.
- [scripts/verify-apocrypha-translations.py](../../scripts/verify-apocrypha-translations.py): verificación estructural de las seis traducciones y correspondencia con sus originales; incluida en CI.
- [docs/10-TRADUCCIONES-APOCRIFOS.md](../../docs/10-TRADUCCIONES-APOCRIFOS.md): registro de la tarea cerrada, convenciones de numeración, variantes y criterios para publicación posterior.
- [docs/09-IMAGENES-EVANGELIOS-APOCRIFOS.md](../../docs/09-IMAGENES-EVANGELIOS-APOCRIFOS.md): asociación de recursos visuales y sus fichas de procedencia, cuya disponibilidad efectiva deberá verificarse antes de integrarlos.

**No inventar numeración de versículos:** conservar dichos, capítulos/apartados, unidades numeradas o páginas del manuscrito según la obra. Las lagunas y variantes son parte esencial del texto histórico y deben seguir visibles.

**Publicación diferida:** hasta completar la revisión editorial no crear fichas web que simulen un libro publicado, ni mezclar pasajes apócrifos con los 66 libros de la Biblia RV1909.
