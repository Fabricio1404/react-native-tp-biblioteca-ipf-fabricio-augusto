# Respuestas — TP 4 "Biblioteca IPF"

Cada respuesta indica el archivo y las líneas de este repositorio en las que se apoya. Lo marcado con
**⚠️ Verificar** depende de cómo se comporta la app en el teléfono y hay que confirmarlo probándola.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

**a) Render por render** (`src/hooks/useLibros.ts`)

Cuando todo sale bien:

| Render | `libros` | `cargando` | `error` | Causa |
| ------ | -------- | ---------- | ------- | ----- |
| 1 | `[]` | `true` | `null` | El Catálogo se monta con los valores iniciales (líneas 16-18) y se dibuja el indicador. Recién después React ejecuta el efecto de las líneas 22-49, que dispara `obtenerLibros()`. |
| 2 | 15 libros | `false` | `null` | A los 800 ms la promesa se resuelve. `setLibros(datos)` (línea 31) y `setCargando(false)` (línea 39) se ejecutan seguidos, en la misma vuelta después del `await`, y React los junta en **una sola** actualización. |

En total, **2 renders**.

Si el pedido falla y después se toca "Reintentar":

| Render | `libros` | `cargando` | `error` | Causa |
| ------ | -------- | ---------- | ------- | ----- |
| 1 | `[]` | `true` | `null` | Montaje, igual que antes. |
| 2 | `[]` | `false` | mensaje | La promesa se rechaza: el `catch` guarda el mensaje (línea 35) y el `finally` apaga la carga (línea 39). Se dibuja `MensajeError` con el botón. |
| 3 | `[]` | `true` | `null` | El botón llama a `reintentar()` (líneas 51-55): limpia el error, prende la carga y suma 1 a `intento`. Al ser un evento, React agrupa los tres cambios. Como `intento` está en las dependencias, primero corre la limpieza del efecto viejo y después el efecto nuevo. |
| 4 | 15 libros | `false` | `null` | Llega la respuesta del segundo pedido. |

**b) ¿Se desmonta el Catálogo?** ⚠️ Verificar agregando un `console.log` provisorio dentro de la limpieza (líneas 46-48) y sacándolo después.

- **Cambiar a "Mis reservas":** no lo desmonta. El navegador de pestañas deja vivas las pantallas ya visitadas y solo alterna cuál se muestra.
- **Abrir un detalle:** tampoco. El detalle entra arriba de la pila de la pestaña y el Catálogo sigue montado abajo, esperando.
- **Cuándo corre mi limpieza:** al tocar "Reintentar" (cambia `intento` y el pedido anterior queda descartado), y cuando el Catálogo deja de existir de verdad: se cierra la app o se recarga en desarrollo.

**c) `async` directo en `useEffect`.**
React usa lo que devuelve el callback del efecto como función de limpieza. Una función marcada `async` devuelve siempre una promesa, nunca una función, así que React no tendría qué ejecutar al limpiar, y además no podría devolver la limpieza a tiempo. Mi solución: el callback del efecto es común y adentro defino `cargar` como `async` (líneas 27-42). La llamo en la línea 44 y devuelvo la limpieza enseguida (líneas 46-48).

**d) Cómo funciona `reintentar`.**
Tengo un número `intento` en el estado (línea 20) que figura en las dependencias del efecto (línea 49). `reintentar` lo incrementa (línea 54). Para React, una dependencia distinta significa "este efecto quedó viejo": limpia el anterior y vuelve a correrlo, y eso hace un pedido nuevo.

Elegí un contador porque es lo único que cambia **solamente** cuando la persona lo pide. Si hubiera puesto `error` como dependencia, el propio efecto lo modifica al fallar, y cada falla lanzaría otro pedido sola, sin que nadie toque nada.

### B2. La condición de carrera del buscador

La lógica del buscador está en el hook `src/hooks/useBusquedaLibros.ts`. Además espera 300 ms sin cambios antes de pedir (líneas 33-44). En la tabla supongo que los dos pedidos alcanzaron a salir.

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
| ------- | -------- | ----------------------- | ------------------------ |
| t = 0 ms | Escribe "bor" → `buscarLibros("bor")` (1.400 ms) | "Buscando…" | "Buscando…" |
| t = 200 ms | Escribe "borges" → `buscarLibros("borges")` (300 ms) | "Buscando…" | "Buscando…". El efecto de "bor" ya se limpió: su `cancelado` quedó en `true`. |
| t = 500 ms | Llega "borges" | La lista de "borges" | La lista de "borges" |
| t = 1.400 ms | Llega "bor" | **La lista de "bor" reemplaza a la de "borges"**, con el campo diciendo "borges" | No cambia nada: esa respuesta se tira |

Con mis datos, "bor" y "borges" devuelven los mismos dos libros de Borges, así que a simple vista no se notaría. Pero si "bor" trajera otros títulos, aparecerían resultados que no tienen nada que ver con lo que está escrito.

**a) La limpieza** (líneas 46-49 del hook) hace dos cosas: marca `cancelado = true` y cancela el temporizador pendiente con `clearTimeout`. Cuando la respuesta vieja llega, los `if (!cancelado)` de las líneas 36 y 40 impiden que toque el estado. Como segunda protección, cada resultado guarda la consulta que lo pidió (línea 37), y el hook solo lo entrega si coincide con la consulta actual (línea 58).

React ejecuta esa limpieza **antes de correr el efecto otra vez**, o sea cada vez que cambia la consulta (cada tecla cambia `q` en la URL), y también cuando la pantalla se desmonta.

**b) La idea del compañero** (`if (texto === q)` adentro del `.then()`) no sirve. La función del `.then()` nació en un render puntual y captura por clausura el `q` de ese momento, que es justamente el texto que se buscó. Comparar el texto buscado con el `q` capturado da siempre verdadero, aunque la persona ya haya escrito otra cosa. Para que funcione hay que comparar con algo que se lea "en vivo", como un `useRef` donde se vaya guardando la consulta más reciente. Mi comparación de la línea 58 no tiene ese problema porque se hace en el render, con los valores de ese render.

**c) URL y botón atrás.** Cada letra modifica el `?q=` de la URL mediante `router.setParams` (`src/app/buscar.tsx`, línea 27). `setParams` reescribe los parámetros de la pantalla en la que ya estoy, sin crear una entrada nueva en el historial, así que un solo "atrás" saca del buscador. Con `router.push` cada tecla agregaría una pantalla `/buscar` más a la pila: habría que retroceder letra por letra, y cada una de esas pantallas haría su propia búsqueda.

### B3. Mutar o reemplazar

**a)** Se sigue viendo **0**. `encolar` cambia por dentro el mismo objeto que React tiene guardado, y nadie llama a una función `set…`. Para React no pasó nada, así que no vuelve a dibujar: la cola tiene 3 personas, pero en pantalla queda el número del último render.

**b)** Al escribir en el `TextInput` controlado se llama a su `set…` en cada letra, React vuelve a dibujar el componente completo y en ese dibujo lee `espera.tamanio`, que ya vale 3. Por eso el número "salta" de golpe. Un error así es más peligroso que uno constante, porque aparece o no según lo que haga otra parte de la pantalla: cuesta reproducirlo, puede pasar las pruebas sin que nadie lo vea y despista sobre dónde está la causa.

**c)** En mi Context nunca toco la estructura que está en el estado. Armo una copia, le aplico el cambio y la guardo como estado nuevo.

- Recientes: `new Pila(anterior.aArray())` y después `apilar` (`src/context/biblioteca.tsx`, líneas 156-164).
- Reservar sin ejemplares: `new Cola(enEspera(isbn))`, `encolar(YO)` y `setEsperas` (líneas 225-227).
- Entregar al siguiente: líneas 282-287.

| Opción | A favor | En contra |
| ------ | ------- | --------- |
| Copia nueva en cada cambio (la mía) | La referencia cambia y React lo detecta siempre; el valor anterior queda intacto | Copia todos los elementos cada vez (O(n)); con listas de espera de pocas personas es despreciable |
| Mutar y sumar un "contador de versión" | No copia | El cambio real sigue escondido; alcanza con olvidar el contador en un lugar para volver al error; los efectos o `useMemo` que dependen de la cola no se enteran porque la referencia es la misma |
| `useReducer` con estados nuevos | Toda la lógica de cambios en una sola función pura, fácil de probar | Más código (tipos de acción, reducer, `dispatch`) del que esta app necesita |

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive | Por qué ahí |
| ---- | ---------- | ----------- |
| Texto del buscador | **URL** (`q`) más una copia local para el campo (`buscar.tsx`, líneas 18-20) | En la URL se puede compartir y abrir con `bibliotecaipf://buscar?q=borges`; la copia local evita que el cursor salte mientras se escribe. |
| Préstamos y reservas | **Context** (`prestamos`, línea 93), guardado además con AsyncStorage | Lo modifican el modal de reserva y el mostrador y lo leen el detalle, el Catálogo y "Mis reservas", que están en navegadores distintos. Se guarda para no perderlo al cerrar la app. |
| Listas de espera | **Context** (`esperas`, una `Cola` por ISBN, línea 94), también guardadas | Las usan el detalle, "Mis reservas" y el mostrador. |
| Vistos recientemente | **Context** (`vistos`, una `Pila`, línea 91), también guardados | Se cargan desde el detalle y se muestran en el Catálogo. |
| Sesión del personal | **Context** (`sesionIniciada`, línea 92), sin guardar | `NavegacionRaiz` la necesita para los `Stack.Protected`. No la guardo a propósito: al reabrir la app hay que volver a ingresar. |
| Ejemplares disponibles | **No se guarda: se calcula** (`disponibles()`, líneas 180-189) | Sale del estante inicial y de los préstamos activos. Un contador aparte podría contradecir a la lista de préstamos (ver E4d). |
| Estado del permiso de cámara | Lo decide **el sistema operativo**. La app tiene una copia en `useCameraPermissions` que se actualiza al enfocar la pantalla y al volver a la app (`usePermiso.ts`, líneas 20-21) | La persona lo puede cambiar desde Ajustes sin pasar por la app. |
| Id de la notificación programada | **Context**, dentro de cada préstamo (`idNotificacion`), y guardado con el resto. La notificación en sí la tiene el sistema | Se necesita para cancelarla al apagar "Recordarme" o al devolver (líneas 231-238 y 264-270). |

**Re-renders del Context.** Cada vez que el provider se vuelve a dibujar arma un objeto `value` nuevo (líneas 322-347), y React vuelve a dibujar **todos** los componentes que llaman a `useBiblioteca()`, sin importar qué parte usan. El Catálogo tiene `VistosRecientemente` y una `FilaLibro` por libro leyendo el Context, y sigue montado aunque esté en otra pestaña. Por eso, al activar un recordatorio en "Mis reservas" cambia `prestamos` y esos componentes también se vuelven a dibujar.

Se podría evitar partiendo el Context en varios más chicos (sesión, recientes, préstamos) o con selectores. Para quince libros y un par de pantallas el costo es mínimo y no justifica la complejidad extra, más con el React Compiler activo (`app.json`). Lo cambiaría solo si el Profiler mostrara una demora que se note.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

⚠️ Verificar los pasos 5 y 6 en el teléfono.

| # | Acción | Pilas resultantes |
| - | ------ | ----------------- |
| 1 | Abre la app | Raíz: `[(tabs)]` · pestaña activa: Catálogo · pila del Catálogo: `[index]` |
| 2 | Toca un libro | Raíz: `[(tabs)]` · pila del Catálogo: `[index, libro/X]` |
| 3 | Toca "Reservar" | Raíz: `[(tabs), reservar/X (modal)]` · pila del Catálogo sin cambios |
| 4 | Toca "Confirmar" | Raíz: `[(tabs)]` · pestaña activa: Mis reservas · pila del Catálogo: `[index, libro/X]` |
| 5 | Atrás (Android) | Las pestañas vuelven a la primera: Catálogo, mostrando `libro/X` |
| 6 | Toca la pestaña "Catálogo" | Al tocar la pestaña que ya está activa, su pila vuelve al principio: `[index]` |

**a)** En el paso 4 llamo a `router.dismiss()` y luego a `router.navigate('/reservas')` (`src/lib/navegacion.ts`, líneas 5-8).

- **`dismiss`** quita el modal de la pila raíz, así que ya no hay confirmación a la cual volver.
- **`navigate`** activa la pestaña "Mis reservas" que ya existe.

Las otras opciones:

- **`push('/reservas')`** dejaría el modal abajo: "atrás" volvería a la confirmación, que es justo lo que la consigna pide evitar. Además pondría una segunda copia de las pestañas encima.
- **`replace`** cambiaría el modal por otra entrada `(tabs)` en la pila raíz, que ya tiene una debajo: quedarían dos navegadores de pestañas.
- **`dismissTo('/reservas')`** busca hacia abajo esa ruta para volver a ella. Como `/reservas` vive **adentro** de `(tabs)`, el resultado depende de cómo resuelva una ruta anidada.

Me quedé con dos pasos simples y explícitos.

**b)** En el paso 5 se ve el **detalle**: cada pestaña recuerda su propia pila y la del Catálogo seguía en `[index, libro/X]`. En el paso 6, tocar otra vez la pestaña activa la lleva a su inicio y se ve el **Catálogo**. Me parece lo correcto: volver a una pestaña muestra donde se había quedado la persona, y tocarla de nuevo es el gesto habitual para "ir al principio".

### C2. El escáner que dispara de más

La lógica de lectura está en el hook `src/hooks/useEscaner.ts`.

**a)** Mientras el código esté frente a la cámara, `onBarcodeScanned` puede llamarse varias veces por segundo. Si cada llamada hiciera `router.push`, todas esas acciones irían a parar a la cola de navegación de Expo Router (`routingQueue`, que atiende en orden de llegada, como vimos en el TP 2) y se ejecutarían una tras otra. El resultado serían varios detalles iguales apilados, y la persona tendría que tocar "atrás" muchas veces para salir.

**b)** Uso **`useRef`** (líneas 16-19 del hook): `navegando` se pone en `true` antes de navegar (línea 22) y cada lectura lo revisa primero (línea 28). Con `useState` no alcanza, porque el valor nuevo recién existe en el **render siguiente**. Hasta que ese render ocurre, las lecturas que siguen llegando ejecutan la función armada en el render anterior, que por clausura todavía tiene `false`, y navegan otra vez. Un ref, en cambio, se modifica al instante y la próxima lectura ya ve `true`.

**c)** Con `router.replace` (línea 24) el escáner **se reemplaza** por el detalle dentro de la pila del Catálogo: "atrás" lleva al Catálogo. Con `push`, "atrás" volvería al escáner con la cámara prendida, y si el libro sigue cerca puede leerlo de nuevo y volver a abrir el detalle.

**d)** Si el ISBN leído no existe en el catálogo, se muestra un aviso en la misma pantalla y la cámara sigue leyendo (líneas 35-40). Para no repetir el aviso, el último código desconocido queda en otro ref (`ultimoDesconocido`, línea 19): si vuelve a llegar el mismo, se ignora (líneas 36-38). Si llega un código distinto, el aviso se actualiza.

### C3. Deep links y rutas protegidas

⚠️ Verificar cada fila en Expo Go usando `exp://<IP>:8081/--/<ruta>`.

| Link | Qué ve la persona | Qué queda debajo | Qué parte del código lo decide |
| ---- | ----------------- | ---------------- | ------------------------------ |
| `bibliotecaipf://libro/9789870001010` | El detalle de *Ficciones* | El Catálogo, en la pila de la pestaña | `anchor: 'index'` en `src/app/(tabs)/(catalogo)/_layout.tsx` (líneas 8-10) y `anchor: '(tabs)'` en `src/app/_layout.tsx` (líneas 14-16) |
| `bibliotecaipf://libro/123` | Aviso de que "123" no es un ISBN válido, con botón al Catálogo | El Catálogo | `libro/[isbn].tsx`, líneas 18 y 27-36 |
| `bibliotecaipf://buscar?q=borges` | El buscador ya completado con "borges" | Las pestañas | El `anchor` del layout raíz y `useLocalSearchParams` (`buscar.tsx`, línea 18) |
| `bibliotecaipf://mostrador` (sin sesión) | El mostrador no se abre porque sin sesión esa ruta no existe. ⚠️ Anotar qué pantalla muestra | Las pestañas | `Stack.Protected guard={sesionIniciada}` (`src/components/NavegacionRaiz.tsx`, líneas 46-48) |
| `bibliotecaipf://reserva` | La pestaña "Mis reservas" | Las pestañas; `/reserva` no queda guardada | `<Redirect href="/reservas" />` en `src/app/reserva.tsx` |
| `bibliotecaipf://escanear` (cámara bloqueada) | El escáner con el mensaje de cámara desactivada, "Abrir Ajustes" y el campo para el ISBN | El Catálogo | `escanear.tsx`, líneas 55-65 y 78; `src/lib/permisos.ts`, línea 20 |

**¿Por qué `/libro/123` llega a la pantalla de detalle?** El archivo se llama `[isbn].tsx`: los corchetes indican un segmento variable que acepta **cualquier** texto. Expo Router solo compara la forma de la URL y no sabe qué libros existen. Por eso es la **pantalla** la que tiene que revisar el dato: que sean 13 dígitos y que el libro esté en el catálogo, y si no, explicar qué pasó y ofrecer una salida (`libro/[isbn].tsx`, líneas 17-45).

### C4. Foco, montaje y primer plano

**a)**
- **`useEffect(…, [])`** se ejecuta cuando el componente **aparece por primera vez**, y su limpieza cuando desaparece.
- **`useFocusEffect`** se ejecuta cada vez que la pantalla **pasa a ser la que se ve dentro de la app**: al llegar a ella, al volver desde otra pestaña o cuando se cierra un modal que la tapaba.
- **`AppState`** avisa cuando **toda la app** se va a segundo plano o vuelve a primer plano.

**b)**
- **Ida y vuelta a Ajustes:** solo lo detecta **`AppState`**. Desde el punto de vista de la navegación, la pantalla nunca dejó de estar enfocada ni se desmontó.
- **Cambio de pestaña y regreso:** el único que reacciona es **`useFocusEffect`**, porque la pantalla recupera el foco. La app nunca salió del frente, y la pestaña sigue montada, así que el efecto con `[]` no vuelve a correr.

**c)** Combiné las dos en `usePermiso` (`src/hooks/usePermiso.ts`, líneas 20-21): `useFocusEffect(revisar)` y `useRevisarAlVolver(revisar)`, que por dentro usa `AppState` (`useRevisarAlVolver.ts`, líneas 10-16). "Mis reservas" lo usa en `reservas.tsx` (línea 18), y también el escáner.

Con una sola me quedaría un caso desactualizado. Solo con `useFocusEffect`, al volver de Ajustes la pestaña seguiría diciendo "desactivadas" hasta cambiar de pestaña. Solo con `AppState`, después de aceptar el permiso en `/permisos/notificaciones`, que es un modal de la propia app, el estado no se actualizaría.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara

⚠️ Verificar en un Android 14 real.

| # | Acción | Qué muestra mi app | `status` | `canAskAgain` |
| - | ------ | ------------------ | -------- | ------------- |
| 1 | Toca "Escanear" por primera vez | Un instante "Revisando el permiso…" y enseguida la pantalla previa `/permisos/camara`, con el beneficio y "Continuar" (`escanear.tsx`, líneas 27-32) | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | De vuelta en el escáner: el texto del beneficio, el botón "Usar la cámara" y el campo para el ISBN | `denied` | `true` |
| 3 | Toca "Escanear" otra vez | La pantalla previa con "Continuar" | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | El escáner en modo bloqueado: aviso de cámara desactivada, "Abrir Ajustes" y el campo del ISBN | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | Directamente el modo bloqueado | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita → vuelve | La cámara leyendo códigos | `granted` | `true` |

**a) En iOS** no hay segunda oportunidad: el sistema pregunta una vez y, si la respuesta es "No permitir" (paso 2), `canAskAgain` ya es `false` y mi app pasa directamente al modo bloqueado, con "Abrir Ajustes" y el campo para escribir el ISBN. Ya en el paso 3 no se ve "Continuar", y el paso 4 no existe.

**b) La línea que decide** es `src/lib/permisos.ts:20`:

```ts
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

Según ese estado, `ExplicacionPermiso.tsx` (línea 31) y `escanear.tsx` (líneas 48-65) muestran "Continuar" o "Abrir Ajustes". Miro `canAskAgain` porque `status` es `'denied'` en dos situaciones distintas: después de la primera negativa, cuando Android todavía muestra el diálogo, y cuando ya lo bloqueó. Si me guiara solo por `status`, mostraría "Continuar" cuando el sistema ya no va a preguntar, y tocarlo no haría nada.

**c)** Se entera `useRevisarAlVolver` (`src/hooks/useRevisarAlVolver.ts`, líneas 10-16): escucha `AppState` y, cuando la app vuelve a `active`, consulta el permiso de nuevo. Lo usa `usePermiso` (línea 21). Sin esa parte, la persona volvería de Ajustes con la cámara habilitada y seguiría viendo "Abrir Ajustes", hasta salir del escáner y volver a entrar.

### D2. Notificaciones y consistencia

**a)** Sin cancelarla, a los 15 segundos llegaría "Acordate de devolver…" de un libro **ya devuelto**: un recordatorio falso que hace perder confianza en los avisos de la app. Por eso `devolver()` cancela la programada (`src/context/biblioteca.tsx`, líneas 231-238), igual que `desactivarRecordatorio()` (líneas 264-270). También cubrí un caso borde: si la persona apaga el interruptor o devuelve el libro **mientras** la notificación se estaba programando, `activarRecordatorio()` la cancela apenas recibe el id (líneas 251-256).

**b)** El identificador está en el campo `idNotificacion` de cada préstamo, en el estado del Context (línea 257), y la app lo **guarda con AsyncStorage** junto con los préstamos (líneas 132-146 y `src/lib/persistencia.ts`).

Si la app se cierra antes de los 15 segundos, la notificación **sigue programada en el sistema y llega igual**. Si los datos estuvieran solo en memoria, el identificador se perdería: al reabrir no habría forma de cancelar ese recordatorio, y si el préstamo ya no existiera quedaría una notificación "huérfana".

Lo resolví en dos partes:

- Los préstamos y sus identificadores se guardan y se recuperan al abrir la app (líneas 103-128), así que se pueden seguir cancelando.
- Al arrancar, `cancelarRecordatoriosHuerfanos()` (`src/lib/notificaciones.ts`, líneas 64-79) compara las notificaciones programadas con los identificadores de los préstamos guardados y cancela las que no le corresponden a ninguno (línea 119 del Context).

**c)** Desde Android 13 mostrar notificaciones requiere el permiso en tiempo de ejecución `POST_NOTIFICATIONS`, y el sistema lo relaciona con los canales que la app creó: si la app todavía no tiene ninguno, el pedido puede terminar sin mostrar el diálogo. Por eso mi función de pedido primero crea el canal `prestamos` y recién después pide (`src/lib/notificaciones.ts`, líneas 20-27 y 33-36).

En Android 12 ese permiso no existe: las notificaciones vienen habilitadas al instalar y el pedido devuelve `granted` sin preguntar nada. El canal sigue siendo necesario (es obligatorio desde Android 8) para que se muestren.

**d)** Si el permiso está denegado, me entero por una **tarjeta dentro de la app**, arriba de "Mis reservas". Lo decide `avisarEntrega()` (`src/context/biblioteca.tsx`, líneas 297-308):

```ts
if (await puedeNotificar()) {
  await avisarLibroEntregado(titulo);
  return;
}
// …
agregarAviso(`¡Ya podés retirar "${titulo}"! Lo tenés en tus préstamos.`);
```

`puedeNotificar()` (`notificaciones.ts`, líneas 40-43) llama a `getPermissionsAsync()` **en ese mismo momento**, no lee un valor guardado antes. Es importante porque la persona puede haber cambiado el permiso en Ajustes desde la última vez que la app lo miró. Con un dato viejo, la app podría mandar una notificación que el sistema descarta, y el aviso se perdería, o mostrar la tarjeta cuando ya se podía notificar.

### D3. Lo que tu app pide y lo que no

| Plataforma | Permiso o clave | Para qué lo usa la app | Quién lo agrega |
| ---------- | --------------- | ---------------------- | --------------- |
| Android | `android.permission.CAMERA` | Leer el código de barras del libro | El manifiesto de `expo-camera` |
| Android | `android.permission.POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de entrega | `expo-notifications` |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Que las notificaciones programadas sobrevivan a un reinicio del teléfono | `expo-notifications` |
| iOS | `NSCameraUsageDescription` (el texto "Usamos tu cámara para leer el código de barras…") | Leer el código de barras | El plugin `expo-camera`, con `cameraPermission` de `app.json` |
| iOS | Notificaciones: sin clave en `Info.plist`, se piden en tiempo de ejecución | Recordatorios | `expo-notifications` |

**a)** `expo-camera` también sirve para grabar video con sonido, y por eso normalmente declara `RECORD_AUDIO` en Android y `NSMicrophoneUsageDescription` en iOS. Mi app solo lee códigos de barras, así que lo apagué en `app.json`:

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro sin escribir el ISBN.",
  "microphonePermission": false,
  "recordAudioAndroid": false,
  "barcodeScannerEnabled": true
}]
```

Como refuerzo, `RECORD_AUDIO` está en `android.blockedPermissions`, que lo elimina del manifiesto final aunque alguna dependencia lo vuelva a agregar.

**b)** Para elegir una portada de la galería, el paquete indicado es `expo-image-picker` y su función `launchImageLibraryAsync`. En Android 13 o superior abre el selector de fotos del sistema y en iOS 14 o superior el selector `PHPicker`. En los dos casos **no hace falta pedir permiso**: la persona elige en una pantalla del sistema y la app recibe únicamente esa foto. Igual requiere una **build nueva**: es un módulo con código nativo, y una actualización OTA solo reemplaza el JavaScript, no puede sumar código nativo. (En Expo Go andaría, porque ya viene incluido.)

**c)** Lo que Expo Go no me deja comprobar del todo:

- **El texto de propósito de la cámara:** el diálogo sale con el texto de Expo Go, porque el `Info.plist` que se usa es el de Expo Go.
- **Que falte `RECORD_AUDIO` y que se apliquen los `blockedPermissions`:** el manifiesto real es el de Expo Go, que declara muchísimos permisos.
- **El ícono, el splash y el nombre de la app.**
- **El canal `prestamos`:** figura en los ajustes de notificaciones de Expo Go y no de una app "Biblioteca IPF".

Todo eso pasa porque Expo Go ya viene compilado con su propia configuración nativa, y lo que escribo en `app.json` solo se aplica cuando se genera una build propia. La forma de comprobarlo es compilar la app con su propia configuración: generar las carpetas nativas con `npx expo prebuild` y leer el `AndroidManifest.xml` resultante, e instalar una build de desarrollo en el teléfono con `npx expo run:android` (o con EAS, perfil `development`).

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas**

| Línea | Problema | Tipo | Explicación y corrección |
| ----- | -------- | ---- | ------------------------ |
| 10, 22 | `any[]` y `libro: any` | Mala práctica | TypeScript deja de controlar esos datos: un error como `libro.titlo` recién aparece al ejecutar. Corrección: `Libro[]` y `{ libro: Libro }`. |
| 11, 13-16 | Pide cámara y notificaciones apenas se abre el Catálogo | Mala práctica | La persona ve dos diálogos sin saber para qué. La cámara debería pedirse al tocar "Escanear", pasando antes por `/permisos/camara`, y las notificaciones al prender "Recordarme". |
| 13-16 | Falta `pedirPermiso` en las dependencias y las promesas quedan sin manejar | Advertencia | `react-hooks/exhaustive-deps` lo señala. De todos modos, ese efecto entero hay que sacarlo (fila anterior). |
| 18-20 | `useEffect` **sin dependencias** | Rendimiento / error de ejecución | Sin array, el efecto corre después de cada render. Cada respuesta provoca un render nuevo, y ese render otro pedido: un ciclo que no termina (ver b). Corrección: `[]`, o un contador para reintentar. |
| 19 | No hay `catch` | Error de ejecución | La API falla una de cada cinco veces. El rechazo queda sin manejar y la pantalla no informa nada. Corrección: `try/catch` con un estado de error y el botón "Reintentar". |
| 19 | No hay limpieza | Advertencia | Una respuesta que llega con la pantalla ya cerrada, o de un pedido anterior, igual actualiza el estado. Corrección: una bandera `cancelado` que la limpieza pone en `true`. |
| 18-41 | Sin estados de carga, error y vacío | Mala práctica | Durante 800 ms no se ve nada, y si la API falla la pantalla queda en blanco para siempre. |
| 22-30 | `Fila` declarado **adentro** de `Catalogo` | Rendimiento | Cada render de `Catalogo` crea una función `Fila` distinta. React la considera otro componente, así que desmonta las filas viejas y monta nuevas en cada render. Corrección: llevarlo a su propio archivo, como `src/components/FilaLibro.tsx`. |
| 24 | `'/libro/' + libro.isbn` | Mala práctica | Al armar la ruta concatenando texto, las rutas tipadas no pueden revisarla. Corrección: pasar un objeto con `pathname: '/libro/[isbn]'` y el ISBN dentro de `params`, que el compilador sí puede revisar. |
| 25 | Estilo escrito en línea con el color `'#333'` | Mala práctica | Cada render crea un objeto de estilo nuevo y el color queda fuera del tema. Corrección: pasarlo a `StyleSheet.create` y tomar el color de `Colores`. |
| 33-36 | `ScrollView` que hace `map` de todos los libros | Rendimiento | Dibuja la lista completa de una vez aunque la mayoría no esté en pantalla. Corrección: `FlatList`, que solo dibuja lo visible. |
| 35 | `key={i}` | Advertencia / error lógico | Si los libros cambian de lugar, React deja el estado de cada fila pegado a la posición y no al libro. Corrección: usar el ISBN como clave. |
| 37-39 | Botón de solo ícono, de 28 × 28, sin `accessibilityRole` ni `accessibilityLabel` | Mala práctica (accesibilidad) | Con lector de pantalla no se sabe qué hace, y es más chico que el mínimo de 44 × 44 para tocarlo con el dedo. Corrección: rol, etiqueta y tamaño mínimo. |
| 11 | `permiso` se declara y nunca se usa | Advertencia | El linter lo marca. Desaparece al sacar los pedidos de permiso de esta pantalla. |

**b) El primer minuto con el efecto sin dependencias:**

1. Primer render con la lista vacía. Termina y corre el efecto, que hace el primer pedido.
2. A los 800 ms llega un array **distinto** del anterior, porque la API devuelve copias nuevas. `setLibros` recibe otra referencia, así que React vuelve a dibujar.
3. Al terminar ese render el efecto corre de nuevo, porque no tiene dependencias que lo frenen, y pide otra vez.
4. El ciclo se repite cada ~800 ms: alrededor de **75 pedidos en un minuto**. Gasta datos y batería, y una de cada cinco respuestas es un error que nadie atrapa.

Si la API devolviera **el mismo array cada vez**, el ciclo se cortaría solo. En la segunda respuesta, `setLibros` recibiría la referencia que el estado ya tiene; React compara con `Object.is`, ve que no cambió y no dibuja. Sin render nuevo, el efecto no se vuelve a ejecutar, y quedarían **solo 2 pedidos**. Pero el defecto sigue ahí: solo dejaría de notarse.

**c) La pantalla reescrita** con lo que ya tiene mi app (es mi `src/app/(tabs)/(catalogo)/index.tsx`):

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

El acceso al escáner quedó en `AccesosCatalogo`: un `Boton` con ícono y texto, rol de botón y 44 de alto como mínimo. Esta pantalla ya no pide ningún permiso.

**d)**
- **Lo que haría rechazar la app en una tienda:** los permisos pedidos **al iniciar y sin explicación** (líneas 13-16). Apple pide que cada permiso se solicite en el momento en que se usa y con un propósito claro (guía 5.1.1), y Google Play revisa que los permisos tengan relación con lo que la persona está haciendo. Notificaciones pedidas en un catálogo, sin ningún motivo a la vista, son una señal de alerta para el revisor.
- **Lo que haría desinstalarla primero:** el **efecto sin dependencias**. La app consume datos y batería sin parar, y cuando la red falla queda en blanco sin explicar nada. Si a eso se le suman dos diálogos de permisos ni bien se abre, la primera experiencia es pésima.

### E2. Organización y acoplamiento

**a) Dependencias entre carpetas:**

```
app ─────────► components, hooks, lib, constants, types
components ──► components, hooks, lib, constants, types
hooks ───────► context, lib, types
context ─────► estructuras, lib, data, constants, types
lib ─────────► data, constants, types
data ────────► types
estructuras ─► (ninguna)
constants ───► lib (solo el tipo Recurso, en constants/permisos.ts)
types ───────► (ninguna)
```

Ningún archivo importa algo de `src/app`: las flechas van siempre desde las rutas hacia abajo. Si, por ejemplo, un hook importara una pantalla, renombrar o mover una ruta (cambiar una URL) rompería código que no tiene relación con la navegación, y además se pueden armar ciclos de imports difíciles de seguir.

El único cruce discutible es `constants/permisos.ts`, que importa de `lib/permisos.ts` el **tipo** `Recurso`. Al ser solo un tipo no genera código, pero estaría más prolijo en `src/types`.

**b) Si el catálogo viniera de una API real**, habría que tocar:

1. `src/lib/api.ts`, que dejaría de simular y haría los pedidos HTTP.
2. `src/lib/catalogo.ts`: hoy `buscarPorIsbn` busca en el array local al instante.
3. `src/data/libros.ts`: sobrarían los libros y quedaría, a lo sumo, `COLAS_AL_ABRIR`.
4. Todo lo que hoy busca un libro por ISBN de forma inmediata (el detalle, el modal de reserva, `ItemPrestamo`, `ItemEspera`, `ItemMostrador` y `disponibles()` del Context): pasaría a esperar una respuesta y necesitaría estados de carga y error.

Son bastantes más de dos archivos. Eso muestra que muchas partes dan por hecho que el catálogo está en memoria y disponible ya. Para reducirlo centralizaría el catálogo en un solo lugar (por ejemplo, el Context guardando lo que trae `useLibros`, más un hook `useLibro(isbn)`), y un cambio de origen de datos tocaría solo `api.ts` y ese hook.

**c) `<ConPermiso recurso="camara">…</ConPermiso>`**

- **Lo que se gana:** menos repetición y una forma declarativa de decir "esto necesita la cámara".
- **Lo que se pierde:** el componente decidiría qué se ve en cada estado, y la pantalla perdería control sobre eso. En mi escáner el campo para escribir el ISBN está **siempre**, en los cuatro estados, al lado de la cámara o del mensaje. También se perdería la pantalla previa como **ruta propia** (`/permisos/camara`), que se puede abrir desde cualquier parte.
- **Para las notificaciones no sirve:** no dependen de abrir una pantalla, sino de **mover un interruptor** dentro de un préstamo (`src/components/ItemPrestamo.tsx`, líneas 21-33), y ahí no hay nada que envolver. Con `usePermiso`, los cuatro estados se calculan igual para los dos recursos, y cada lugar decide qué hacer con ellos: el escáner cambia lo que muestra y el interruptor programa el recordatorio o abre la pantalla previa.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
| --------- | ----------------- | --------------- |
| `obtenerLibros()` falla | "No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo." y el botón "Reintentar" | `src/hooks/useLibros.ts:33-36`; `src/app/(tabs)/(catalogo)/index.tsx:34-42` |
| Se abre `/libro/abc` | Que "abc" no es un ISBN válido, que tiene que tener 13 números, y el botón "Ir al Catálogo" | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:18, 27-36` |
| Se escanea un ISBN que no está | Un aviso con el código leído, una sola vez, y la cámara sigue leyendo | `src/hooks/useEscaner.ts:35-40` |
| Cámara bloqueada | El mensaje de cámara desactivada, "Abrir Ajustes" y el campo para el ISBN | `escanear.tsx:55-65, 78`; `src/lib/permisos.ts:20` |
| Notificaciones denegadas | En "Mis reservas": "Notificaciones desactivadas: los avisos te aparecen acá…"; las entregas llegan como tarjetas dentro de la app | `src/context/biblioteca.tsx:297-308`; `src/components/ItemPrestamo.tsx:21-33`; `src/components/EstadoNotificaciones.tsx` |
| Reservar un libro ya reservado | En el detalle cambia "Reservar" por "Ver mis reservas"; si igual se llega al modal, dice que ya está reservado | `libro/[isbn].tsx:74-89`; `src/app/reservar/[isbn].tsx:23-33`; `biblioteca.tsx:217-219` |
| "Entregar al siguiente" sin nadie esperando | El mostrador solo lista libros con espera; si se diera el caso, informa que nadie lo está esperando | `src/app/mostrador.tsx:20-22`; `biblioteca.tsx:281-286` (con la cola vacía `desencolar` devuelve `undefined`) |
| Clave incorrecta en el login | "Usuario o clave incorrectos. Revisalos e intentá de nuevo.", que se borra al volver a escribir | `src/app/login.tsx:29-30`; `biblioteca.tsx:167-174` |

### E4. Decisiones con argumentos

**a) Identificador: el ISBN.**
- **Es único por edición:** dos ediciones del mismo título tienen ISBN distintos, y en una biblioteca eso es lo que conviene, porque no es lo mismo prestar una edición que otra.
- **Es lo que ya trae el libro:** el código de barras de la contratapa (EAN-13) es el ISBN, así que el escáner lo usa directo, sin traducciones.
- **Las URLs se entienden solas:** `/libro/9789870001010`.
- **Encaja con `useLocalSearchParams`, que siempre entrega texto** (el ejercicio E1 del TP 2). Un id numérico habría que convertirlo con `Number()` y controlar `NaN`, y además `"007"` y `"7"` serían el mismo valor. El ISBN se queda como `string` y lo valido con una expresión regular (`src/lib/catalogo.ts`).
- **La desventaja son los materiales sin ISBN,** como libros antiguos o apuntes propios del instituto. Si fueran muchos, convendría un id interno y el ISBN como dato opcional.

**b) Estructuras: clase `Pila` con `#items`.**
- **Lo que me dio:** el arreglo queda protegido (solo se usa con `apilar`, `desapilar` y `tope`), los nombres hablan del problema y no de arrays, la `Cola` resuelve el frente sin `shift()` sin que nadie de afuera lo sepa, y las clases se pueden probar solas (`src/estructuras/__tests__`, 12 casos).
- **Lo que me complicó:** React detecta cambios comparando referencias, mientras que la clase está pensada para modificarse por dentro. Tuve que crear siempre una instancia nueva antes de cambiarla (`src/context/biblioteca.tsx:161`), y para guardarla en AsyncStorage la convierto a array con `aArray()` y la reconstruyo al leerla. Si en algún lugar se modificara la instancia guardada en el estado, volvería el error de B3.
- **Con un array y `[...pila, x]` / `slice`,** la inmutabilidad viene sola, pero la regla "el último que entra sale primero" queda repartida por todo el código.

**c) Memorización.** No agregué `useMemo` ni `useCallback` a mano en los componentes porque el proyecto tiene el **React Compiler** activado (`"reactCompiler": true` en `app.json`), que hace esa memorización por su cuenta.

- **Dónde sí importa:** el `value` del Context. Sin memorizar, es un objeto nuevo en cada render del provider y obliga a dibujar de nuevo a todos los consumidores. Hay un lugar donde lo escribí explícitamente: `usePermiso` (`src/hooks/usePermiso.ts:16-18`). Ahí `useCallback` es necesario, porque `useFocusEffect` vuelve a ejecutarse si la función cambia, y sin él consultaría el permiso en cada render.
- **Dónde sería ruido:** memorizar `recientes` (tres elementos) o el resultado de `esIsbnValido`. Calcularlos cuesta menos que guardar y comparar la memoria.
- **Cómo lo comprobaría:** midiendo con el **Profiler de React DevTools**, o activando "Highlight updates", cuántas veces y cuánto tarda en dibujarse cada componente antes y después del cambio, en vez de asumirlo.

**d) Datos duplicados.** Los "ejemplares disponibles" **se calculan**: `disponibles()` (`src/context/biblioteca.tsx:180-189`) toma los ejemplares iniciales del estante, les resta los préstamos activos y les suma los ejemplares devueltos que se entregaron desde el mostrador.

Si tuviera además un contador propio, cada acción tendría que actualizar dos cosas. Basta con que `devolver` se olvide de sumar uno para que el detalle diga "0 disponibles" con el libro en el estante, o al revés, "2 disponibles" cuando ya no queda ninguno. Al calcularlo hay una sola fuente de verdad, y el número no puede contradecir a la lista de préstamos.
