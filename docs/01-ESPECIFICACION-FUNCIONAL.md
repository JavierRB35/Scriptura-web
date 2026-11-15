# PROMPT MAESTRO DE DESARROLLO — SCRIPTURA WEB

**Versión:** 1.0  
**Fecha:** 15 de noviembre de 2026  
**Estado:** Especificación funcional aprobada. Pendiente de auditoría técnica y ejecución.  
**Proyecto:** Scriptura — Plataforma bíblica de lectura, reflexión y comunidad.  
**Repositorio de referencia:** `JavierRB35/Scriptura` (verificar existencia, acceso y estado actual).

---

# 0. MISIÓN Y DIRECTRIZ PRINCIPAL

Actúa como arquitecto de software, desarrollador full-stack senior, especialista en bases de datos, seguridad, integración de inteligencia artificial y responsable técnico de la ejecución integral del proyecto.

Tu misión consiste en transformar la aplicación Scriptura existente en una **plataforma web pública, profesional, segura, moderna y completamente funcional**, centrada en la lectura de la Biblia y en una comunidad abierta de reflexión interconfesional.

No debes limitarte a elaborar recomendaciones, maquetas, diseños conceptuales ni planes de desarrollo.

**El objetivo es construir, integrar, probar, documentar y dejar preparada para su publicación una aplicación real.**

Trabajarás con autonomía técnica y criterio profesional, priorizando:

1. Calidad del producto terminado.
2. Rapidez de ejecución sin comprometer funcionalidades esenciales.
3. Simplicidad y mantenibilidad de la arquitectura.
4. Seguridad, protección de datos e integridad de las Escrituras.
5. Aprovechamiento de componentes existentes cuando resulte conveniente.
6. Eliminación de validaciones, consultas y procesos redundantes.
7. Entregas funcionales, verificables y trazables.

## 0.1. Norma contra el perfeccionismo improductivo

Queda expresamente prohibido prolongar innecesariamente el proyecto mediante:

- Refactorizaciones sin beneficio funcional, técnico o de seguridad demostrable.
- Repetición de análisis ya realizados y válidos.
- Generación de documentos extensos que no aporten valor a la ejecución.
- Creación de ramas y pull requests para modificaciones menores que puedan integrarse de forma segura.
- Solicitudes de autorización para decisiones técnicas ordinarias.
- Replanteamiento de decisiones funcionales ya aprobadas.
- Ciclos indefinidos de revisión estética.
- Introducción de microservicios, abstracciones o infraestructuras injustificadas.
- Paralización del desarrollo por problemas secundarios que puedan resolverse autónomamente.

La regla de trabajo será:

**Analizar lo necesario, decidir con criterio, implementar, verificar y avanzar.**

## 0.2. Prohibición absoluta de funcionalidades ficticias

No se considerará implementada ninguna funcionalidad que sea exclusivamente visual.

Quedan prohibidos:

- Botones que aparenten funcionar pero no ejecuten acciones reales.
- Comentarios, usuarios, estadísticas o likes ficticios en producción.
- Respuestas de IA simuladas.
- Citas bíblicas o referencias documentales inventadas.
- Correos que aparenten estar programados pero no dispongan de ejecución real.
- Formularios que no persistan información.
- Reconocimientos calculados con datos falsos.
- Paneles administrativos sin conexión con la base de datos.
- Resultados de pruebas declarados como satisfactorios sin haber sido ejecutados.

Los datos sintéticos se permitirán exclusivamente en entornos de desarrollo y pruebas, claramente identificados y aislados de producción.

## 0.3. Jerarquía de instrucciones

En caso de conflicto, aplica este orden:

1. Seguridad, legislación aplicable y derechos de terceros.
2. Decisiones funcionales aprobadas en este documento.
3. Directrices técnicas y criterios de aceptación aquí establecidos.
4. Evidencias verificadas durante la auditoría del repositorio.
5. Documentación técnica vigente y compatible.
6. Decisiones autónomas del desarrollador.

No interpretes la documentación antigua del repositorio como autorización para contradecir decisiones posteriores.

---

# 1. IDENTIDAD Y OBJETIVOS DEL PRODUCTO

## 1.1. Concepto

Scriptura será una comunidad digital abierta e interconfesional para leer las Escrituras, comprender sus contenidos, compartir reflexiones y descubrir perspectivas diferentes.

Su propuesta central es:

**Leer, comprender, reflexionar, compartir y descubrir otras perspectivas.**

Scriptura no debe convertirse en una red social genérica ni en una plataforma que establezca qué confesión religiosa posee la interpretación correcta.

La Biblia ocupará el centro de la experiencia.

Las funcionalidades comunitarias, los debates, los reconocimientos y la inteligencia artificial deberán enriquecer esa experiencia.

## 1.2. Principios editoriales

- Respeto por la diversidad de interpretaciones cristianas y por los lectores sin adscripción religiosa.
- Neutralidad de la plataforma respecto a controversias doctrinales.
- Libertad para expresar desacuerdos respetuosos.
- Separación inequívoca entre Escrituras, documentos de referencia, opiniones humanas y contenido generado por IA.
- Integridad absoluta de las ediciones bíblicas.
- Participación constructiva, no competición por popularidad.
- Accesibilidad, legibilidad y sencillez de uso.
- Privacidad y seguridad desde el diseño.

## 1.3. Modelo económico

Scriptura será completamente gratuita y estará financiada por su propietario.

No incorporar:

- Suscripciones premium.
- Servicios de pago.
- Funcionalidades exclusivas para usuarios de pago.
- Solicitudes de donaciones.
- Ventajas reputacionales económicas.

Incorporar mecanismos administrativos de control de consumo, especialmente de IA, servicios de correo e infraestructura.

---

# 2. DECISIONES FUNCIONALES VINCULANTES

Las siguientes decisiones han sido aprobadas y no deben volver a someterse a debate:

| ID | Área | Decisión |
|---|---|---|
| D01 | Identidad | Comunidad abierta e interconfesional |
| D02 | Portada | Equilibrio entre Biblia y comunidad |
| D03 | Participación | Comentarios sobre pasajes y debates guiados |
| D04 | Reconocimientos | Actividad y likes recibidos |
| D05 | Visibilidad | Actividad reciente, destacados y rotación de participantes |
| D06 | Acceso | Biblia pública; comunidad exclusiva para registrados |
| D07 | Biblioteca | Cobertura interconfesional progresiva y fuentes verificadas |
| D08 | Lectura | Panel contextual desplegable |
| D09 | Debates | Gestión editorial, propuestas de usuarios y asistencia de IA |
| D10 | Moderación | Automática y humana, proporcional al riesgo |
| D11 | Perfiles | Historial, favoritos, debates seguidos y notificaciones |
| D12 | IA | Asistencia editorial y acompañamiento de lectura |
| D13 | Navegación | Cinco secciones principales |
| D14 | Diseño | Editorial contemporáneo |
| D15 | Administración | Roles de administrador, editor y moderador |
| D16 | Reutilización | Auditoría y reconstrucción selectiva de Scriptura |
| D17 | Lanzamiento | Todas las funcionalidades aprobadas operativas antes de la apertura pública |
| D18 | Suscripciones | Envío diario gratuito de lecturas de misa |
| D19 | Correos | Textos completos reutilizables, identificando traducción y alternativas legales |
| D20 | Calendario | Calendario general de España y horarios personalizados |
| D21 | Arquitectura | Modular, preferentemente con servicios gestionados |
| D22 | Financiación | Gratuita, financiada por el propietario |
| D23 | Privacidad | Perfiles parcialmente visibles e historial configurable |
| D24 | Reputación | Puntuación combinada con controles antifraude |
| D25 | IA documental | Biblia y biblioteca documental de fuentes verificadas |

Todas estas decisiones forman parte del alcance contractual y funcional del desarrollo.

---

# 3. ESTRUCTURA GENERAL DE LA WEB

La navegación principal tendrá cinco áreas:

1. **Inicio**
2. **Biblia**
3. **Debates**
4. **Comunidad**
5. **Mi espacio**

Existirá adicionalmente un panel privado de administración, separado de la navegación ordinaria.

## 3.1. Inicio

La portada combinará:

- Identidad y presentación de Scriptura.
- Acceso directo a la lectura bíblica.
- Pasaje o lectura destacada.
- Introducción a la comunidad.
- Últimas reflexiones.
- Debates activos.
- Aportaciones destacadas.
- Participantes reconocidos con rotación.
- Acceso al servicio de lecturas diarias por correo.

Los visitantes no registrados podrán ver los elementos públicos y una presentación de las funcionalidades comunitarias, pero no el contenido reservado de comentarios, debates o perfiles.

Los miembros registrados podrán acceder a la actividad comunitaria real.

No inventar datos para aparentar actividad cuando la comunidad todavía tenga pocos participantes. Utilizar estados vacíos informativos y atractivos.

## 3.2. Biblia

Sección central de lectura, navegación, búsqueda, selección de versículos, favoritos, comentarios contextuales y asistente de IA.

## 3.3. Debates

Espacio reservado a miembros registrados con debates guiados, textos relacionados, respuestas, seguimiento y propuestas de nuevos debates.

## 3.4. Comunidad

Espacio reservado a miembros registrados con actividad reciente, reflexiones destacadas, participantes reconocidos y acceso a perfiles conforme a sus preferencias de privacidad.

## 3.5. Mi espacio

Área personal con perfil, historial, favoritos, debates seguidos, reconocimientos, notificaciones y configuración de privacidad.

---

# 4. AUTENTICACIÓN, USUARIOS Y PERMISOS

## 4.1. Visitantes anónimos

Podrán:

- Leer toda la Biblia disponible.
- Buscar libros, capítulos y versículos.
- Consultar información sobre las traducciones y sus fuentes.
- Acceder a información pública del proyecto.
- Suscribirse a los correos diarios sin crear una cuenta comunitaria.

No podrán consultar:

- Comentarios de otros usuarios.
- Respuestas.
- Debates comunitarios.
- Perfiles de miembros.
- Estadísticas individuales.
- Reconocimientos asociados a personas concretas.
- Resultados de búsqueda comunitaria.

El bloqueo deberá producirse en el servidor, API y base de datos. No bastará con ocultar elementos visualmente.

## 4.2. Usuarios registrados

Podrán:

- Publicar reflexiones.
- Responder a comentarios.
- Dar y retirar likes.
- Participar en debates.
- Proponer nuevos debates.
- Guardar pasajes favoritos.
- Seguir debates.
- Consultar sus aportaciones.
- Obtener reconocimientos.
- Recibir notificaciones.
- Consultar el asistente de IA.
- Configurar su perfil y privacidad.

## 4.3. Registro y autenticación

Implementar, como mínimo:

- Registro mediante correo electrónico y contraseña.
- Verificación de correo.
- Inicio y cierre de sesión.
- Recuperación segura de contraseña.
- Gestión de sesiones y dispositivos según capacidades del proveedor.
- Protección frente a intentos automatizados y abusos.
- Posibilidad de eliminación de cuenta conforme a la normativa aplicable.

El acceso mediante Google podrá incorporarse si resulta compatible con la solución elegida y no introduce una complejidad desproporcionada.

## 4.4. Perfil personal

Campos públicos configurados:

- Alias único.
- Avatar opcional.
- Fecha de incorporación en formato no invasivo.
- Número de aportaciones válidas.
- Likes recibidos.
- Debates en los que participa.
- Nivel y reconocimientos.

Campos privados:

- Correo electrónico.
- Identificadores de autenticación.
- Preferencias de privacidad.
- Preferencias de notificaciones.
- Datos técnicos necesarios para la seguridad.

Por defecto, el historial completo no aparecerá en la página de perfil visible a otros miembros.

El usuario podrá activar su visibilidad.

Aunque el historial del perfil esté oculto, los comentarios publicados seguirán apareciendo dentro de las conversaciones a las que pertenecen, salvo retirada, anonimización o supresión conforme a las reglas aplicables.

No incluir mensajería privada ni redes de seguidores: no forman parte del alcance aprobado.

---

# 5. BIBLIOTECA BÍBLICA Y DERECHOS DE LOS TEXTOS

Este módulo es de máxima prioridad.

## 5.1. Fuente inicial

Utilizar como edición inicial candidata la **Reina-Valera 1909**, en su versión histórica de dominio público, tras verificar la procedencia exacta del archivo incorporado.

Referencia documental inicial:

`https://ebible.org/spaRV1909/`

No utilizar para la nueva biblioteca la versión de la Biblia de la Universidad de Navarra ni sus notas, comentarios o materiales protegidos.

## 5.2. Cobertura progresiva

La arquitectura deberá admitir:

- Canon de 66 libros.
- Canon católico de 73 libros.
- Libros deuterocanónicos.
- Diferentes traducciones.
- Diferencias de numeración y organización entre ediciones.
- Futuras ampliaciones del catálogo.

La primera edición aprobada deberá estar íntegra y verificada antes del lanzamiento.

Los deuterocanónicos y las traducciones adicionales se incorporarán conforme se disponga de fuentes aptas y derechos acreditados, sin simular que están disponibles cuando no lo estén.

La ampliación del catálogo no se considerará una nueva funcionalidad, sino incorporación de contenido a una capacidad ya implementada.

## 5.3. Inmutabilidad del contenido publicado

Los textos bíblicos importados deberán mantenerse fieles a su edición.

No permitir:

- Correcciones automáticas mediante IA.
- Modernización de expresiones antiguas.
- Sustitución de palabras.
- Mezcla de traducciones dentro de un mismo pasaje sin indicación explícita.
- Completar versículos mediante modelos generativos.
- Modificaciones silenciosas de textos publicados.

Si se detecta un error de transcripción, su corrección exigirá una nueva revisión trazable de la edición o de la importación.

## 5.4. Metadatos obligatorios

Cada edición incluirá:

- Identificador único.
- Nombre completo.
- Abreviatura.
- Idioma.
- Canon o cobertura.
- Traductor o responsable, si consta.
- Año y edición.
- Fuente original.
- URL de procedencia.
- Situación y evidencias de derechos.
- Fecha de verificación.
- Versión del archivo importado.
- Huellas de integridad.
- Estado de publicación.

La información sobre derechos deberá poder consultarse desde la interfaz.

## 5.5. Importación

Crear un proceso reproducible que:

1. Obtenga una fuente documentada.
2. Verifique su licencia o dominio público.
3. Analice su estructura.
4. Importe libros, capítulos y versículos.
5. Compruebe cantidades, orden, referencias y contenido.
6. Registre errores y advertencias.
7. Genere huellas de integridad.
8. Permita repetir la importación sin duplicar registros.
9. Publique la edición solo tras las verificaciones pertinentes.

Preferir formatos estructurados autorizados, como USFM u OSIS, cuando estén disponibles.

Los EPUB antiguos de Scriptura no deberán convertirse automáticamente en la nueva fuente de verdad.

---

# 6. EXPERIENCIA DE LECTURA

## 6.1. Navegación

Implementar:

- Selección de traducción.
- Selección de libro.
- Selección de capítulo.
- Navegación anterior/siguiente.
- Búsqueda textual.
- Búsqueda por referencia.
- Enlaces directos a pasajes.
- Favoritos.
- Ajuste de tamaño de letra.
- Modo claro y oscuro.
- Lectura adaptada a móviles.

Las URLs deberán representar de forma estable libro, capítulo, edición y, cuando corresponda, intervalo de versículos.

## 6.2. Selección contextual

El usuario podrá seleccionar:

- Un versículo.
- Varios versículos consecutivos dentro del mismo capítulo.
- Un pasaje previamente referenciado desde debates o comentarios.

El sistema deberá preservar la selección durante la navegación y validar en el servidor que la referencia existe.

## 6.3. Panel desplegable

En escritorio:

- Panel lateral para comentarios y respuestas.
- El texto bíblico sigue siendo visible y prioritario.
- Apertura y cierre sin recarga completa de página.

En móvil:

- Panel inferior o lateral adaptado.
- Accesibilidad por teclado y lectores de pantalla.
- Recuperación correcta del punto de lectura al cerrarlo.

El usuario no deberá perder su posición ni su selección.

## 6.4. Presentación

El texto bíblico no se mezclará visualmente con opiniones humanas o contenido generado mediante IA.

Utilizar jerarquía tipográfica, etiquetas e identificadores claros para distinguir cada tipo de contenido.

### Directriz obligatoria V17 — Cada versículo numerado y en línea independiente

**Es obligatorio presentar todos los versículos con su número visible y un salto de línea entre cada versículo.** En el lector, cada versículo comienza en una línea o bloque propio; los versículos consecutivos nunca pueden componerse en un único párrafo corrido. El número corresponde exactamente a la edición/versificación que se está mostrando.

La norma se aplica al lector y a toda presentación de secuencias de versículos como texto bíblico, en móvil y escritorio, independientemente de ajustes de fuente o tema. Un salto de línea no exige una línea vacía adicional. La numeración debe resultar legible y accesible. El texto almacenado no se modifica: número, disposición y separación pertenecen a la capa de presentación. Se mantiene la selección individual y de intervalos de versículos.

**Aceptación obligatoria:** verificar números correctos, separación por bloque/línea, responsive y accesibilidad. Una lectura con números omitidos o con versículos consecutivos concatenados en un párrafo NO cumple la especificación. Ver también `docs/05-DIRECTRIZ-IDENTIDAD-VISUAL.md` (V17).

---

# 7. COMENTARIOS, RESPUESTAS Y LIKES

## 7.1. Comentarios

Cada reflexión deberá estar asociada a un pasaje bíblico válido.

Guardar:

- Autor.
- Pasaje.
- Edición de referencia.
- Texto del comentario.
- Fecha de publicación.
- Fecha de modificación.
- Estado de moderación.
- Número de likes válidos.
- Número de respuestas.

Permitir edición y retirada de aportaciones propias bajo reglas transparentes.

## 7.2. Respuestas

Los usuarios podrán responder a comentarios de otros participantes y mantener conversaciones.

Conservar:

- Relación con el comentario original.
- Autoría.
- Orden cronológico.
- Contexto bíblico.
- Estado de moderación.

La profundidad de respuestas deberá limitarse cuando sea necesario para mantener la legibilidad y el rendimiento.

## 7.3. Likes

Reglas mínimas:

- Solo usuarios autenticados.
- Máximo un like activo por usuario y aportación.
- No permitir autolikes.
- Posibilidad de retirar un like.
- Recuento calculado desde registros reales.
- Protección contra operaciones duplicadas.
- Detección de actividad artificial.

## 7.4. Ordenación

Permitir consultar aportaciones por:

- Más recientes.
- Más valoradas.
- Relevancia, cuando exista un criterio verificable.

Los comentarios recientes no dependerán de la reputación del autor para aparecer en su sección cronológica.

## 7.5. Estados vacíos

Cuando un pasaje carezca de reflexiones, mostrar una invitación a iniciar la conversación.

No generar comentarios ficticios ni atribuir contenido de IA a usuarios inexistentes.

---

# 8. DEBATES GUIADOS

## 8.1. Estructura

Un debate contendrá:

- Título.
- Pregunta principal.
- Descripción.
- Uno o varios pasajes relacionados.
- Preguntas orientativas opcionales.
- Autoría editorial.
- Estado.
- Fecha de publicación.
- Número de participantes.
- Número de intervenciones.
- Conversaciones asociadas.

## 8.2. Gestión editorial

Los administradores y editores podrán:

- Crear debates.
- Guardar borradores.
- Revisar propuestas.
- Editar contenido.
- Aprobar y publicar.
- Archivar.
- Destacar.

Los usuarios registrados podrán proponer temas, pero no publicarlos directamente como debates oficiales.

## 8.3. Asistencia de IA

La IA podrá:

- Proponer temas.
- Elaborar preguntas.
- Identificar pasajes relacionados.
- Detectar similitud con debates anteriores.
- Mejorar la claridad editorial.

Nunca publicará debates sin aprobación humana.

## 8.4. Criterios editoriales

Los debates deberán:

- Estar vinculados a las Escrituras.
- Invitar a reflexionar.
- Evitar preguntas repetitivas.
- Evitar inducir una respuesta confesional obligatoria.
- Favorecer conversaciones constructivas.
- Presentar las fuentes que correspondan.

No programar una frecuencia de publicación artificialmente obligatoria.

---

# 9. COMUNIDAD Y VISIBILIDAD

Crear las siguientes vistas:

- Comentarios recientes.
- Reflexiones destacadas.
- Debates activos.
- Participantes reconocidos.
- Actividad personal.
- Perfiles de usuarios.

## 9.1. Participantes destacados

Implementar un sistema de rotación que permita mostrar participantes distintos, evitando que la antigüedad o la popularidad monopolicen los espacios destacados.

Los criterios deberán ser objetivos, configurables y coherentes con las reglas de reputación.

Excluir cuentas sancionadas y actividad fraudulenta.

## 9.2. Estadísticas

Calcular las estadísticas con datos persistidos y verificables.

No conservar contadores inconsistentes ni utilizar cifras promocionales ficticias.

Las operaciones de publicación, edición, retirada y moderación deberán mantener correctamente los recuentos.

---

# 10. REPUTACIÓN Y RECONOCIMIENTOS

## 10.1. Modelo

Implementar un sistema combinado basado en:

- Aportaciones válidas.
- Likes válidos recibidos.
- Límites contra actividad repetitiva.
- Exclusión de operaciones fraudulentas.
- Exclusión o corrección de contenido sancionado.

## 10.2. Puntuación

Utilizar una fórmula transparente y versionada, con parámetros administrables.

Definir como propuesta inicial:

- Puntos por aportación válida.
- Puntos por like recibido.
- Límite de puntos de actividad acumulables por periodo.
- Reglas de exclusión.
- Umbrales para cada reconocimiento.

No convertir estos parámetros iniciales en constantes rígidas de código.

Los valores concretos deberán registrarse en la configuración y documentarse. El desarrollador podrá proponer valores iniciales razonables sin abrir un debate adicional.

## 10.3. Contabilidad de reputación

La reputación se calculará a partir de eventos o registros verificables, evitando contadores manipulables.

El sistema deberá permitir:

- Recalcular puntuaciones.
- Detectar duplicados.
- Corregir errores.
- Revertir puntos obtenidos fraudulentamente.
- Auditar cambios administrativos.
- Modificar reglas sin perder el historial.

## 10.4. Reconocimientos

Crear una progresión visual con nombres adecuados al propósito de Scriptura.

Por ejemplo, Explorador, Colaborador, Reflexivo y Referente de la comunidad.

Los nombres podrán concretarse durante el diseño.

Ningún reconocimiento deberá implicar superioridad religiosa o capacidad para imponer interpretaciones.

No utilizar la IA para evaluar qué creencia es correcta.

---

# 11. MODERACIÓN Y CONVIVENCIA

## 11.1. Regla general

**Moderar el comportamiento, no las creencias.**

Permitir discrepancias doctrinales respetuosas.

Prohibir:

- Insultos.
- Acoso.
- Amenazas.
- Spam.
- Suplantaciones.
- Manipulación coordinada de reputación.
- Publicación de información privada de terceros.
- Abusos reiterados de la plataforma.

## 11.2. Flujo operativo

- Publicación inmediata de comentarios ordinarios.
- Detección automática de posibles abusos.
- Medidas preventivas proporcionales ante riesgos elevados.
- Sistema de denuncias.
- Cola de revisión humana.
- Decisiones registradas.
- Sanciones progresivas.
- Mecanismo de apelación.

Una alerta automatizada no deberá convertirse indiscriminadamente en una sanción definitiva.

## 11.3. Herramientas del moderador

- Revisar denuncias.
- Consultar contexto del comentario.
- Ocultar o restaurar contenido.
- Aplicar restricciones temporales.
- Escalar incidencias.
- Revisar apelaciones.
- Registrar justificación de actuaciones.

No exponer datos personales innecesarios a los moderadores.

---

# 12. INTELIGENCIA ARTIFICIAL

## 12.1. Funciones aprobadas

Se implementarán dos capacidades:

**Asistente editorial:** ayuda a preparar, revisar y relacionar debates.

**Acompañante de lectura:** ayuda a usuarios registrados a comprender pasajes y explorar interpretaciones documentadas.

No implementar una IA que publique comentarios espontáneamente como participante de la comunidad.

## 12.2. Arquitectura de conocimiento

Utilizar un mecanismo de recuperación documental fundamentada, preferentemente RAG.

Fuentes:

- Biblioteca bíblica autorizada.
- Documentación histórica verificada.
- Documentación académica autorizada.
- Fuentes religiosas seleccionadas de distintas tradiciones.
- Metadatos editoriales y bibliográficos.

Mantener separación entre contenido fuente y contenido generado.

## 12.3. Biblioteca documental

Cada documento tendrá:

- Título.
- Autor o entidad.
- Fecha.
- Procedencia.
- URL o referencia.
- Condiciones de uso.
- Tradición o ámbito, cuando corresponda.
- Versión.
- Estado editorial.
- Fecha de última verificación.

No incorporar materiales protegidos sin una base legal suficiente.

## 12.4. Recuperación y citas

Cada respuesta fundamentada deberá vincular sus afirmaciones documentales a fuentes concretas.

Las citas bíblicas se recuperarán directamente del repositorio bíblico autorizado, no se reconstruirán mediante generación probabilística.

Las citas documentales deberán apuntar a documentos y fragmentos existentes.

Si el sistema no encuentra respaldo suficiente:

- Reconocer la limitación.
- Evitar inventar referencias.
- Diferenciar hipótesis y hechos.
- Sugerir consultar directamente los textos disponibles.

## 12.5. Neutralidad interconfesional

Cuando existan perspectivas interpretativas diferentes:

- Identificarlas.
- Atribuirlas a fuentes apropiadas.
- Evitar presentar una como verdad oficial de Scriptura.
- Distinguir consenso histórico y desacuerdo doctrinal.
- Permitir al usuario explorar los textos originales.

## 12.6. Seguridad y privacidad

- Proteger frente a inyección de instrucciones desde documentos recuperados.
- No exponer prompts internos, claves o información del sistema.
- No enviar conversaciones privadas ni datos personales innecesarios a proveedores de IA.
- Establecer políticas claras de conservación de consultas.
- Verificar las condiciones contractuales y de tratamiento del proveedor.
- Aplicar límites de uso, cuotas y presupuesto.
- Registrar consumo técnico sin almacenar más información personal de la necesaria.

## 12.7. Pruebas de IA

Crear una batería de preguntas representativas que incluya:

- Búsqueda de pasajes.
- Comparación de textos.
- Contexto histórico.
- Diferencias interpretativas.
- Preguntas sin respaldo suficiente.
- Referencias inexistentes.
- Intentos de manipulación del asistente.

Ninguna respuesta deberá citar una fuente inexistente o atribuir texto a una edición distinta de la consultada.

---

# 13. LECTURAS DIARIAS DE MISA POR CORREO

## 13.1. Servicio

Implementar un sistema gratuito de suscripción al envío diario de lecturas de misa.

La suscripción será independiente del registro comunitario.

Cada suscriptor podrá:

- Registrarse mediante correo electrónico.
- Confirmar su suscripción.
- Elegir la hora de envío.
- Elegir su zona horaria.
- Modificar preferencias.
- Cancelar el servicio.

## 13.2. Calendario litúrgico

Utilizar inicialmente el calendario litúrgico general de España.

Mantener los calendarios y referencias litúrgicas separados de los textos bíblicos.

Contemplar:

- Ciclos dominicales.
- Ciclos feriales.
- Solemnidades.
- Fiestas y memorias pertinentes.
- Celebraciones con lecturas alternativas.
- Celebraciones con diferentes formularios o misas.
- Cambios de año litúrgico.
- Años bisiestos.
- Cambios de horario.

El sistema deberá identificar de forma explícita qué celebración y conjunto de lecturas se envía.

Si existen varias alternativas litúrgicas, utilizar un criterio editorial documentado y mostrar la variante correspondiente.

## 13.3. Integridad y derechos

El correo deberá incluir los textos completos cuando su reproducción y distribución estén autorizadas.

La traducción deberá figurar expresamente.

Si algún pasaje no está disponible bajo derechos adecuados:

- Incluir su referencia.
- Incorporar un enlace legítimo cuando exista.
- No inventar ni completar el texto.
- No sustituirlo silenciosamente por otra lectura.
- Registrar la incidencia para revisión editorial.

Los estribillos, aclamaciones y otros textos propiamente litúrgicos también estarán sujetos a comprobación de derechos.

No afirmar que se reproduce la traducción litúrgica oficial si realmente se utiliza una traducción bíblica histórica.

## 13.4. Programación

Horario predeterminado: 07:00 de la zona horaria elegida por el suscriptor.

Utilizar identificadores de zona horaria IANA y almacenar las operaciones técnicas en UTC.

Resolver correctamente horarios de verano e invierno.

Implementar una cola de trabajos duradera e idempotente.

Cada envío deberá identificarse, como mínimo, mediante suscripción, fecha litúrgica local y versión del contenido.

Evitar duplicados incluso cuando:

- Se repita una tarea programada.
- Falle el servidor.
- Existan reintentos.
- Se reinicie el proceso.
- Cambie el horario de la zona.

## 13.5. Mensaje

Estructura recomendada:

- Identidad Scriptura.
- Fecha.
- Celebración litúrgica.
- Primera lectura.
- Salmo responsorial, según contenido autorizado.
- Segunda lectura, cuando proceda.
- Evangelio.
- Otras lecturas pertinentes, según celebración.
- Traducción utilizada.
- Enlaces a los pasajes en Scriptura.
- Gestión de suscripción y enlace de baja.

Utilizar diseños de correo legibles en móviles y clientes habituales.

## 13.6. Operación

Registrar:

- Suscripciones pendientes y confirmadas.
- Preferencias de envío.
- Trabajos programados.
- Intentos.
- Resultado del proveedor.
- Errores.
- Rebotes y rechazos.
- Bajas.
- Fecha y versión del contenido enviado.

No interpretar la aceptación de una solicitud por el proveedor como prueba de que el destinatario ha leído el mensaje.

---

# 14. NOTIFICACIONES

Implementar un sistema de notificaciones para usuarios registrados.

Eventos:

- Respuesta a un comentario propio.
- Mención.
- Actividad relevante en debates seguidos.
- Actualización del estado de una propuesta de debate.
- Reconocimiento obtenido.
- Comunicaciones administrativas esenciales.

El usuario podrá configurar qué notificaciones recibe.

Las notificaciones internas serán una capacidad básica. Las notificaciones por correo se habilitarán únicamente conforme a las preferencias y garantías aplicables.

Evitar mensajes repetitivos, bucles de notificaciones y alertas irrelevantes.

---

# 15. ADMINISTRACIÓN Y PERMISOS

Crear un panel privado centralizado con tres roles.

## 15.1. Administrador general

- Configuración del sistema.
- Gestión de permisos.
- Usuarios y sanciones.
- Gestión de proveedores y parámetros.
- Supervisión global.
- Estadísticas.
- Gestión de incidencias.
- Revisión de auditoría.

## 15.2. Editor

- Gestión de debates.
- Revisión de propuestas.
- Biblioteca documental.
- Catálogo de traducciones.
- Revisión de fuentes.
- Calendario y contenidos litúrgicos.
- Publicación editorial.

La publicación de nuevas ediciones bíblicas deberá pasar las validaciones de derechos e integridad.

## 15.3. Moderador

- Denuncias.
- Moderación de comentarios.
- Gestión de incidencias.
- Aplicación de medidas permitidas.
- Revisión de apelaciones conforme a permisos.

Una misma persona podrá tener varios roles.

Los permisos serán acumulables y se comprobarán en todas las operaciones sensibles.

## 15.4. Métricas administrativas

Mostrar datos agregados reales:

- Usuarios registrados y activos.
- Comentarios y respuestas.
- Debates.
- Denuncias pendientes.
- Suscripciones a lecturas.
- Correos enviados, fallidos y pendientes.
- Consumo de IA.
- Costes estimados de servicios.
- Incidencias técnicas.
- Estado de automatizaciones.

Evitar exponer innecesariamente información personal en los cuadros administrativos.

---

# 16. MODELO DE DATOS

Diseñar un modelo relacional normalizado, con índices, claves, restricciones e integridad referencial.

El siguiente modelo constituye la referencia funcional. El desarrollador podrá adaptar nombres y tablas físicas si conserva el comportamiento requerido.

## 16.1. Biblioteca bíblica

Entidades principales:

- `bible_sources`: procedencia y derechos.
- `bible_editions`: traducciones y versiones.
- `biblical_canons`: cánones disponibles.
- `biblical_books`: catálogo de libros.
- `canon_books`: pertenencia y orden de libros por canon.
- `edition_books`: libros incluidos en cada edición.
- `bible_chapters`: capítulos.
- `bible_verses`: contenido textual y referencias.
- `verse_reference_mappings`: equivalencias entre sistemas de numeración.
- `bible_import_batches`: procesos de importación y validación.

Las referencias canónicas y las referencias de cada edición deben modelarse de forma que se respeten diferencias de versificación.

## 16.2. Usuarios

- `profiles`
- `user_preferences`
- `user_roles`
- `privacy_preferences`
- `user_consents`
- `account_deletion_requests`

Utilizar el proveedor de autenticación para credenciales y sesiones cuando corresponda. No duplicar contraseñas en tablas propias.

## 16.3. Comunidad

- `comments`
- `comment_replies` o autorreferencias.
- `comment_likes`
- `passage_favorites`
- `debates`
- `debate_passages`
- `debate_comments`
- `debate_proposals`
- `debate_follows`
- `notifications`

Los comentarios deberán referenciar pasajes reales y no simples cadenas de texto sin validar.

## 16.4. Reputación

- `reputation_rules`
- `reputation_events`
- `recognition_levels`
- `user_recognitions`
- `reputation_adjustments`

Conservar trazabilidad para recálculo y auditoría.

## 16.5. Moderación

- `content_reports`
- `moderation_cases`
- `moderation_actions`
- `appeals`
- `user_restrictions`

## 16.6. Inteligencia artificial

- `knowledge_sources`
- `knowledge_documents`
- `knowledge_chunks`
- `knowledge_embeddings`
- `ai_usage_events`
- `ai_source_references`

Los embeddings podrán utilizar `pgvector` cuando se adopte PostgreSQL compatible.

Conservar las referencias al documento, versión y fragmento del que procede cada respuesta.

## 16.7. Calendario y correo

- `liturgical_calendars`
- `liturgical_celebrations`
- `liturgical_readings`
- `liturgical_reading_variants`
- `email_subscriptions`
- `email_subscription_tokens`
- `daily_email_jobs`
- `email_delivery_attempts`
- `email_templates`

## 16.8. Sistema y auditoría

- `system_settings`
- `audit_events`
- `scheduled_jobs`
- `job_executions`
- `service_usage`
- `content_publication_versions`

## 16.9. Reglas de integridad

Aplicar:

- Identificadores estables.
- Claves foráneas.
- Unicidad de alias, cuando proceda.
- Unicidad de like por usuario y aportación.
- Unicidad de suscripción por dirección normalizada y servicio.
- Protección contra envíos diarios duplicados.
- Restricciones de referencia a pasajes válidos.
- Fechas técnicas en UTC.
- Zona horaria de usuario en formato IANA.
- Índices para búsquedas y actividad reciente.
- Migraciones de esquema versionadas.

Evitar duplicación de información derivada salvo que exista una justificación de rendimiento y mecanismos de consistencia.

---

# 17. ARQUITECTURA TECNOLÓGICA

## 17.1. Estrategia

Adoptar una arquitectura modular con servicios gestionados, priorizando un monolito modular bien estructurado frente a microservicios innecesarios.

La solución definitiva dependerá de la auditoría de Scriptura.

## 17.2. Tecnologías preferentes

| Componente | Tecnología candidata |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | Capa de servidor integrada y módulos de dominio |
| Base de datos | PostgreSQL |
| Proveedor de datos | Supabase |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Búsqueda semántica | PostgreSQL + pgvector |
| Alojamiento web | Vercel |
| Correo transaccional | Resend o equivalente |
| IA | API de proveedor sustituible |
| Tareas programadas | Scheduler + cola persistente |
| Pruebas | Herramientas unitarias, integración y E2E compatibles |

No seleccionar tecnologías únicamente porque sean populares.

Confirmar compatibilidad, costes, mantenimiento y adecuación al repositorio existente.

## 17.3. Persistencia

Todos los datos persistentes de negocio se almacenarán principalmente en PostgreSQL.

Los archivos y documentos se almacenarán en un servicio de objetos.

No utilizar el almacenamiento local del servidor web como fuente de verdad.

Separar:

- Datos estructurados.
- Archivos.
- Contenido bíblico.
- Documentación de IA.
- Logs técnicos.
- Copias de seguridad.

## 17.4. Región

Priorizar alojamiento de datos en la Unión Europea, verificando las regiones concretas y las transferencias internacionales de cada proveedor.

## 17.5. Independencia de proveedores

Evitar dependencias innecesarias que impidan migrar:

- Base de datos.
- Archivos.
- Proveedor de IA.
- Servicio de correo.
- Alojamiento.

Utilizar interfaces internas cuando tengan valor real para facilitar sustituciones futuras.

## 17.6. Entornos

Como mínimo:

- Desarrollo.
- Pruebas o preproducción.
- Producción.

Separar credenciales, bases de datos y servicios.

La preproducción podrá tener datos sintéticos; producción no.

El despliegue público definitivo estará protegido hasta cumplir todos los criterios de aceptación y contar con autorización de apertura.

---

# 18. SEGURIDAD, PRIVACIDAD Y CUMPLIMIENTO

## 18.1. Protección de datos

Diseñar la solución conforme al RGPD y a la normativa española aplicable.

Prestar especial atención a que las reflexiones puedan revelar convicciones religiosas.

Antes de activar el tratamiento real, verificar y documentar la base jurídica aplicable, las garantías para categorías especiales de datos, la información facilitada al usuario y la necesidad de una evaluación de impacto.

No dar por supuesto que el simple registro basta para legitimar cualquier tratamiento de datos sensibles.

## 18.2. Minimización

No solicitar confesión religiosa, identidad real, domicilio ni información personal innecesaria.

## 18.3. Privacidad por defecto

- Historial de perfil privado inicialmente.
- Comunidad inaccesible a visitantes.
- Datos personales no indexables.
- Acceso administrativo limitado.
- Configuraciones de privacidad efectivas en servidor.

## 18.4. Derechos de los usuarios

Implementar procedimientos para:

- Consulta de datos personales.
- Rectificación.
- Exportación cuando corresponda.
- Supresión o anonimización conforme a la normativa.
- Retirada de consentimientos.
- Gestión de reclamaciones.

Determinar una política documentada para comentarios cuando un usuario elimina su cuenta.

## 18.5. Menores

Definir una política de edad de acceso compatible con el público objetivo y la legislación española, incluyendo las garantías necesarias si se admite la participación de menores.

No activar registros de menores sin resolver esa política.

## 18.6. Seguridad técnica

Aplicar:

- Autorización del lado servidor.
- Row Level Security si se utiliza Supabase.
- Protección frente a XSS, CSRF, inyección SQL y acceso indebido.
- Límites de peticiones.
- Validación de entradas.
- Protección de endpoints.
- Gestión segura de tokens.
- Secretos fuera del código fuente.
- Prevención de escalada de privilegios.
- Protección de archivos.
- Cabeceras de seguridad.
- Gestión de dependencias y vulnerabilidades.
- Registros de auditoría.

## 18.7. Aislamiento de comunidad

Un visitante anónimo no podrá obtener datos comunitarios mediante:

- API.
- Consulta directa.
- Caché.
- Archivos estáticos.
- Resultados del buscador.
- URLs compartidas.
- Metadatos de páginas.
- Índices de búsqueda.
- Respuestas de IA.

Comprobar estas restricciones con pruebas automatizadas de permisos.

---

# 19. DISEÑO, ACCESIBILIDAD Y EXPERIENCIA

## 19.1. Identidad visual

Utilizar estilo editorial contemporáneo:

- Fondos cálidos y claros.
- Verde profundo.
- Colores de acento discretos.
- Tipografía elegante y altamente legible.
- Espacios equilibrados.
- Iconografía consistente.
- Transiciones discretas.

No reproducir literalmente una estética de pergamino antiguo ni una red social saturada.

## 19.2. Responsive

Diseñar primero las experiencias principales de lectura y participación para móviles y escritorio.

El resultado deberá funcionar también en tabletas.

## 19.3. Accesibilidad

Objetivo: WCAG 2.2 nivel AA.

Incluir:

- Navegación por teclado.
- Etiquetas accesibles.
- Contraste suficiente.
- Tamaño de texto adaptable.
- Gestión de foco.
- Mensajes de error comprensibles.
- Semántica correcta.
- Compatibilidad razonable con lectores de pantalla.

## 19.4. Rendimiento

- Carga eficiente de capítulos y conversaciones.
- Paginación de comentarios.
- Índices de búsqueda adecuados.
- Caché únicamente para contenido apropiado.
- Evitar consultas repetitivas y operaciones N+1.
- Optimizar imágenes y recursos.
- Mantener objetivos adecuados de Core Web Vitals.

No sacrificar la protección de contenido privado por mejorar artificialmente métricas de rendimiento.

---

# 20. AUDITORÍA OBLIGATORIA DE SCRIPTURA ORIGINAL

**Esta será la primera fase ejecutiva.**

## 20.1. Identificación

Comprobar la existencia, acceso y rama principal del repositorio señalado:

`JavierRB35/Scriptura`

Si la ubicación no coincide, identificar la correcta a partir de los recursos disponibles.

No afirmar que se ha auditado el repositorio sin haber accedido realmente a su contenido.

## 20.2. Documentación

Revisar:

- README.
- Documentación de arquitectura.
- Dependencias.
- Configuración.
- Modelos de datos.
- Código de negocio.
- Componentes de interfaz.
- Pruebas existentes.
- Recursos y textos bíblicos.
- Últimos cambios.
- Instrucciones de desarrollo relevantes.

Identificar documentación obsoleta, contradictoria o superada.

## 20.3. Inventario técnico

Determinar:

- Plataforma original.
- Lenguajes y frameworks.
- Estructura del proyecto.
- Bases de datos.
- Formato de textos.
- Sistemas de navegación.
- Búsqueda.
- Funciones reutilizables.
- Dependencias problemáticas.
- Riesgos de seguridad.
- Limitaciones para ejecución web.

## 20.4. Clasificación

Clasificar componentes en:

**REUTILIZAR:** componentes correctos y compatibles.

**ADAPTAR:** componentes que aportan valor, pero necesitan cambios.

**RECONSTRUIR:** elementos incompatibles, inseguros o con una arquitectura inadecuada.

Esta clasificación debe apoyarse en evidencias, no en preferencias personales.

## 20.5. Resultado

Elaborar un informe ejecutivo breve:

- Estado del repositorio.
- Arquitectura encontrada.
- Funcionalidades útiles.
- Componentes reutilizables.
- Riesgos.
- Arquitectura final elegida.
- Plan de migración.
- Bloqueos reales.

Después continuar directamente con la ejecución.

No solicitar autorización para cada componente clasificado.

---

# 21. PLAN DE EJECUCIÓN

Organizar el desarrollo en las siguientes fases internas.

Estas fases no representan lanzamientos públicos. La web permanecerá sin apertura pública hasta la finalización total.

## Fase 0. Auditoría y preparación

- Verificar repositorio.
- Auditar documentación.
- Inventariar componentes.
- Seleccionar arquitectura.
- Preparar estructura del nuevo proyecto.
- Definir migraciones y estrategia de pruebas.

**Resultado:** base técnica verificable y plan ejecutivo breve.

## Fase 1. Infraestructura y persistencia

- Base de datos.
- Autenticación.
- Roles y permisos.
- Almacenamiento.
- Entornos.
- Migraciones.
- Copias de seguridad.
- Despliegue técnico protegido.

**Resultado:** infraestructura operativa y comprobada.

## Fase 2. Biblioteca y lectura

- Importación bíblica.
- Derechos y procedencia.
- Catálogo.
- Navegación.
- Búsqueda.
- Selección de pasajes.
- Panel contextual.
- Diseño responsive.

**Resultado:** lectura bíblica real y verificable.

## Fase 3. Comunidad

- Usuarios.
- Perfiles.
- Comentarios.
- Respuestas.
- Likes.
- Debates.
- Propuestas editoriales.
- Favoritos.
- Seguimiento.
- Notificaciones.
- Reputación.

**Resultado:** comunidad funcional y persistente.

## Fase 4. Administración y moderación

- Panel administrativo.
- Roles diferenciados.
- Gestión editorial.
- Moderación.
- Denuncias.
- Sanciones.
- Revisión de derechos.
- Estadísticas.
- Auditoría.

**Resultado:** operación administrable sin intervención técnica cotidiana.

## Fase 5. Inteligencia artificial

- Biblioteca documental.
- Ingesta e indexación.
- Recuperación documental.
- Asistente de lectura.
- Asistencia editorial.
- Verificación de referencias.
- Control de consumo.
- Pruebas de comportamiento.

**Resultado:** IA operativa, fundamentada y controlada.

## Fase 6. Lecturas diarias por correo

- Calendario litúrgico.
- Importación o gestión de referencias.
- Subscripciones.
- Plantillas.
- Programación.
- Horarios y zonas.
- Colas.
- Reintentos.
- Gestión de bajas.
- Monitorización.

**Resultado:** servicio de correo verificable de extremo a extremo.

## Fase 7. Integración y aceptación

- Pruebas transversales.
- Accesibilidad.
- Seguridad.
- Rendimiento.
- Recuperación.
- Integridad documental.
- Pruebas de automatizaciones.
- Revisión final de permisos y privacidad.

**Resultado:** aplicación preparada para autorización de apertura pública.

No iniciar una nueva fase con dependencias críticas rotas de fases anteriores.

Permitir trabajo paralelo cuando los componentes estén suficientemente desacoplados.

---

# 22. PRUEBAS OBLIGATORIAS

## 22.1. Pruebas unitarias

Cubrir las reglas críticas:

- Cálculo de reputación.
- Validación de pasajes.
- Roles.
- Likes.
- Preferencias.
- Horarios.
- Reglas de idempotencia.
- Estados de moderación.

## 22.2. Pruebas de integración

Verificar las interacciones reales entre:

- Frontend y backend.
- Backend y PostgreSQL.
- Autenticación y permisos.
- Comentarios y reputación.
- Debates y notificaciones.
- IA y fuentes documentales.
- Calendario, suscripciones y proveedor de correo.

## 22.3. Pruebas E2E

Ejecutar recorridos completos:

**Escenario A — Visitante**

Entrar, navegar por la Biblia, buscar un pasaje y comprobar que los contenidos comunitarios no son accesibles.

**Escenario B — Registro**

Registrarse, verificar correo, iniciar sesión, editar perfil y cerrar sesión.

**Escenario C — Reflexión**

Seleccionar pasaje, publicar comentario, responder, recibir like, consultar notificación y verificar persistencia tras volver a iniciar sesión.

**Escenario D — Reputación**

Generar aportaciones y likes de prueba, comprobar cálculo, retirar likes y verificar correcciones.

**Escenario E — Debate**

Proponer tema, revisar propuesta como editor, aprobarla, publicarla y participar.

**Escenario F — Moderación**

Denunciar contenido, tramitar incidencia, aplicar medida y verificar el efecto en visibilidad y reputación.

**Escenario G — IA**

Consultar un pasaje, recibir explicación con referencias existentes y comprobar respuesta prudente ante una pregunta sin documentación suficiente.

**Escenario H — Correo diario**

Suscribirse, confirmar, configurar horario, generar lectura, ejecutar envío de prueba, comprobar contenido, evitar duplicados y darse de baja.

**Escenario I — Administración**

Comprobar que cada rol dispone solamente de sus permisos autorizados.

## 22.4. Seguridad

Probar:

- Acceso anónimo a datos privados.
- Acceso de usuario A a recursos privados de B.
- Escalada de privilegios.
- Modificación ilícita de reputación.
- Alteración de textos bíblicos.
- Inyección de contenido.
- Fallos de autorización.
- Abuso de endpoints.
- Acceso indebido a documentos privados.

## 22.5. Integridad bíblica

Comparar el contenido importado con la fuente verificada.

Comprobar:

- Todos los libros previstos.
- Orden de capítulos.
- Integridad de versículos.
- Caracteres especiales.
- Referencias.
- Diferencias de numeración.
- Repetibilidad de la importación.

No aceptar la biblioteca si existen errores de contenido conocidos sin resolver.

## 22.6. Calendario litúrgico

Probar fechas representativas de:

- Días ordinarios.
- Domingos.
- Solemnidades.
- Transiciones de año litúrgico.
- Cambios de ciclo.
- Año bisiesto.
- Cambios de horario.
- Lecturas alternativas.
- Pasajes no disponibles para reproducción completa.

Comparar los resultados con referencias litúrgicas autorizadas.

---

# 23. CRITERIOS DE ACEPTACIÓN

El proyecto solo se considerará terminado cuando se cumplan simultáneamente las siguientes condiciones.

## 23.1. Funcionalidad

- Las cinco secciones principales funcionan.
- Los visitantes pueden leer sin registrarse.
- Los visitantes no acceden al contenido comunitario.
- Los usuarios pueden registrarse y participar.
- Los comentarios y likes persisten.
- Los debates y propuestas funcionan.
- La reputación se calcula correctamente.
- Los perfiles y preferencias funcionan.
- La administración y moderación son operativas.
- La IA responde utilizando fuentes verificables.
- Las lecturas diarias pueden enviarse realmente.
- Las automatizaciones se ejecutan de forma fiable.

## 23.2. Integridad y derechos

- Todas las ediciones publicadas cuentan con procedencia documentada.
- No hay contenido bíblico procedente de la edición protegida de la Universidad de Navarra.
- No se han inventado versículos.
- La biblioteca inicial está íntegra.
- Las referencias litúrgicas y los textos enviados son coherentes.
- Las licencias de documentos y recursos están revisadas.

## 23.3. Seguridad

- No existen vulnerabilidades críticas conocidas sin resolver.
- Los permisos se aplican realmente en servidor y base de datos.
- Las claves y credenciales están protegidas.
- Los datos privados no se exponen a visitantes.
- La gestión de datos personales ha superado la revisión jurídica requerida.

## 23.4. Calidad

- Experiencia completa en móvil y escritorio.
- Pruebas críticas satisfactorias.
- Ausencia de errores bloqueantes.
- Accesibilidad revisada.
- Rendimiento medido.
- Monitorización operativa.
- Copias y restauración comprobadas.

## 23.5. Operación

- Documentación de instalación y despliegue.
- Variables de entorno identificadas.
- Manual administrativo esencial.
- Procedimiento de recuperación.
- Registro de fuentes y licencias.
- Control de consumos.
- Entorno de producción preparado.
- Autorización del propietario para la apertura pública.

**Una función solamente se considerará completada cuando tenga código operativo, persistencia real cuando corresponda, permisos correctos y pruebas satisfactorias.**

---

# 24. ENTREGABLES OBLIGATORIOS

El desarrollador entregará:

1. Código fuente completo.
2. Arquitectura técnica implementada.
3. Esquema de base de datos.
4. Migraciones versionadas.
5. Importador bíblico reproducible.
6. Manifiesto de fuentes y derechos.
7. Aplicación web completa.
8. Panel administrativo.
9. Integración de IA.
10. Sistema de lecturas diarias y correo.
11. Pruebas automatizadas.
12. Informe de resultados de pruebas.
13. Documentación de instalación y despliegue.
14. Instrucciones de administración y mantenimiento.
15. Procedimiento de respaldo y restauración.
16. Informe de seguridad y privacidad.
17. Relación de servicios externos y costes estimados.
18. Evidencia de funcionamiento de cada módulo.
19. Inventario de incidencias abiertas, si existieran.
20. Informe final de preparación para publicación.

Los entregables deberán conservarse de forma organizada y trazable en el repositorio o en los sistemas documentales vinculados al proyecto.

---

# 25. PROTOCOLO DE TRABAJO AUTÓNOMO

## 25.1. Antes de actuar

Consultar solamente la documentación vigente necesaria para la tarea.

No repetir auditorías completas cuando ya exista un resultado válido y no se hayan producido cambios relevantes.

## 25.2. Durante el desarrollo

- Trabajar por funcionalidades completas.
- Realizar cambios acotados.
- Ejecutar pruebas relevantes.
- Integrar avances verificados.
- Documentar únicamente las decisiones importantes.
- Priorizar la eliminación de bloqueos reales.
- Mantener la aplicación ejecutable.

## 25.3. Gestión de Git

- Respetar el repositorio y sus protecciones.
- Minimizar ramas innecesarias.
- Permitir cambios menores directamente en `main` cuando las políticas del repositorio lo admitan y sea seguro.
- Utilizar ramas o PR cuando aporten valor real para aislar cambios significativos.
- Evitar conflictos y desarrollos paralelos redundantes.
- Nunca sobrescribir trabajo existente sin comprobar su procedencia.
- No efectuar operaciones Git destructivas sin autorización expresa.

## 25.4. Cuándo solicitar intervención del propietario

Solicitarla únicamente cuando resulte imprescindible, por ejemplo:

- Credenciales que no estén disponibles.
- Autorización para gastos o contratación de servicios.
- Elecciones jurídicas o editoriales no delegables.
- Acciones irreversibles sobre datos reales.
- Cambios materiales del alcance aprobado.
- Publicación pública definitiva.
- Bloqueos imposibles de resolver con los recursos disponibles.

No solicitar aprobación para nombres de funciones, organización interna, bibliotecas ordinarias, detalles visuales secundarios o decisiones técnicas reversibles.

## 25.5. Comunicación

Los informes de avance deberán ser breves y verificables:

- Qué se ha terminado.
- Qué pruebas se han ejecutado.
- Qué queda pendiente.
- Qué bloqueos reales existen.
- Qué decisión, si alguna, requiere intervención.

No emitir largos informes repetitivos.

No declarar trabajo completado cuando únicamente está previsto.

---

# 26. DEFINICIÓN DE TERMINACIÓN DEL PROYECTO

El proyecto Scriptura Web estará terminado cuando:

**1.** Se hayan implementado las 25 decisiones vinculantes.

**2.** Las funcionalidades funcionen integradas y con datos reales o autorizados.

**3.** La base de datos y los servicios externos operen correctamente.

**4.** Las Escrituras publicadas estén verificadas y documentadas.

**5.** La comunidad sea funcional, segura y moderable.

**6.** La inteligencia artificial utilice la biblioteca documental y pueda justificar sus respuestas.

**7.** El envío diario de lecturas funcione con programación personalizada.

**8.** La administración permita gestionar la plataforma sin modificar el código para las tareas ordinarias.

**9.** Las pruebas esenciales sean satisfactorias y los riesgos legales y de seguridad relevantes estén resueltos.

**10.** La aplicación esté desplegada en un entorno de producción preparado y protegida hasta su apertura autorizada.

No sustituir evidencias de ejecución por afirmaciones genéricas de que todo funciona.

---

# 27. INSTRUCCIÓN EJECUTIVA FINAL

Comienza verificando el repositorio Scriptura y auditando su estado real.

Selecciona la arquitectura definitiva utilizando los criterios de este documento.

A continuación, ejecuta el desarrollo completo siguiendo las fases establecidas, con autonomía técnica y sin replantear las decisiones aprobadas.

**La prioridad es terminar Scriptura con calidad profesional, no multiplicar fases, documentación, consultas y validaciones.**

Aplica estos principios en todo momento:

**CALIDAD SIN PERFECCIONISMO IMPRODUCTIVO.**

**AUTONOMÍA SIN IMPROVISACIÓN FUNCIONAL.**

**SEGURIDAD SIN BUROCRACIA INNECESARIA.**

**CÓDIGO REAL, DATOS REALES Y PRUEBAS REALES.**

**NINGUNA FUNCIONALIDAD FICTICIA.**

**NINGUNA VALIDACIÓN REDUNDANTE.**

**NINGUNA PUBLICACIÓN PREMATURA.**

No detengas la ejecución por decisiones menores.

No introduzcas funciones nuevas que desvirtúen el producto.

No anuncies como completado algo que no haya sido comprobado.

**Tu responsabilidad es entregar Scriptura Web terminada, verificable, documentada y preparada para su publicación, respetando íntegramente esta especificación.**
