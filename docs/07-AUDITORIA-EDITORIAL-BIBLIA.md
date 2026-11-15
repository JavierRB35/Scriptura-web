# Auditoría editorial de los textos bíblicos (RV1909)

Estado: **iniciada el 15-11-2026**. Alcance inicial: identificación automatizada de incidencias potenciales. **No equivale a una revisión lingüística completa ni a una certificación de ausencia de errores.**

## Fuente y restricciones

- Edición publicada: Reina-Valera 1909, fuente de dominio público eBible.org (`spaRV1909`).
- La grafía histórica no constituye por sí sola un error. Se conservan formas como «á», «fué» o «crió» cuando pertenecen a la edición.
- Conforme a `docs/01-ESPECIFICACION-FUNCIONAL.md` §5.3, **no** se modifica silenciosamente el texto publicado, ni se corrige automáticamente con IA, ni se moderniza la traducción.
- 66 libros, 1.189 capítulos, 31.102 posiciones de versículo; hay 18 posiciones vacías de esta versificación que no deben rellenarse inventando contenido.
- Norma V17: en el lector, cada versículo se presenta en un bloque `<p>` independiente con su número visible. El componente actual es `src/bible/ui/reader-client.tsx`.

## Ejecutar la auditoría de fuente

```bash
# Node 24+ y dependencias instaladas
node scripts/audit-bible.ts --output auditoria-rv1909.json

# Para revisar una copia exacta y conservada del ZIP:
node scripts/audit-bible.ts --file spaRV1909_usfm.zip --output auditoria-rv1909.json
```

El informe contiene procedencia, huella SHA-256 del ZIP, cantidades y referencias exactas con señales de: sustitución Unicode, controles, espacios anómalos, espacios antes de signos, puntuación repetida y marcadores USFM residuales. **Son candidatos a revisión, no correcciones aprobadas.** El fichero de salida puede contener textos bíblicos y no debe asumirse automáticamente correcto ni publicarse como modificación de la edición.

## Procedimiento para cada incidencia

1. Registrar libro, capítulo, versículo, texto actual y tipo de incidencia.
2. Cotejar con el archivo original de eBible y, si hay duda, con un testigo independiente de la misma edición (no con una traducción moderna).
3. Clasificar como artefacto del importador, error de transcripción verificado, variante histórica legítima o incertidumbre pendiente.
4. Solo para errores confirmados, preparar revisión de importación/versionado, nueva huella de integridad, pruebas de recuento, secuencia y contenido, y publicación trazable. Nunca sobrescribir silenciosamente la edición.
5. Revisar por separado ortografía y gramática de **textos propios de la interfaz**, que sí pueden corregirse normalmente sin alterar las Escrituras.

## Situación comprobada en GitHub

- Importador: comprueba secuencia por capítulo y cantidades canónicas.
- Lector: numera y separa los versículos en bloques individuales; también identifica los 18 vacíos documentados.
- Auditoría del ZIP completo ejecutada en CI el 15-11-2026: **0 incidencias detectadas con las reglas técnicas vigentes** (véase resultado y limitaciones a continuación). No se ha justificado modificación de los pasajes bíblicos.
- Pendiente: revisión lingüística experta de los 31.102 versículos y cotejo de posibles discrepancias concretas con testigos independientes de la misma edición. La ausencia de alertas automáticas no certifica corrección ortográfica o gramatical total.
- La inspección del código no constituye una comprobación visual del despliegue ni una ejecución de pruebas de CI.

## Ejecución real y decisión editorial — 15-11-2026

- Fuente descargada: `https://eBible.org/Scriptures/spaRV1909_usfm.zip`.
- SHA-256 del ZIP original: `56937c2be9ad278aed91370d6a15a98fe976f275d0cbaa6e26910291d949c7a5`.
- Ejecución CI: https://github.com/JavierRB35/Scriptura-web/actions/runs/43726275490
- Informe íntegro: artefacto `auditoria-editorial-rv1909` de esa ejecución (`auditoria-rv1909.json`).
- Cobertura estructural: **66 libros, 1.189 capítulos, 31.102 versículos; 18 posiciones vacías conocidas**.
- Resultado del detector: `"findings": []` (cero incidencias según sus reglas).
- Clasificación: ninguna incidencia técnica que deba corregirse. No hay casos concretos en este informe que puedan contrastarse con otra edición como errores de transcripción.
- **Decisión:** cero cambios al texto canónico o a la base de datos; no cabe justificar correcciones sin evidencia de error. Se mantienen las grafías históricas.
- Alcance limitado: el auditor identifica caracteres dañados, controles, espacios anómalos, puntuación repetida, marcadores USFM residuales y secuencia numérica; **no realiza revisión filológica, normativa ortográfica ni gramatical exhaustiva**. No atribuirle esa capacidad ni anunciar la Biblia como «impecable» basándose en este resultado.


## Incidencia corregida: numeración y separación en el lector — 15-11-2026

- **Incidencia demostrada en captura móvil:** no se veían los números de Génesis 1 y el texto parecía una sucesión de párrafos sin identificación de versículo, incumpliendo V17.
- **Causa técnica comprobada:** la consulta `src/bible/queries.ts` seleccionaba `verse_number` y `verse_key` sin alias, por lo que PostgreSQL entregaba nombres `snake_case` mientras el componente esperaba `verseNumber` y `verseKey`. El error afectaba también a los identificadores de anclaje, selección y enlaces contextuales.
- **Solución:** `src/bible/verse-query.ts` establece `AS "verseNumber"` y `AS "verseKey"`, consulta compartida por el lector y una prueba de integración. `src/bible/ui/reader-client.tsx` presenta cada versículo con su número canónico visible como control accesible, texto en párrafo propio y separación vertical. El número se conserva para los 18 versículos sin texto independientes de RV1909. Los bloques admiten selección de pasajes y enlaces existentes sin cambios de lógica de negocio.
- **Referencia de diseño Android:** `JavierRB35/Scriptura`, `BibleStore.java`, concatenaba cada versículo con `numero + "  " + texto + "\\n\\n"`. La web respeta su separación legible sin usar el contenido textual de la edición de Navarra.
- **Ortografía y mayúsculas:** la fuente de `spaRV1909` (eBible.org) tiene literalmente «EN el principio crió Dios los cielos y la tierra.» en Génesis 1:1, y utiliza grafías históricas como «fué», «vió» y «á». No son alteraciones de la importación. Mantenerlas evita publicar una adaptación silenciosa como si fuera RV1909. Toda modernización requiere crear una edición diferenciada o una revisión autorizada y trazable; **no** usar automáticamente el texto sujeto a derechos de Scriptura Android.
- **Verificación:** prueba unitaria de HTML del lector `tests/unit/reader-render.test.ts` (números visibles, bloques y grafía original) y prueba de integración `tests/integration/bible.test.ts` (alias, 31 versículos y secuencia de Génesis 1). GitHub Actions de `main` completó lint, tipos, pruebas unitarias e integración correctamente en el commit `9422a866`; Vercel notificó despliegue correcto. La inspección visual en el dispositivo del usuario sigue siendo necesaria y no se atribuye a CI.
