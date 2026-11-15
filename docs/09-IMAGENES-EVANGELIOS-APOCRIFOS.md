# Catálogo visual de evangelios extracanonicos — Scriptura

**Incorporación:** 15 de noviembre de 2026. **Estado editorial:** asociación documental preparada; no se han habilitado páginas, ni traducciones, ni lectores públicos. Referencias de textos ingleses: [data/apocrypha/README.md](../../data/apocrypha/README.md).

## Regla de integración

Se usarán seis imágenes libres, **una por evangelio**, asociadas por el identificador persistente `gospel_id` al mismo identificador del manifiesto textual `data/apocrypha/manifest.json`.

- Archivo de origen sin alteraciones: `assets/apocrypha/originals/<gospel_id>.jpg`.
- Variante optimizada para la web: `public/images/apocrypha/<gospel_id>.webp`. No se recorta la página; se limita la resolución manteniendo proporciones.
- Metadatos completos de procedencia, crédito, licencia, descripción, texto alternativo, hashes SHA-256 y ruta: `data/apocrypha/images-manifest.json`.
- Descarga reproducible: `python scripts/import-apocrypha-images.py`; comprobación de integridad sin red: `python scripts/import-apocrypha-images.py --verify` (requiere Pillow).
- No se deberán tomar imágenes remotas en tiempo de render ni incluirlas en el lector canónico. Estas imágenes corresponden exclusivamente a las fichas de futuras obras extracanonicas.

## Asociaciones

| ID | Evangelio | Archivo web | Procedencia visual | Licencia declarada |
|---|---|---|---|---|
| `thomas` | Evangelio de Tomás | `/images/apocrypha/thomas.webp` | Folio 32 de Nag Hammadi Códice II, comienza Tomás. [Commons](https://commons.wikimedia.org/wiki/File:Nag_Hammadi_Codex_II.jpg) | Dominio público |
| `mary` | Evangelio de María | `/images/apocrypha/mary.webp` | Fragmento griego P.Oxy. 3525, **no** el papiro copto de Berlín. [Commons](https://commons.wikimedia.org/wiki/File:Gospel_of_Mary.jpg) | Dominio público |
| `judas` | Evangelio de Judas | `/images/apocrypha/judas.webp` | Página 33 del Códice Tchacos. [Commons](https://commons.wikimedia.org/wiki/File:Codex_Tchacos_p33.jpg) | Dominio público, conforme a Commons |
| `peter` | Evangelio de Pedro | `/images/apocrypha/peter.webp` | Folio del fragmento de Akhmim. [Commons](https://commons.wikimedia.org/wiki/File:Gospel_of_Peter.jpg) | Dominio público |
| `infancyjames` | Protoevangelio de Santiago | `/images/apocrypha/infancyjames.webp` | Miniatura de la Anunciación (Walters MS W.531), temática de Sant. 10:2–11:1. [Commons](https://commons.wikimedia.org/wiki/File:Trebizond_Gospels,_The_Annunciation,_Walters_Manuscript_W.531,_fol._102v.jpg) | **CC0 1.0** |
| `infancythomas` | Evangelio de la infancia de Tomás | `/images/apocrypha/infancythomas.webp` | Inicio del texto en Hagios Sabas 259, fol. 66r. [Commons](https://commons.wikimedia.org/wiki/File:Codex_Sabaiticus_259_66r_Infancy_Gospel_of_Thomas.jpg) | Dominio público |

**Precisión histórica obligatoria:** la imagen `infancyjames` es una **ilustración medieval relacionada con el relato**, no una reproducción de un manuscrito del Protoevangelio de Santiago. Jamás presentarla como testimonio paleográfico de esa obra. Las otras cinco sí reproducen manuscritos del texto asociado.

Las licencias se han contrastado en las fichas públicas de Wikimedia Commons en la fecha de incorporación. La autoría del manuscrito antiguo, la autoría de la fotografía/reproducción y la titularidad de la licencia son conceptos diferentes. Aunque el archivo sea de dominio público, mantener crédito y enlace de procedencia como buena práctica editorial. Para el recurso del Walters Art Museum se aplicará CC0.

## Reglas de diseño y accesibilidad

1. Cuando exista una futura ficha pública de cada evangelio, presentar la imagen como elemento introductorio en su cabecera editorial, **fuera del área de versículos/dichos**. La prohibición de decoración dentro de capítulos bíblicos canónicos permanece vigente.
2. Conservar proporciones, evitar cortar textos de los papiros y activar carga diferida en listados.
3. Mostrar nombre, descripción breve y procedencia junto a la imagen; proporcionar `alt_es` desde el manifiesto JSON.
4. Incluir enlace de atribución hacia Commons, diferenciando claramente manuscrito e ilustración; nunca atribuir estas imágenes al autor del evangelio o al traductor inglés.
5. No publicar ni enlazar fichas vacías mientras las traducciones españolas estén pendientes.
6. No utilizar las imágenes como argumento de autenticidad histórica, canonicidad, autoría o fecha de composición de las obras.

## Criterios de aceptación

- Seis pares de ficheros existentes (.jpg original, .webp) y seis IDs diferentes.
- Resolución válida, formato verificado, checksum SHA-256 correcto para cada archivo.
- Seis asociaciones con textos ya archivados y enlaces de fuente trazables.
- Ninguna imagen ajena de derechos dudosos, y ningún contenido fingido en la web.
- Integración futura únicamente cuando se implemente y revise cada evangelio traducido.

**Estado:** recursos listos para que el desarrollador los conecte posteriormente con las fichas de cada obra. La publicación pública no forma parte de este encargo.
