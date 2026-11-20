# Respuestas — TP 4 "Biblioteca IPF"

Las respuestas citan archivos y líneas de este repositorio. Las marcadas con **⚠️ Verificar** dependen
de lo que se observa en el teléfono y hay que confirmarlas probando la app.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

**a) Render por render** (`src/hooks/useLibros.ts`)

Caso exitoso:

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
| ------ | -------- | ---------- | ------- | -------------- |
| 1 | `[]` | `true` | `null` | Montaje del Catálogo. Después del render corre el efecto (líneas 22-49), que llama a `obtenerLibros()`. Se ve el indicador de carga. |
| 2 | 13 libros | `false` | `null` | A los 800 ms llega la respuesta: `setLibros(datos)` (línea 31) y `setCargando(false)` (línea 39). Las dos actualizaciones ocurren en la misma continuación del `await`, así que React las agrupa en **un solo render**. |

Total: **2 renders**.

Cuando `obtenerLibros()` falla y la persona toca "Reintentar":

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
| ------ | -------- | ---------- | ------- | -------------- |
| 1 | `[]` | `true` | `null` | Montaje. |
| 2 | `[]` | `false` | mensaje | La promesa se rechaza: `setError` (línea 35) y `setCargando(false)` en el `finally` (línea 39), agrupados. Se ve `MensajeError` con "Reintentar". |
| 3 | `[]` | `true` | `null` | `reintentar()` (líneas 51-55) hace `setError(null)`, `setCargando(true)` e incrementa `intento`, agrupados por ser un evento. Como `intento` cambió, React ejecuta la limpieza del efecto anterior y lo vuelve a correr. |
| 4 | 13 libros | `false` | `null` | Llega la respuesta del nuevo pedido. |

**b) ¿Se desmonta el Catálogo?** ⚠️ Verificar con un `console.log` temporal en la limpieza (líneas 46-48) y después borrarlo.

- **Al cambiar a "Mis reservas":** no se desmonta. Las tabs no apilan pantallas: mantienen montadas las que ya se visitaron y solo cambian cuál se ve, así que la limpieza no corre.
- **Al abrir un detalle:** tampoco. El detalle se apila encima en el Stack de la pestaña y el Catálogo queda montado debajo.
- **Cuándo corre la limpieza en la práctica:** cuando se toca "Reintentar", porque cambia `intento` y se descarta el pedido anterior. También cuando el Catálogo realmente se desmonta: al cerrar la app, al recargarla en desarrollo o si el navegador lo saca de la pila.

**c) ¿Por qué no se puede pasar una función `async` a `useEffect`?**
Una función `async` siempre devuelve una promesa, y `useEffect` espera que el callback devuelva `undefined` o una función de limpieza. Si devolviera una promesa, React no tendría una limpieza para ejecutar. Lo resolví declarando una función `async` **dentro** del efecto (`cargar`, líneas 27-42), llamándola (línea 44) y devolviendo la limpieza de forma sincrónica (líneas 46-48).

**d) ¿Cómo implementé `reintentar`?**
Con un contador `intento` en el estado (línea 20) que está en el array de dependencias del efecto (línea 49). `reintentar()` lo incrementa (línea 54), React ve que la dependencia cambió, ejecuta la limpieza del efecto anterior y vuelve a correrlo, lo que hace un pedido nuevo.

Usé un contador y no `error` o `cargando`, porque esos valores también los cambia el propio efecto. Con `error` en las dependencias, cada falla dispararía otro pedido automático, en un bucle sin que la persona haga nada. El contador solo cambia cuando la persona toca el botón: expresa exactamente la intención de "volver a pedir".

### B2. La condición de carrera del buscador

En mi buscador (`src/app/buscar.tsx`) además hay *debounce*: se espera 300 ms sin escribir antes de pedir (líneas 43-54). La tabla supone que los dos pedidos llegaron a salir.

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
| ------- | -------- | ----------------------- | ------------------------ |
| t = 0 ms | Escribe "bor" → `buscarLibros("bor")` (1.400 ms) | "Buscando…" | "Buscando…" |
| t = 200 ms | Escribe "borges" → `buscarLibros("borges")` (300 ms) | "Buscando…" | "Buscando…". La limpieza del efecto de "bor" ya corrió y marcó `cancelado = true`. |
| t = 500 ms | Llega "borges" | Resultados de "borges" | Resultados de "borges" |
| t = 1.400 ms | Llega "bor" | **Resultados de "bor"**, aunque el campo dice "borges". La respuesta vieja pisa a la nueva. | Siguen los de "borges": la respuesta de "bor" se ignora. |

En mi catálogo "bor" y "borges" coinciden con los mismos dos libros, así que la diferencia no se nota a simple vista. Con un catálogo más grande, "bor" podría traer libros que no corresponden a la búsqueda actual.

**a) Qué hace la limpieza** (líneas 56-59): pone `cancelado = true` y cancela el temporizador con `clearTimeout`. La respuesta que llega después pasa por `if (!cancelado)` (líneas 46 y 50) y no actualiza el estado. Además, el resultado guarda para qué consulta era (línea 47), y la pantalla solo lo muestra si coincide con la consulta actual (línea 74).

La limpieza se ejecuta **antes de volver a correr el efecto**, cuando cambia `consulta` (cada letra, porque cambia `q` en la URL), y cuando la pantalla se desmonta.

**b) La propuesta `if (texto === q)` dentro del `.then()`** no funciona. Esa función se creó en el render en el que se hizo la búsqueda, y por clausura "ve" el `q` de **ese** render, que es el mismo valor que se buscó. La comparación siempre da `true`, aunque la persona ya haya escrito otra cosa: la clausura guarda el valor viejo, no el actual.

Para que sirviera habría que comparar con un valor que se lea en el momento, por ejemplo un `useRef` actualizado con la consulta actual. En mi código la comparación de la línea 74 sí funciona, porque se hace **durante el render**, con la consulta actual contra la consulta guardada en el resultado.

**c) URL y botón atrás.** Mientras se escribe, la URL cambia en cada letra (`/buscar?q=b`, `?q=bo`…) por `router.setParams` (línea 65). `setParams` actualiza los parámetros de la pantalla actual **sin apilar** pantallas nuevas, así que "atrás" sale del buscador de una vez.

Con `router.push` cada letra apilaría una pantalla `/buscar` nueva: habría que tocar "atrás" una vez por letra, y cada pantalla haría su propia búsqueda.

### B3. Mutar o reemplazar

**a)** Muestra **0**. `encolar` modifica el objeto que ya está en el estado (mutación), pero no se llama a ningún `setState`. React no se entera del cambio y no vuelve a renderizar. Los datos internos tienen 3 personas, pero la pantalla sigue mostrando el valor del último render.

**b)** El `TextInput` controlado llama a su `setState` en cada letra. Eso provoca un render, y en ese render se lee `espera.tamanio`, que ya vale 3: el número "salta". Un error que aparece "a veces" es peor que uno que aparece siempre, porque depende de algo ajeno (que otro estado provoque un render). Es difícil de reproducir, puede pasar las pruebas y aparecer frente a la persona usuaria, y hace pensar que el problema está en otra parte.

**c) Cómo lo resolví.** En el Context nunca modifico la estructura guardada en el estado: creo una nueva a partir de la anterior.

- Pila de recientes: `new Pila(anterior.aArray())` y después `apilar` (`src/context/biblioteca.tsx`, líneas 88-96).
- Cola de espera al reservar: `new Cola(enEspera(isbn))`, después `encolar` y `setEsperas` (líneas 157-159).
- Al entregar al siguiente: líneas 214-219.

| Alternativa | Ventaja | Costo |
| ----------- | ------- | ----- |
| Estructura nueva a partir de la anterior (mi solución) | React detecta el cambio por referencia; el estado viejo no se toca, así que no hay sorpresas | Copia los elementos en cada cambio (O(n)); con listas de espera chicas no importa |
| Contador de versión (`setVersion(v => v + 1)` después de mutar) | No copia nada | La mutación queda escondida; si en algún lugar se olvida incrementar, vuelve el error de B3; y los `useMemo` o efectos que dependen de la estructura no ven el cambio, porque la referencia es la misma |
| `useReducer` que devuelve estructuras nuevas | Toda la lógica de cambios queda en un solo lugar y es fácil de testear | Más código (acciones, tipos, reducer) para una app de este tamaño |

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en mi app | Por qué ahí |
| ---- | -------------------- | ----------- |
| Texto del buscador | **URL** (`q`), con una copia en estado local (`texto`) solo para el campo (`buscar.tsx`, líneas 28-30) | En la URL se puede compartir y abrir con un deep link (`bibliotecaipf://buscar?q=borges`). La copia local evita que el cursor salte mientras se escribe. |
| Préstamos y reservas | **Context** (`prestamos`, línea 73) | Los escriben el modal de reserva y el mostrador, y los leen el detalle, el Catálogo y "Mis reservas": varias pantallas en navegadores distintos. |
| Listas de espera | **Context** (`esperas`: `Record<isbn, Cola>`, línea 74) | Las comparten "Mis reservas", el detalle y el mostrador. |
| Vistos recientemente | **Context** (`vistos`, una `Pila`, línea 71) | Se escriben en el detalle y se leen en el Catálogo. |
| Sesión del personal | **Context** (`sesionIniciada`, línea 72) | La lee `NavegacionRaiz` para los `Stack.Protected`, y también el link "Personal". |
| Ejemplares disponibles | **Se calcula** (`disponibles()`, líneas 112-121) | Se deriva del estante inicial y los préstamos activos. Guardarlo aparte duplicaría el dato (ver E4d). |
| Estado del permiso de cámara | **Sistema operativo**. La app tiene una copia en el estado de `useCameraPermissions` y la vuelve a consultar al enfocar y al volver a la app (`usePermiso.ts`, líneas 20-21) | La persona puede cambiarlo desde Ajustes en cualquier momento: la fuente de verdad es el sistema. |
| Identificador de la notificación programada | **Context**, dentro de cada `Prestamo` (`idNotificacion`). La notificación en sí la guarda el sistema operativo | Va junto al préstamo porque se usa al desactivar "Recordarme" y al devolver (líneas 163-170 y 196-202). |

**¿Qué componentes se vuelven a renderizar?** Cuando cambia el `value` del Context se vuelven a renderizar **todos los componentes que lo consumen** con `useBiblioteca()`, aunque solo usen una parte. El `value` es un objeto nuevo en cada render del provider (líneas 253-283).

El Catálogo usa `VistosRecientemente` y `FilaLibro`, que leen el Context. Al activar un recordatorio en "Mis reservas" cambia `prestamos`, así que esos componentes se vuelven a renderizar aunque la pestaña no se vea, porque sigue montada.

Para evitarlo se podría dividir el Context en varios (sesión, recientes, préstamos), memorizar el `value` o usar selectores. En una app de este tamaño no vale la pena: son pocas filas y el render es barato. Además el React Compiler (`reactCompiler: true` en `app.json`) evita trabajo de más dentro de cada componente. Lo haría solo si el Profiler mostrara un problema real.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

⚠️ Verificar los pasos 5 y 6 en el teléfono.

| # | Acción | Pilas resultantes |
| - | ------ | ----------------- |
| 1 | Abre la app | Stack raíz: `[(tabs)]` · Tabs: Catálogo activa · Stack Catálogo: `[index]` |
| 2 | Toca un libro | Stack raíz: `[(tabs)]` · Stack Catálogo: `[index, libro/X]` |
| 3 | Toca "Reservar" | Stack raíz: `[(tabs), reservar/X (modal)]` · Stack Catálogo: `[index, libro/X]` |
| 4 | Toca "Confirmar" | Stack raíz: `[(tabs)]` · Tabs: Mis reservas activa · Stack Catálogo sigue `[index, libro/X]` |
| 5 | Atrás (Android) | Las tabs vuelven a la primera pestaña: Catálogo activa, mostrando `libro/X` |
| 6 | Toca la tab "Catálogo" | Tocar la pestaña que ya está activa vuelve al inicio de su pila: Stack Catálogo `[index]` |

**a)** En el paso 4 uso `router.dismiss()` y después `router.navigate('/reservas')` (`src/lib/navegacion.ts`, líneas 5-8).

- **`dismiss()`** saca el modal de la pila raíz, así que "atrás" no puede volver a la confirmación.
- **`navigate('/reservas')`** cambia a la pestaña "Mis reservas" sin crear otra.
- **Con `push('/reservas')`**, el modal quedaría debajo y "atrás" volvería a la confirmación (el error que pide evitar la consigna). Además se apilaría otra instancia de las tabs.
- **Con `replace`**, el modal se reemplazaría por las tabs dentro de la pila raíz, que ya las tiene debajo: se duplicaría el navegador de pestañas.
- **`dismissTo('/reservas')`** desapila hasta encontrar esa ruta. Como `/reservas` está **dentro** de `(tabs)`, el comportamiento depende de cómo resuelva la ruta anidada.

Elegí `dismiss` + `navigate` porque cada paso hace una sola cosa y es explícito.

**b)** En el paso 5 la persona ve el **detalle**: cada pestaña conserva su propia pila, y la del Catálogo seguía con `[index, libro/X]`. En el paso 6, tocar la pestaña activa la lleva al inicio de su pila y se ve el **Catálogo**.

Me parece correcto: volver a "Catálogo" desde otra pestaña muestra lo que la persona estaba mirando, y tocar la pestaña otra vez es la forma conocida de "volver al principio".

### C2. El escáner que dispara de más

**a)** `onBarcodeScanned` se llama muchas veces por segundo mientras el código está frente a la cámara. Sin protección, cada llamada haría un `router.push`. Cada acción se **encola** en la cola de navegación de Expo Router (`routingQueue`, FIFO, como vimos en el TP 2), y después se ejecutan todas en orden: se apilarían varias pantallas de detalle iguales, y habría que tocar "atrás" muchas veces.

**b)** Usé **`useRef`** (`escanear.tsx`, líneas 25-27 y 40). Un `useState` puesto en `true` en el primer escaneo no alcanza: el nuevo valor recién está disponible en el **próximo render**. Las llamadas a `onBarcodeScanned` que llegan antes de ese render usan la función creada en el render anterior, que por clausura ve todavía `false`, y vuelven a navegar. En cambio `ref.current = true` cambia el valor en el momento, y la siguiente llamada ya lo ve (línea 46).

**c)** Con `router.replace` (línea 42) la pantalla del escáner se **reemplaza** por el detalle dentro del Stack del Catálogo: al tocar "atrás" se vuelve al Catálogo. Con `push`, "atrás" volvería al escáner con la cámara encendida, que podría volver a leer el mismo código y abrir el detalle de nuevo.

**d)** Si el ISBN no está en el catálogo, la app muestra un aviso dentro de la pantalla ("El código … no está en el catálogo…") y la cámara sigue activa (líneas 53-58). Para que el aviso no aparezca diez veces, guardo el último código desconocido en un `useRef` (`ultimoDesconocido`, línea 28): si llega el mismo código, se ignora (líneas 54-56). Si se escanea otro, se actualiza el aviso.

### C3. Deep links y rutas protegidas

⚠️ Verificar cada fila en Expo Go con `exp://<IP>:8081/--/<ruta>`.

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte del código lo decide |
| ---- | ----------------- | --------------------------- | ------------------------------ |
| `bibliotecaipf://libro/9789870001010` | Detalle de *Ficciones* | El Catálogo (`index`) en el Stack de la pestaña | `anchor: 'index'` en `src/app/(tabs)/(catalogo)/_layout.tsx` y `anchor: '(tabs)'` en `src/app/_layout.tsx` (líneas 9-11) |
| `bibliotecaipf://libro/123` | "123 no es un ISBN válido" con "Ir al Catálogo" | El Catálogo | `libro/[isbn].tsx`, líneas 18 y 27-36 (`esIsbnValido`) |
| `bibliotecaipf://buscar?q=borges` | Buscador con "borges" y sus resultados | Las pestañas | `anchor: '(tabs)'` (`_layout.tsx`, líneas 9-11) y `useLocalSearchParams` (`buscar.tsx`, línea 28) |
| `bibliotecaipf://mostrador` (sin sesión) | No se abre el mostrador: la ruta no existe sin sesión. ⚠️ Anotar qué pantalla muestra Expo Router | Las pestañas | `Stack.Protected guard={sesionIniciada}` (`NavegacionRaiz.tsx`, líneas 33-35) |
| `bibliotecaipf://reserva` | "Mis reservas" | Las pestañas; `/reserva` no queda en el historial | `<Redirect href="/reservas" />` (`reserva.tsx`) |
| `bibliotecaipf://escanear` (cámara bloqueada) | Escáner con el mensaje de bloqueo, "Abrir Ajustes" y el campo para el ISBN a mano | El Catálogo | `escanear.tsx`, líneas 92-102 y 115; `permisos.ts`, línea 20 |

**¿Por qué `/libro/123` llega al detalle?** Porque `[isbn]` es un segmento dinámico: la ruta acepta **cualquier** texto en esa posición. Expo Router solo mira la forma de la URL, no si el dato existe. La responsabilidad de responder bien es de **la pantalla**: validar que sean 13 dígitos y que el libro exista, y mostrar un mensaje claro con una salida (`libro/[isbn].tsx`, líneas 17-45).

### C4. Foco, montaje y primer plano

**a)**
- **`useEffect` con `[]`** detecta el **montaje** del componente. Corre una vez y la limpieza corre al desmontarse.
- **`useFocusEffect`** detecta cuándo la pantalla **gana el foco dentro de la navegación**: al llegar a ella, al cambiar de pestaña y volver, o al cerrarse un modal que estaba encima.
- **`AppState`** detecta cuándo **la app entera** pasa a segundo plano y vuelve al frente.

**b)**
- **Si la persona va a Ajustes y vuelve,** se entera **`AppState`**. La pantalla no se desmontó ni perdió el foco dentro de la app, así que `useEffect` y `useFocusEffect` no se disparan.
- **Si va al Catálogo y vuelve a "Mis reservas",** se entera **`useFocusEffect`**. `AppState` no cambia, porque la app nunca salió del frente, y `useEffect` con `[]` tampoco, porque la pestaña sigue montada.

**c)** Usé **las dos**, en `usePermiso` (`src/hooks/usePermiso.ts`, líneas 20-21): `useFocusEffect(revisar)` y `useRevisarAlVolver(revisar)`, que usa `AppState` (`useRevisarAlVolver.ts`, líneas 10-16). "Mis reservas" lo usa en `reservas.tsx` (línea 18), y el escáner también.

Si hubiera usado solo `useFocusEffect`, al volver de Ajustes con las notificaciones activadas la pestaña seguiría diciendo "desactivadas" hasta cambiar de pestaña y volver. Si hubiera usado solo `AppState`, después de aceptar el permiso en `/permisos/notificaciones` (un modal dentro de la app) el estado quedaría viejo hasta salir de la app.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara

⚠️ Verificar en un Android 14 real.

| # | Acción | Qué muestra mi app | `status` | `canAskAgain` |
| - | ------ | ------------------ | -------- | ------------- |
| 1 | Toca "Escanear" por primera vez | "Revisando el permiso…" y enseguida la pantalla previa `/permisos/camara` con el beneficio y "Continuar" (`escanear.tsx`, líneas 32-37) | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | Vuelve al escáner con el texto del beneficio, "Usar la cámara" y el campo del ISBN a mano | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | Pantalla previa con "Continuar" | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | Escáner en estado bloqueado: "La cámara está desactivada…", "Abrir Ajustes" e ISBN a mano | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | Directamente el estado bloqueado, con "Abrir Ajustes" e ISBN a mano | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita → vuelve | La cámara funcionando | `granted` | `true` |

**a) En iOS** el sistema muestra el diálogo **una sola vez**. Después del primer "No permitir" (paso 2), `canAskAgain` ya es `false`: mi app pasa directamente al estado bloqueado, con "Abrir Ajustes" e ISBN a mano. En el paso 3 no aparece la pantalla con "Continuar", y el paso 4 no existe.

**b) La línea que decide** está en `src/lib/permisos.ts:20`:

```ts
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

`ExplicacionPermiso.tsx` (línea 31) y `escanear.tsx` (líneas 85-102) muestran "Continuar" o "Abrir Ajustes" según ese estado. Uso `canAskAgain`, porque `status` vale `'denied'` tanto después de la primera negativa (cuando Android todavía puede volver a preguntar) como cuando ya quedó bloqueado. Solo con `status` mostraría "Continuar" en un caso donde el diálogo nunca va a aparecer, y el botón no haría nada.

**c) Quién se entera de la vuelta desde Ajustes:** `useRevisarAlVolver` (`src/hooks/useRevisarAlVolver.ts`, líneas 10-16), que escucha `AppState` y vuelve a consultar el permiso cuando la app pasa de segundo plano a `active`. Lo usa `usePermiso` (línea 21). Si no existiera, la app seguiría mostrando "Abrir Ajustes" aunque el permiso ya esté concedido, hasta salir de la pantalla y volver a entrar.

### D2. Notificaciones y consistencia

**a)** Si no cancelara la notificación, a los 15 segundos llegaría "Acordate de devolver…" de un libro **que ya devolvió**: un aviso falso que hace desconfiar de la app. Por eso `devolver()` cancela la notificación programada (`src/context/biblioteca.tsx`, líneas 163-170). También la cancela `desactivarRecordatorio()` (líneas 196-202). Y si la persona desactiva el interruptor o devuelve el libro **mientras** se programaba, `activarRecordatorio()` la cancela apenas obtiene el id (líneas 183-188).

**b)** El identificador se guarda en el **estado del Context**, en el campo `idNotificacion` de cada préstamo (líneas 189 y 172-176). Ese estado vive en memoria.

Si la app se cierra antes de que llegue, **la notificación sigue programada en el sistema operativo y llega igual**. En cambio **el identificador se pierde**: al volver a abrir la app no hay préstamos en memoria ni forma de cancelar esa notificación. Queda un aviso "huérfano" que no se puede cancelar desde la app.

Lo resolvería persistiendo los préstamos con sus identificadores (por ejemplo con `@react-native-async-storage/async-storage`). Al iniciar, compararía con `Notifications.getAllScheduledNotificationsAsync()` y cancelaría las que no correspondan a un préstamo activo.

**c)** En Android 13 o superior las notificaciones necesitan el permiso en tiempo de ejecución `POST_NOTIFICATIONS`, y el sistema asocia el diálogo a los canales de la app: si la app no tiene ningún canal, el pedido puede no mostrar el diálogo. Por eso `pedirPermisoNotificaciones()` crea el canal `prestamos` antes de pedir (`src/lib/notificaciones.ts`, líneas 33-36 y 20-27).

En Android 12 no existe ese permiso en tiempo de ejecución: las notificaciones están permitidas desde la instalación y el pedido devuelve `granted` sin mostrar diálogo. El canal igual hace falta (desde Android 8) para poder mostrarlas.

**d)** Si el permiso está denegado, me entero por un **aviso dentro de la app**, que aparece arriba de "Mis reservas". El código que decide está en `avisarEntrega()` (`src/context/biblioteca.tsx`, líneas 229-240):

```ts
if (await puedeNotificar()) {
  await avisarLibroEntregado(titulo);
  return;
}
// …
agregarAviso(`¡Ya podés retirar "${titulo}"! Lo tenés en tus préstamos.`);
```

`puedeNotificar()` (`notificaciones.ts`, líneas 40-43) **consulta el permiso en ese momento** con `getPermissionsAsync()`, no usa un valor guardado. Importa porque la persona puede haber cambiado el permiso desde Ajustes después de la última consulta. Con un valor viejo, la app podría intentar notificar sin permiso, y el aviso se perdería, o mostrar el aviso interno aunque ya se pueda notificar.

### D3. Lo que tu app pide y lo que no

| Plataforma | Permiso o clave declarada | Función que lo justifica | ¿Quién lo agrega? |
| ---------- | ------------------------- | ------------------------ | ----------------- |
| Android | `android.permission.CAMERA` | Escáner de códigos de barras | `expo-camera` (manifiesto de la librería) |
| Android | `android.permission.POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de entrega | `expo-notifications` |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Conservar las notificaciones programadas si se reinicia el teléfono | `expo-notifications` |
| iOS | `NSCameraUsageDescription` ("Usamos tu cámara para leer el código de barras…") | Escáner | Plugin `expo-camera` con `cameraPermission` en `app.json` |
| iOS | Notificaciones: no requieren clave en `Info.plist`, se piden en tiempo de ejecución | Recordatorios | `expo-notifications` |

**a)** `expo-camera` puede grabar video con sonido, por eso normalmente declara `RECORD_AUDIO` en Android y `NSMicrophoneUsageDescription` en iOS. Mi app solo lee códigos de barras, así que lo desactivé en `app.json`:

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro sin escribir el ISBN.",
  "microphonePermission": false,
  "recordAudioAndroid": false,
  "barcodeScannerEnabled": true
}]
```

Además `android.blockedPermissions` incluye `android.permission.RECORD_AUDIO`, que lo quita del manifiesto final aunque alguna librería lo agregue.

**b)** Usaría `expo-image-picker` con `launchImageLibraryAsync`. En Android 13 o superior usa el selector de fotos del sistema y en iOS 14 o superior el `PHPicker`: **no necesita permiso**, porque la persona elige la foto en una pantalla del sistema y la app solo recibe la elegida. Igual hace falta una **build nueva**: `expo-image-picker` tiene código nativo, y una actualización OTA solo puede cambiar el JavaScript, no agregar módulos nativos. (En Expo Go funcionaría porque ya lo incluye.)

**c)** En Expo Go no pude verificar del todo:

- **El texto de propósito de la cámara:** el diálogo lo muestra Expo Go con su propio texto, porque el `Info.plist` es el de Expo Go.
- **Que no se declare `RECORD_AUDIO` y que se apliquen los `blockedPermissions`:** el manifiesto es el de Expo Go, que declara muchos permisos.
- **El ícono, el splash y el nombre de la app.**
- **El canal `prestamos`:** aparece dentro de los ajustes de Expo Go, no de una app propia.

Pasa porque Expo Go es una app ya compilada, con su propia configuración nativa, y `app.json` solo se aplica al generar una build propia. Lo verificaría con una development build (`npx expo run:android`, o `eas build --profile development`) y revisando el manifiesto generado con `npx expo prebuild`.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas encontrados**

| Línea | Problema | Tipo | Por qué y cómo corregirlo |
| ----- | -------- | ---- | ------------------------- |
| 10, 22 | `any[]` y `libro: any` | Mala práctica | Se pierde el chequeo de tipos: un error de nombre (`libro.titlo`) recién falla en ejecución. Usar `Libro[]` y `{ libro: Libro }`. |
| 11, 13-16 | Pide cámara y notificaciones **al abrir la app** | Mala práctica | Se piden sin contexto ni pantalla previa, antes de que la persona sepa para qué. Pedir la cámara al tocar "Escanear" (pasando por `/permisos/camara`) y las notificaciones al activar "Recordarme". |
| 13-16 | Falta `pedirPermiso` en las dependencias y las promesas no se manejan | Advertencia | `react-hooks/exhaustive-deps` lo marca. Igual el efecto entero sobra (ver fila anterior). |
| 18-20 | `useEffect` **sin array de dependencias** | Rendimiento / error de ejecución | Corre después de **cada** render y cada respuesta provoca otro render: un bucle infinito de pedidos (ver b). Usar `[]` o un contador para reintentar. |
| 19 | Sin `catch` | Error de ejecución | `obtenerLibros()` falla 1 de cada 5 veces: promesa rechazada sin manejar y la persona no ve nada. Agregar `try/catch` y un estado de error con "Reintentar". |
| 19 | Sin limpieza | Advertencia | Si la pantalla se desmonta o llega una respuesta vieja, igual se hace `setLibros`. Usar una bandera `cancelado` en la limpieza. |
| 18-41 | No hay estado de carga, error ni vacío | Mala práctica | Durante 800 ms la pantalla está en blanco, y si falla queda en blanco para siempre. |
| 22-30 | Componente `Fila` declarado **dentro** de `Catalogo` | Rendimiento | En cada render `Fila` es una función nueva: React la trata como otro tipo de componente y desmonta y vuelve a montar todas las filas. Moverlo a `src/components/FilaLibro.tsx`. |
| 24 | `'/libro/' + libro.isbn` | Mala práctica | Arma la ruta como texto y pierde las rutas tipadas. Usar `{ pathname: '/libro/[isbn]', params: { isbn } }`. |
| 25 | Estilo en línea y color fijo `'#333'` | Mala práctica | Se crea un objeto nuevo en cada render y el color no sale del tema. Usar `StyleSheet.create` y `Colores` de `tema.ts`. |
| 33-36 | `ScrollView` con `map` | Rendimiento | Renderiza todos los libros juntos aunque no se vean. Usar `FlatList`. |
| 35 | `key={i}` | Advertencia / error lógico | Si la lista cambia de orden, React asocia el estado de una fila con otro libro. Usar `keyExtractor={(libro) => libro.isbn}`. |
| 37-39 | Botón con solo un ícono, sin `accessibilityRole` ni `accessibilityLabel`, de 28 × 28 | Mala práctica (accesibilidad) | Un lector de pantalla no sabe qué hace y el área táctil es menor a 44 × 44. Agregar `accessibilityRole="button"`, `accessibilityLabel="Escanear"` y tamaño mínimo. |
| 11 | `permiso` declarado y nunca usado | Advertencia | El lint lo marca. Desaparece al sacar el pedido de permisos de esta pantalla. |

**b) El efecto sin dependencias durante el primer minuto:**

1. Render 1 con `[]`. Después corre el efecto y llama a `obtenerLibros()`.
2. A los 800 ms llega un array **nuevo** (cada respuesta trae copias). `setLibros` recibe una referencia distinta y React vuelve a renderizar.
3. Después de ese render el efecto corre otra vez, porque no tiene dependencias, y hace otro pedido.
4. Se repite cada ~800 ms: unos **75 pedidos por minuto**. Gasta batería y datos, y 1 de cada 5 falla sin `catch`, así que aparecen errores de promesas sin manejar.

Si `obtenerLibros()` devolviera **siempre el mismo array**, el bucle se cortaría. En el segundo pedido `setLibros` recibiría la misma referencia que ya está en el estado, y React compara con `Object.is`: si es igual, no vuelve a renderizar, y sin render el efecto no vuelve a correr. Habría solo **2 pedidos**. El problema de fondo (que el efecto corre de más) sigue ahí: solo queda escondido.

**c) Reescrita con los hooks, componentes y constantes de mi app** (es mi `src/app/(tabs)/(catalogo)/index.tsx`):

```tsx
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { AccesosCatalogo } from '@/components/AccesosCatalogo';
import { Cargando } from '@/components/Cargando';
import { FilaLibro } from '@/components/FilaLibro';
import { ListaVacia } from '@/components/ListaVacia';
import { MensajeError } from '@/components/MensajeError';
import { TituloSeccion } from '@/components/TituloSeccion';
import { VistosRecientemente } from '@/components/VistosRecientemente';
import { Espaciado } from '@/constants/tema';
import { useLibros } from '@/hooks/useLibros';

function abrirLibro(isbn: string) {
  router.push({ pathname: '/libro/[isbn]', params: { isbn } });
}

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} onPress={() => abrirLibro(item.isbn)} />}
      contentContainerStyle={styles.contenido}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          <VistosRecientemente onAbrir={abrirLibro} />
          <AccesosCatalogo />
          <TituloSeccion>Todos los libros</TituloSeccion>
        </View>
      }
      ListEmptyComponent={
        cargando ? (
          <Cargando mensaje="Cargando el catálogo…" />
        ) : error ? (
          <MensajeError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />
        ) : (
          <ListaVacia mensaje="El catálogo está vacío por ahora." />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  contenido: { gap: Espaciado.sm, padding: Espaciado.lg },
  encabezado: { gap: Espaciado.lg, marginBottom: Espaciado.sm },
});
```

El botón de escanear con ícono está en `AccesosCatalogo`, como un `Boton` con texto, `accessibilityRole` y 44 de alto mínimo. Los permisos ya no se piden acá.

**d)**
- **Rechazo en una tienda:** pedir cámara y notificaciones **al abrir la app, sin contexto** (líneas 13-16). Apple exige que el pedido se entienda en el momento y que se explique el uso (guía 5.1.1), y Google Play revisa los permisos que no se justifican en el flujo de la app. Pedir notificaciones en un catálogo, sin motivo visible, es una señal clara.
- **Lo que haría desinstalarla primero:** el **efecto sin dependencias**. Hace pedidos sin parar, gasta batería y datos, y si la red falla la pantalla queda en blanco sin explicación. Sumado a los dos diálogos de permisos apenas se abre, la primera impresión es mala.

### E2. Organización y acoplamiento

**a) Quién importa a quién:**

```
app ─────────► components, hooks, lib, constants, types
components ──► components, hooks, lib, constants, types
hooks ───────► context, lib, types
context ─────► estructuras, lib, data, constants, types
lib ─────────► data, constants, types
data ────────► types
estructuras ─► (nada)
constants ───► lib (solo tipos: Recurso en constants/permisos.ts), types de expo-router
types ───────► (nada)
```

No hay importaciones "hacia arriba": ningún hook, componente ni archivo de `lib` importa algo de `src/app`. Sería un problema porque `src/app` son las rutas, los puntos de entrada. Si un hook dependiera de una pantalla, mover o renombrar una ruta (que cambia la URL) rompería código que no tiene nada que ver con la navegación. También se pueden formar ciclos de importación difíciles de seguir.

La única dependencia "lateral" a revisar es `constants/permisos.ts`, que importa el **tipo** `Recurso` de `lib/permisos.ts`. Es solo un tipo, pero podría moverse a `src/types`.

**b) Si el catálogo viniera de una API real**, cambiarían:

1. `src/lib/api.ts`: `fetch` en lugar de la simulación.
2. `src/lib/catalogo.ts`: `buscarPorIsbn` lee `LIBROS` en forma sincrónica.
3. `src/data/libros.ts`: dejaría de existir, o quedaría solo `ESPERA_INICIAL`.
4. Las pantallas que buscan un libro por ISBN en forma sincrónica (detalle, reserva, `ItemPrestamo`, `ItemEspera`, `ItemMostrador`) y `disponibles()` en el Context: pasarían a esperar datos y necesitarían estados de carga y error.

Son más de dos archivos. Eso dice que la búsqueda por ISBN quedó acoplada a que los datos estén en memoria al instante. Una mejora sería tener una sola fuente del catálogo (por ejemplo, guardar en el Context lo que trae `useLibros` y un hook `useLibro(isbn)`), así el cambio quedaría en `api.ts` y en ese hook.

**c) `<ConPermiso recurso="camara">…</ConPermiso>`**

- **Ganaría:** menos código repetido y una forma declarativa de decir "esto necesita cámara".
- **Perdería:** el componente decide qué mostrar en cada estado, y eso le quita flexibilidad a la pantalla. En mi escáner, el campo del ISBN a mano se ve **siempre**, en los cuatro estados, junto con la cámara o con el mensaje. También perdería la pantalla previa como **ruta** propia (`/permisos/camara`), que se puede abrir desde cualquier lugar.
- **Para las notificaciones no sirve:** no se piden al abrir una pantalla, sino al **activar un interruptor** en un préstamo (`ItemPrestamo.tsx`, líneas 21-33). No hay nada que "envolver". Con `usePermiso`, la misma lógica de los cuatro estados sirve para los dos casos: el escáner muestra una cosa u otra, y el interruptor decide si programa el recordatorio o abre la pantalla previa.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
| --------- | ----------------- | --------------- |
| `obtenerLibros()` falla | "No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo." con botón "Reintentar" | `src/hooks/useLibros.ts:33-36`, `src/app/(tabs)/(catalogo)/index.tsx:34-42` |
| Se abre `/libro/abc` | "abc no es un ISBN válido. Un ISBN tiene 13 números, sin guiones." con "Ir al Catálogo" | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:18, 27-36` |
| Se escanea un ISBN que no está en el catálogo | Aviso "El código … no está en el catálogo…", una sola vez, y la cámara sigue activa | `src/app/(tabs)/(catalogo)/escanear.tsx:53-58` |
| La cámara está bloqueada | Mensaje de cámara desactivada, "Abrir Ajustes" y el campo para escribir el ISBN | `escanear.tsx:92-102, 115`; `src/lib/permisos.ts:20` |
| Las notificaciones están denegadas | En "Mis reservas", "Notificaciones desactivadas: los avisos te aparecen acá…"; los avisos de entrega aparecen como tarjetas dentro de la app | `src/context/biblioteca.tsx:229-240`; `src/components/ItemPrestamo.tsx:21-33`; `src/components/EstadoNotificaciones.tsx` |
| Se intenta reservar un libro ya reservado | El detalle muestra "Ver mis reservas" en lugar de "Reservar"; si se llega al modal, "Ya reservaste este libro…" | `libro/[isbn].tsx:74-89`; `src/app/reservar/[isbn].tsx:23-33`; `biblioteca.tsx:149-151` |
| "Entregar al siguiente" con la lista vacía | Los libros sin espera no aparecen en el mostrador; si igual pasara, "Nadie está esperando …" | `src/app/mostrador.tsx:20-22`; `biblioteca.tsx:213-218` (la `Cola` devuelve `undefined` sin romperse) |
| Login con clave incorrecta | "Usuario o clave incorrectos. Revisalos e intentá de nuevo." | `src/app/login.tsx:29-30`; `biblioteca.tsx:99-106` |

### E4. Decisiones con argumentos

**a) Identificador: ISBN.**
- **Es estable y único por edición:** dos ediciones del mismo título tienen ISBN distintos, así que se distinguen solas, que es lo correcto en una biblioteca (no es lo mismo prestar una edición que otra).
- **Es lo que lee el escáner:** el EAN-13 de la contratapa es el ISBN, así que no hace falta traducir nada.
- **Las URLs se entienden** (`/libro/9789870001010`).
- **Funciona bien con `useLocalSearchParams`, que siempre devuelve texto** (lo vimos en el E1 del TP 2). Con un id numérico habría que convertirlo con `Number()` y controlar `NaN`, y `"007"` y `"7"` serían el mismo número. El ISBN ya es un `string` y se valida con una expresión regular (`src/lib/catalogo.ts`).
- **La contra son los libros sin ISBN,** como ediciones viejas o materiales propios del instituto. Para esos haría falta un identificador propio. Si la biblioteca tuviera muchos, convendría un id interno y el ISBN como dato opcional.

**b) Estructuras: clase `Pila` con `#items`.**
- **Lo que me dio la clase:** encapsulamiento (desde afuera no se puede tocar el arreglo, solo `apilar`, `desapilar` y `tope`), una API con nombres del dominio, la `Cola` sin `shift()` con el frente y el final escondidos, y la posibilidad de probarla aislada (`src/estructuras/__tests__`).
- **Lo que me complicó:** React compara el estado por referencia, y la clase está pensada para **mutarse**. Tuve que acordarme de crear siempre una instancia nueva (`new Pila(anterior.aArray())`, `src/context/biblioteca.tsx:93`). Si en algún lugar se muta la instancia que está en el estado, aparece el error de B3.
- **La alternativa:** con un array y `[...pila, x]` / `slice`, la inmutabilidad viene "gratis", pero la regla "último en entrar, primero en salir" queda repartida por el código.

**c) Memorización.** No escribí `useMemo` ni `useCallback` a mano en los componentes, porque el proyecto tiene activado el **React Compiler** (`"reactCompiler": true` en `app.json`), que memoriza automáticamente.

- **Donde aportan:** el `value` del Context. Sin memorizar es un objeto nuevo en cada render del provider, y eso hace re-renderizar a todos los consumidores. Otro caso es `usePermiso` (`src/hooks/usePermiso.ts:16-18`), donde **sí** uso `useCallback`: `useFocusEffect` vuelve a ejecutarse si cambia la función que recibe, y con una función nueva en cada render consultaría el permiso de más.
- **Donde serían ruido:** `useMemo` para calcular `recientes` (3 elementos) o para `esIsbnValido`: el cálculo es más barato que la propia memorización.
- **Cómo lo comprobaría:** con el **Profiler de React DevTools** (o "Highlight updates"), midiendo cuántas veces y cuánto tarda en renderizar cada componente antes y después del cambio, en lugar de suponerlo.

**d) Datos duplicados.** Los "ejemplares disponibles" **se calculan**, no se guardan: `disponibles()` (`src/context/biblioteca.tsx:112-121`) parte de los ejemplares del estante inicial, resta los préstamos activos y suma los ejemplares devueltos que se entregaron desde el mostrador.

Si el número viviera en dos lugares (un contador en el estado además de la lista de préstamos), cada acción tendría que actualizar los dos. Bastaría que `devolver` se olvidara de sumar 1 para que el detalle mostrara "0 disponibles" con el libro en el estante. O peor, "2 disponibles" cuando ya están todos prestados. Al calcularlo, hay una sola fuente de verdad y el número no puede quedar desincronizado.
