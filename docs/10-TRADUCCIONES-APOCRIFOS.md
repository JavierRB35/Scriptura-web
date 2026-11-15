# Archivo editorial — seis evangelios extracanonicos traducidos al español

**Última actualización:** 15 de noviembre de 2026. **Estado:** **6 de 6 traducciones españolas completas como borrador de trabajo; 0 pendientes de traducir**. **6 pendientes de revisión editorial/filológica independiente**. Están disponibles en la **Biblioteca web** `/biblioteca` como borradores provisionales, sin importarse a la base de datos ni al lector bíblico canónico. **Fuente de verdad:** GitHub `main` y `data/apocrypha/manifest.json`.

## Inventario cerrado (6/6)

| Orden | ID | Obra | Fuente de referencia | Traducción completa | Numeración preservada |
|---|---|---|---|---|---|
| 1 | `thomas` | Evangelio de Tomás | [en/thomas.txt](../data/apocrypha/en/thomas.txt) | [es/thomas.md](../data/apocrypha/es/thomas.md) | 114 dichos |
| 2 | `mary` | Evangelio de María | [en/mary.txt](../data/apocrypha/en/mary.txt) | [es/mary.md](../data/apocrypha/es/mary.md) | Páginas conservadas 7–10 y 15–19 |
| 3 | `peter` | Evangelio de Pedro | [en/peter.txt](../data/apocrypha/en/peter.txt) | [es/peter.md](../data/apocrypha/es/peter.md) | 60 unidades (1)–(60) |
| 4 | `infancyjames` | Protoevangelio de Santiago | [en/infancyjames.txt](../data/apocrypha/en/infancyjames.txt) | [es/infancyjames.md](../data/apocrypha/es/infancyjames.md) | 25 capítulos y párrafos; variante breve 18–21 del Papiro Bodmer V |
| 5 | `infancythomas` | Evangelio de la infancia de Tomás | [en/infancythomas.txt](../data/apocrypha/en/infancythomas.txt) | [es/infancythomas.md](../data/apocrypha/es/infancythomas.md) | 19 capítulos y párrafos |
| 6 | `judas` | Evangelio de Judas | [en/judas.txt](../data/apocrypha/en/judas.txt) | [es/judas.md](../data/apocrypha/es/judas.md) | Páginas conservadas 33–58 |

## Procedencia y derechos

Las versiones de trabajo se han traducido al español **desde las traducciones inglesas de Mark M. Mattison**, cuya autorización de dominio público figura expresamente en cada página del sitio [Gospels.net](https://www.gospels.net/). **No son traducciones directas del copto o del griego y no han sido cotejadas de forma independiente por un especialista**. Los originales ingleses permanecen archivados sin ser modificados y sus hashes SHA-256 se conservan en el manifiesto. Cada fichero español se identifica con SHA de objeto Git.

Se reproducen los pasajes y notas de la edición inglesa disponible, sin recurrir a traducciones españolas de terceros. Los nombres, referencias académicas, reconstrucciones editoriales y lagunas quedan documentados dentro de cada fichero. La atribución a Mattison debe conservarse en futuras ediciones por rigor bibliográfico, aunque sus traducciones se hayan publicado en dominio público.

## Reglas de fidelidad adoptadas

- **Numeración real, no inventada:** Tomás tiene 114 dichos; Pedro, 60 unidades numeradas; Santiago y la infancia de Tomás presentan capítulos con párrafos numerados. María y Judas conservan páginas del manuscrito, no versículos. No se interpolan versículos artificiales.
- **Lagunas explícitas:** en María faltan las páginas 1–6 y 11–14. En Judas hay numerosas zonas fragmentarias. Se muestran `[ ]` y `[…]` en los pasajes incompletos sin completarlos con texto nuevo.
- **Testimonios alternativos:** el Protoevangelio de Santiago contiene el texto extenso de 25 capítulos y, separado y sin armonizar, el texto corto alternativo de 18–21 del Papiro Bodmer V. El Evangelio de la infancia de Tomás marca que los capítulos 17–18 proceden de manuscritos posteriores al Hagios Sabas 259 y que el episodio del capítulo 10 ocupa otra posición en este último.
- **Títulos y notas:** los títulos son editoriales, y las notas sobre traducción, reconstrucción, variantes y bibliografía se conservan por separado del cuerpo narrativo.
- **Honestidad histórica:** la relación entre una obra y su manuscrito no implica autenticidad, autoría apostólica ni canonicidad. Todos estos documentos son **extracanónicos**, ajenos al catálogo bíblico RV1909.

## Controles estructurales reproducibles

```bash
python3 scripts/verify-apocrypha-translations.py
```

La CI `.github/workflows/ci.yml` ejecuta este control en cada push a `main`. El validador comprueba:

1. Presencia de los seis originales ingleses y la declaración de dominio público; coincidencia de sus hashes SHA-256 con el manifiesto.
2. Presencia de las seis traducciones completas, hashes de objetos Git y tamaño no sospechosamente reducido.
3. Correspondencia exacta de los 114 dichos de Tomás, las 60 unidades de Pedro, los capítulos y todos los números de apartado de Santiago (incluido el apéndice) y de la infancia de Tomás.
4. Paginación completa y ordenada de María (7–10 y 15–19) y Judas (33–58), con avisos de páginas ausentes donde corresponde.
5. Número de notas editoriales por obra, referencias a lagunas y a variantes, y separación de las traducciones respecto del lector público.
6. Registro coherente de **6 borradores traducidos, 0 pendientes**.

**Límite de la validación:** esto confirma integridad documental y estructura, pero **no certifica una traducción filológica perfecta**. Para una publicación pública de calidad deben hacerse revisiones de estilo, análisis de expresiones ambiguas y cotejo por especialistas de las versiones en copto/griego, empezando por los pasajes señalados en las notas.

## Cierre de la orden de traducción

La instrucción anterior de «detenerse hasta recibir “adelante” o “continúa”» queda **revocada** por decisión expresa del propietario (15-11-2026). Los cinco textos pendientes se tradujeron consecutivamente sin solicitar autorizaciones intermedias. **No quedan evangelios del catálogo inicial por traducir.**

## Próximo hito, distinto de traducir

Revisión lingüística y textual profesional de los seis borradores y, posteriormente, decisión de publicación editorial de las versiones españolas como una biblioteca claramente diferenciada de la Biblia canónica. Por nueva instrucción del propietario se permite la **lectura en `/biblioteca` como borrador provisional**, con advertencias editoriales visibles y sin indexación de buscadores. No equivale a una edición crítica aprobada; el estado de revisión sigue pendiente. Véase [Biblioteca web](11-BIBLIOTECA-WEB.md).
