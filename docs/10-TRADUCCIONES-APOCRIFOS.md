# Traducciones españolas de evangelios extracanonicos

**Fecha de actualización:** 15 de noviembre de 2026.  
**Fuente de verdad:** `data/apocrypha/manifest.json` (estado por obra) y los archivos concretos en `data/apocrypha/en/` y `data/apocrypha/es/`.  
**Marco editorial:** materiales ajenos al canon bíblico de la RV1909; no se mezclan con los versículos de la Biblia ni se presentan como textos canónicos.

## Estado: 1 de 6 traducidos; 5 pendientes

| Orden | Identificador | Obra | Original inglés | Traducción española | Estado |
|---|---|---|---|---|---|
| 1 | `thomas` | Evangelio de Tomás | [en/thomas.txt](../data/apocrypha/en/thomas.txt) | [es/thomas.md](../data/apocrypha/es/thomas.md) | **114/114 dichos traducidos. Borrador completo; revisión editorial pendiente** |
| 2 | `mary` | Evangelio de María | [en/mary.txt](../data/apocrypha/en/mary.txt) | — | Pendiente |
| 3 | `peter` | Evangelio de Pedro | [en/peter.txt](../data/apocrypha/en/peter.txt) | — | Pendiente |
| 4 | `infancyjames` | Protoevangelio de Santiago | [en/infancyjames.txt](../data/apocrypha/en/infancyjames.txt) | — | Pendiente |
| 5 | `infancythomas` | Evangelio de la infancia de Tomás | [en/infancythomas.txt](../data/apocrypha/en/infancythomas.txt) | — | Pendiente |
| 6 | `judas` | Evangelio de Judas | [en/judas.txt](../data/apocrypha/en/judas.txt) | — | Pendiente |

**Secuencia vinculante de trabajo:** traducir únicamente una obra por solicitud, completar el archivo español y la documentación en `main`, verificar su numeración, comunicar cuántas quedan y **detenerse hasta que el propietario diga «adelante» o «continúa»**. No crear traducciones españolas vacías para obras pendientes.

## Evangelio de Tomás: ficha de traducción

- **Fuente documental directa:** [The Gospel of Thomas, Mark M. Mattison](https://www.gospels.net/thomas), versión inglesa publicada con declaración explícita de dominio público.
- **Archivo inglés de referencia:** `data/apocrypha/en/thomas.txt` (sin reescritura por la traducción española). Fuente inglesa basada en el texto copto de Nag Hammadi, Códice II, 2.
- **Archivo español:** `data/apocrypha/es/thomas.md` (traducción de trabajo realizada mediante IA para Scriptura a partir de la traducción inglesa; NO es una traducción directa y verificada del copto).
- **Alcance:** prólogo, dichos 1–114 inclusive, cierre y seis notas editoriales. Se traducen los títulos editoriales que acompañan cada dicho.
- **Numeración:** `## Dicho 1.` a `## Dicho 114.` en orden. La fuente **no divide estos dichos en versículos numerados**; por fidelidad textual se conserva el sistema de 114 dichos, sin inventar subdivisiones.
- **Convenciones:** corchetes `[ ]` y elipsis `[…]` señalan lagunas/reconstrucciones; paréntesis `( )` interpolaciones; barras `/ ` una corrección de copia. No se rellena ningún pasaje incompleto.
- **Tratamiento:** español actual, diálogos con comillas angulares, nombres bíblicos y términos clave sin suprimir afirmaciones controvertidas.
- **Derechos:** la traducción inglesa de partida está declarada de dominio público; la edición española derivada se prepara para Scriptura. No se copian traducciones modernas de terceros.
- **Estado de calidad:** control mecánico de numeración realizado (114 únicos, secuencia 1–114). **Pendiente de cotejo filológico humano**, especialmente dichos 7, 11, 13, 22, 30, 46, 61, 68, 83, 101, 105 y 114, y de revisión estilística final. Las afirmaciones dudosas deben atribuirse al texto, no asumirse como hechos históricos.
- **Estado de publicación:** archivado en GitHub, **no publicado como lector operativo en la web** ni importado a base de datos.

## Protocolo de control para los siguientes libros

1. Leer la edición inglesa archivada y verificar todas sus unidades numeradas, lagunas y notas.
2. Traducir íntegramente, respetando numeración **existente** (capítulos, dichos, versículos, folios o páginas). No inventar números de versículo que no consten en el original.
3. Conservar aparato editorial y bibliografía; marcar con rigor cualquier reconstrucción.
4. Mantener sin cambios el original inglés y añadir la versión española bajo `data/apocrypha/es/`.
5. Registrar origen, traductor de referencia, estado, cantidad de unidades, revisión y ruta en `data/apocrypha/manifest.json`.
6. Verificar estructuralmente la traducción, documentar el resultado y hacer commits en `main`.
7. Comunicar **número de obras pendientes** y detenerse hasta autorización expresa para la siguiente.

**Próxima obra tras autorización:** Evangelio de María. **Pendientes al cerrar Tomás: cinco.**
