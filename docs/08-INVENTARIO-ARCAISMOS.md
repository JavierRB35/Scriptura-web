# Arcaísmos en la Reina-Valera 1909 — Inventario de trabajo

**Fecha:** 15-11-2026. **Estado:** búsqueda terminológica inicial, no revisión integral certificada.
**Fuente:** 31.102 versículos importados de eBible `spaRV1909`, consulta sobre `bible_verses.text_content` de ScripturaWeb.

## Principios editoriales

El original RV1909, sus referencias y sus huellas de integridad no se modifican. Las adaptaciones aparecen únicamente en la **capa de lectura** y deben identificarse como tales; no son una nueva traducción. Un equivalente orientativo no autoriza sustituir palabras en toda la Biblia. Se requiere cotejo por versículo en vocablos polisémicos, tiempos verbales y fórmulas religiosas. Ninguna modernización debe añadir hechos o alterar doctrinas.

## Resultados medidos

Recuento por **versículos que contienen cada expresión exacta** (insensible a mayúsculas, con límites de palabra); no número total de apariciones dentro de esos versículos. Una misma referencia puede contener varios candidatos.

| Forma en el texto | Versículos | Alternativa contemporánea, sujeta a contexto |
|---|---:|---|
| mas | 2.544 | pero — sigue siendo correcta, registro literario |
| he aquí | 1.145 | mira, aquí está, te anuncio — fórmula bíblica de distintos valores |
| empero | 402 | sin embargo, pero |
| cualquiera | 228 | cualquier persona, quienquiera — no es arcaísmo siempre |
| fuere | 203 | sea, fuese, será — futuro de subjuntivo, riesgo gramatical |
| hubiere | 179 | haya, hubiera — futuro de subjuntivo, riesgo gramatical |
| díjole | 176 | le dijo |
| díjoles | 103 | les dijo |
| díjome | 80 | me dijo |
| en derredor | 71 | alrededor |
| mancebos | 58 | jóvenes (comprobar matiz) |
| menester | 51 | necesidad, falta, necesario, según construcción |
| mancebo | 24 | joven, a veces servidor |
| aquesta | 22 | esta |
| aqueste | 18 | este |
| respondióle | 18 | le respondió |
| echóse | 18 | se echó |
| vianda | 16 | comida, alimento; a veces alimento sólido |
| viandas | 14 | comidas, alimentos |
| quedóse | 13 | se quedó |
| hacimiento de gracias | 12 | acción de gracias, agradecimiento |
| aposento | 10 | estancia, habitación, dependencia |
| aquestas | 7 | estas |
| llamóle | 5 | le llamó |
| aquestos | 4 | estos |
| allegóse | 3 | se acercó, se adhirió, según contexto |

No se han detectado apariciones exactas de «agora» ni de «allende» en el corpus publicado. No inventar incidencias.

## Muestras reales para revisión

- 1 Corintios 1:16: «mas no sé si he bautizado algún otro» — *mas* es correcto, pero hoy literario.
- 1 Corintios 1:24: «Empero á los llamados…» — requiere revisar el valor adversativo.
- 1 Crónicas 21:11: «Y viniendo Gad á David, díjole…» — el pronombre enclítico hoy se antepone: *le dijo*.
- 1 Juan 2:13: «Os escribo á vosotros, mancebos…» — posible *jóvenes*.
- 1 Crónicas 28:7: «como aqueste día» — posible *este día*.
- 1 Timoteo 4:3: «con hacimiento de gracias» — posible *con acción de gracias*.
- 1 Corintios 3:2: «Os dí á beber leche, y no vianda» — contexto de alimento sólido; una sustitución genérica por *comida* puede perder matiz.
- 1 Crónicas 22:9: «enemigos en derredor» — locución hoy poco frecuente.

## Primer caso semántico resuelto: «crió»

**25 versículos cotejados:** el verbo histórico *criar* significa unas veces **crear** y otras **criar / producir**.

**18 referencias de creación → «creó»:** `1Tm 4:3-4`, `Col 3:10`, `Dt 4:32; 32:18`, `Ef 3:9`, `Gn 1:1,21,27; 5:1-2`, `Hb 3:4`, `Is 40:26,28; 41:20; 45:18`, `Jb 26:13`, `Mc 13:19`.

**7 referencias de crianza/producción → «crio»:** `1S 1:23`, `1Tm 5:10`, `Ex 16:20`, `Ez 19:2`, `Hch 7:21`, `Is 49:21; 51:18`. Algunos giros (p. ej. «crio gusanos») requieren todavía una revisión estilística posterior.

La fuente de Génesis 1:1 sigue diciendo «EN el principio crió Dios los cielos y la tierra.»; la lectura muestra «En el principio creó Dios los cielos y la tierra.». No sustituir «en el principio» por «en un principio»: no son equivalentes exactos.

**Aplicación verificable:** `src/bible/lexical-revisions.ts` solo cambia estos 25 versículos por referencia exacta; `src/bible/display-text.ts` conserva la política general de no reescribir palabras por conjetura. `tests/integration/bible.test.ts` coteja los 25 casos en la importación real de CI.

## Priorización de la siguiente revisión

1. Pronombres enclíticos con verbo conjugado: *díjole*, *díjoles*, *díjome*, *respondióle*, *llamóle*.
2. Demostrativos: *aqueste, aquesta, aquestos, aquestas*.
3. Léxico contextual: *mancebo, vianda, menester, aposento, en derredor*.
4. Estudio posterior de fórmulas y gramática (*he aquí, mas, empero, fuere, hubiere*) por riesgo de alterar significado o énfasis.

Estas son **propuestas de revisión**, no cambios implementados ni pasajes ya modernizados.

## Fuentes de contraste

- Texto íntegro de dominio público: https://ebible.org/spaRV1909/.
- Cuervo, *Diccionario de construcción y régimen* (1886-1893), «Criar, crear»: https://lalengua.es/d/cuervo/criar.
- Alemany, *Diccionario de la lengua española* (1917), «Criar»: https://lalengua.es/d/alemany/criar.
- Estudio de lexicografía histórica, Universidad de Jaén: https://revistaselectronicas.ujaen.es/index.php/RILEX/article/download/6191/5725?inline=1.

## Tanda contextual 2 — demostrativos y enclisis (15-11-2026)

Inventario contrastado con `bible_verses.text_content` de la edición RV1909: **53** versículos con demostrativos `aqueste` (18), `aquesta` (22), `aquestos` (4), `aquestas` (7), `aquesto` (2); se presentan respectivamente como `este`, `esta`, `estos`, `estas`, `esto`.

También se han cotejado **389** versículos que contienen formas personales con pronombre pospuesto: `díjole` (176) → `le dijo`, `díjoles` (103) → `les dijo`, `díjome` (80) → `me dijo`, `respondióle` (18) → `le respondió`, `quedóse` (13) → `se quedó`. Hay 390 apariciones en 389 versículos porque 2 Samuel 13:20 contiene dos formas. Uno de los versículos con demostrativos también contiene enclisis: **441 versículos únicos** en el lote.

**Aplicación controlada:** `src/bible/archaic-display.ts` contiene el inventario explícito de referencias en listas cerradas. La función solo actúa sobre esos pasajes. La capa de visualización de `src/bible/display-text.ts` utiliza dicha transformación; se conserva la cadena original en PostgreSQL, sin importar ni escribir una nueva edición. `tests/integration/bible.test.ts` comprueba la presencia exacta de 441 pasajes, las transformaciones y el mantenimiento del original.

Ejemplos: 1 Crónicas 28:7 «aqueste día» → «este día»; Daniel 4:28 «Todo aquesto» → «Todo esto»; 1 Crónicas 21:11 «díjole» → «le dijo»; 1 Samuel 1:23 «quedóse» → «se quedó».

**Exclusión intencional:** `llamóle` (5 versículos) necesita cotejar si hoy corresponde `lo llamó`, `la llamó` o `le llamó`, según el referente. Tampoco se modernizan `mas`, `empero`, `he aquí`, `fuere` ni `hubiere` por sustitución ciega.

**Fundamentos lingüísticos:** Atlas Histórico del Español, «La variación entre las formas tipo este y aqueste» (Universitat de les Illes Balears): https://atlashistorico.uib.es/cap/Enrique-Arias1 ; FundéuRAE, «verbos con pronombre añadido, acentuación»: https://www.fundeu.es/recomendacion/verbos-con-encliticos-acentuacion/ . Esta modernización parcial **no constituye una revisión completa del corpus**.

## Tanda contextual 3 — vocabulario y locuciones (15-11-2026)

Se han examinado **216 versículos candidatos** de la edición original RV1909; se aplican sustituciones en **198 versículos diferentes** y se reservan **18** cuyo sentido o construcción requiere una decisión editorial adicional. Registro exhaustivo de referencias de esta tanda: `src/bible/contextual-modernization.ts`.

| Original | Contexto cotejado | Versículos adaptados | Decisión |
|---|---|---:|---|
| `llamóle` | cinco nombres impuestos: hijo, serpiente, altar, hijo, localidad | 5 | `lo llamó` o `la llamó`, conforme al referente; expresiones exactas |
| `hacimiento de gracias` | locución histórica de agradecimiento y sacrificio | 12 | `acción de gracias`; cambiar `el`→`la` o `todo`→`toda` en dos pasajes |
| `es menester que` | construcciones explícitas de obligación/necesidad | 17 | `es necesario que` sin cambiar el resto de la oración |
| `en derredor` | localización en torno a un elemento | 71 | `alrededor`, conservando las restantes preposiciones |
| `mancebo(s)` | referencia indudable a jóvenes | 72 | `joven` / `jóvenes` |
| `vianda(s)` | comida, alimento o comida sólida en su contexto | 21 | `comida(s)` o `alimento(s)` según el pasaje, con ajustes de concordancia en cuatro casos |

**Excepciones (18):** se conservan sin tocar 10 usos de `mancebos` con posible valor de **criados, ayudantes, guerreros o personal de servicio** (`1S 8:16`, `2S 1:15; 2:14,21; 4:12; 18:15`, `Gn 14:24`, `Ne 4:16`, `Nm 11:28`, `Mc 14:51`) y 9 usos de `vianda(s)` en construcciones litúrgicas o con concordancia no resuelta; el conjunto de 18 versículos distintos se debe a que una referencia coincide entre grupos de candidatos. **Nota:** los recuentos por tipo son 10 y 9; la unión se mide por versículos distintos. No se normalizan estos casos por analogía.

**Cotejos de `llamóle`:** `1Cro 7:16` → `lo llamó Peres` (hijo); `2R 18:4` → `la llamó Nehustán` (serpiente de bronce); `Gn 33:20` → `lo llamó` (altar); `Jc 13:24` → `lo llamó Samsón` (hijo); `Nm 32:42` → `la llamó Noba` (localidad).

**Cotejo de comida ritual:** `Lv 3:11,16`, `Lv 5:13` y `Nm 28:24` permanecen sin transformar, porque no basta sustituir `vianda` por `comida` para obtener una locución litúrgica correcta. También permanecen ciertas descripciones culinarias y pasajes de alimentos sacrificados pendientes de mayor revisión.

**Control de calidad:** `tests/unit/display-text.test.ts` cubre los referentes, las concordancias, las exclusiones y la inmutabilidad; `tests/integration/bible.test.ts` recorre 216 versículos de la fuente original y verifica 198 adaptaciones y 18 preservaciones. Este es el cambio en la capa visible, no una alteración de la edición bíblica.

**Fuente terminológica:** Centro Virtual Cervantes, Biblioteca fraseológica (locución `hacimiento de gracias` = `acción de gracias`): https://cvc.cervantes.es/lengua/biblioteca_fraseologica/n9_marti/fernandez_04.htm ; FundéuRAE sobre pronombres y leísmo: https://www.fundeu.es/recomendacion/leismo-laismo-y-loismo-claves/.
