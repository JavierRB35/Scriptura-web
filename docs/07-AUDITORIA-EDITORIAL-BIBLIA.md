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
- Pendiente: ejecutar el auditor sobre el ZIP completo, analizar incidencias concretas y contrastar la edición con fuentes originales antes de efectuar cualquier corrección del texto bíblico.
- La inspección del código no constituye una comprobación visual del despliegue ni una ejecución de pruebas de CI.
