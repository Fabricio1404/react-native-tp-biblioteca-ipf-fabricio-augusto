# Biblioteca IPF

App del **Trabajo Práctico N° 4 — App integradora** del Taller Complementario React Native II
(Tecnicatura Superior en Desarrollo de Software Multiplataforma · Instituto Politécnico Formosa).

Los alumnos consultan el catálogo, reservan libros y reciben un recordatorio antes de devolverlos.
El personal entrega los libros respetando el orden de las listas de espera.

- **Expo SDK 58** (`expo` 58.0.26) · `expo-router` 58.0.32 · React Native 0.88.1 · React 19.3
- Proyecto creado con `npx create-expo-app@latest`, TypeScript, Expo Router, rutas tipadas y React Compiler.
- Probada en **Expo Go**.

## Cómo ejecutarla

```bash
npm install
npx expo start
```

Escaneá el QR con Expo Go (Android) o con la cámara (iPhone). El celular y la PC tienen que estar
en la misma red Wi-Fi. Si la red no lo permite:

```bash
npx expo start --tunnel ngrok
```

| Comando             | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm start`         | Inicia el servidor de desarrollo          |
| `npm run lint`      | `expo lint`                               |
| `npm run typecheck` | `tsc --noEmit` (incluye rutas tipadas)    |
| `npm test`          | Tests unitarios de `Pila` y `Cola`        |

Los paquetes se instalan siempre con `npx expo install <paquete>`.

**Personal de biblioteca:** usuario `personal`, clave `ipf2026`.

## Árbol de rutas (`src/app`)

```
src/app/
├── _layout.tsx                 Stack raíz (NavegacionRaiz) + BibliotecaProvider + Stack.Protected
│                               unstable_settings.anchor = '(tabs)'
├── (tabs)/
│   ├── _layout.tsx             Tabs (expo-router/js-tabs) con íconos de @expo/vector-icons
│   ├── (catalogo)/
│   │   ├── _layout.tsx         Stack propio de la tab "Catálogo" (header con link "Personal")
│   │   ├── index.tsx           /                    Catálogo
│   │   ├── libro/[isbn].tsx    /libro/[isbn]        Detalle (valida el ISBN)
│   │   └── escanear.tsx        /escanear            Escáner EAN-13 + ISBN a mano
│   └── reservas.tsx            /reservas            Tab "Mis reservas"
├── buscar.tsx                  /buscar?q=           Stack raíz
├── reservar/[isbn].tsx         /reservar/[isbn]     Stack raíz, presentation: 'modal'
├── permisos/[recurso].tsx      /permisos/camara | /permisos/notificaciones   modal
├── login.tsx                   /login               modal, Stack.Protected guard={!sesionIniciada}
├── mostrador.tsx               /mostrador           Stack.Protected guard={sesionIniciada}
├── reserva.tsx                 /reserva             <Redirect href="/reservas" />
└── +not-found.tsx              cualquier otra URL   404 con la ruta inexistente
```

Árbol de navegadores: `Stack (raíz) → Tabs → Stack (catálogo) → index | libro/[isbn] | escanear`.

`/escanear` está dentro del Stack del Catálogo para que el escáner pueda **reemplazarse** por el
detalle con `router.replace` dentro del mismo navegador: al tocar "atrás" se vuelve al Catálogo.

### Organización de `src`

| Carpeta           | Contenido                                                           |
| ----------------- | ------------------------------------------------------------------- |
| `src/app`         | Solo rutas                                                          |
| `src/components`  | Un componente por archivo                                           |
| `src/hooks`       | `useLibros`, `usePermiso`, `useRevisarAlVolver`, `useBiblioteca`, … |
| `src/lib`         | API simulada, catálogo, fechas, permisos, notificaciones, navegación |
| `src/context`     | `BibliotecaProvider`: préstamos, listas de espera, recientes, sesión y avisos |
| `src/estructuras` | `Pila` y `Cola` con `#items`, `tamanio` y `aArray()` (Cola sin `shift()`) + tests |
| `src/data`        | `libros.ts` y listas de espera iniciales                            |
| `src/types`       | `Libro`, `Prestamo`, `Aviso`                                        |
| `src/constants`   | `tema.ts` (colores del escudo del IPF, tamaños, espaciados) y demás constantes |

## Plugins de `app.json`

```jsonc
"plugins": [
  // Rutas basadas en archivos.
  "expo-router",
  // Pantalla de carga: escudo del IPF sobre el petróleo institucional.
  ["expo-splash-screen", {
    "backgroundColor": "#08383F",
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 200
  }],
  // Cámara: texto de propósito con el molde "Usamos tu [dato] para [beneficio]".
  // Mínimo privilegio: la app solo lee códigos de barras, no graba video ni audio.
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro sin escribir el ISBN.",
    "microphonePermission": false,   // iOS: no declara NSMicrophoneUsageDescription
    "recordAudioAndroid": false,     // Android: no agrega RECORD_AUDIO
    "barcodeScannerEnabled": true    // incluye el lector de códigos de barras
  }],
  // Notificaciones locales (recordatorio de devolución y aviso de entrega).
  ["expo-notifications", {
    "color": "#08383F"               // color del ícono de la notificación en Android
  }]
]
```

## Permisos

| Recurso        | Módulo               | Cuándo se pide                                                        | Alternativa si se niega |
| -------------- | -------------------- | --------------------------------------------------------------------- | ----------------------- |
| Cámara         | `expo-camera` (`useCameraPermissions`) | Al entrar a `/escanear` por primera vez, después de la pantalla previa `/permisos/camara` | Escribir el ISBN a mano en la misma pantalla |
| Notificaciones | `expo-notifications` | Solo al activar "Recordarme" en un préstamo, después de `/permisos/notificaciones` (en Android se crea antes el canal `prestamos`) | Los avisos aparecen dentro de la app, en "Mis reservas" |

La app no pide ningún otro permiso y ninguno bloquea su uso. Si un permiso queda bloqueado
(`canAskAgain: false`), la pantalla ofrece **Abrir Ajustes**; al volver, `useRevisarAlVolver`
(con `AppState`) y `useFocusEffect` vuelven a consultar el estado.

### `blockedPermissions` (Android)

```json
"blockedPermissions": [
  "android.permission.RECORD_AUDIO",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  "android.permission.READ_MEDIA_AUDIO",
  "android.permission.SYSTEM_ALERT_WINDOW"
]
```

`blockedPermissions` quita esos permisos del manifiesto final aunque los agregue alguna librería:

- **`RECORD_AUDIO`**: `expo-camera` puede grabar video con sonido, pero esta app solo lee códigos de barras.
- **Ubicación** (`ACCESS_*_LOCATION`): la app no necesita saber dónde está la persona.
- **Almacenamiento y multimedia** (`READ/WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_*`): no guarda ni lee fotos, videos ni archivos.
- **`SYSTEM_ALERT_WINDOW`**: no dibuja ventanas encima de otras apps.

Así se cumple el **mínimo privilegio**: menos permisos en la ficha de la tienda y menos motivos de rechazo.
Los permisos que sí quedan son `CAMERA`, `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED`
(este último lo agrega `expo-notifications` para conservar las notificaciones programadas al reiniciar).

## Deep links de prueba

Esquema: `bibliotecaipf://`. En Expo Go se usa la URL equivalente `exp://<IP de la PC>:8081/--/<ruta>`.

| Link                                       | Qué se ve                                            |
| ------------------------------------------ | ---------------------------------------------------- |
| `bibliotecaipf://libro/9789870001010`      | Detalle de *Ficciones*                               |
| `bibliotecaipf://libro/123`                | Mensaje de ISBN inválido con link al Catálogo        |
| `bibliotecaipf://buscar?q=borges`          | Buscador con "borges" cargado, las pestañas debajo   |
| `bibliotecaipf://mostrador`                | Sin sesión no se abre el mostrador: esa ruta no existe |
| `bibliotecaipf://reserva`                  | Redirige a `/reservas`                               |
| `bibliotecaipf://escanear`                 | Escáner (con la cámara bloqueada: "Abrir Ajustes" e ISBN a mano) |

Ejemplo en Expo Go desde la PC (Android):

```bash
adb shell am start -a android.intent.action.VIEW -d "exp://192.168.0.10:8081/--/buscar?q=borges"
```

## Datos de prueba

`src/data/libros.ts` tiene el catálogo. *Rayuela*, *Cien años de soledad* y *Código limpio* no tienen
ejemplares; *Rayuela* (2 personas) y *Código limpio* (1 persona) ya tienen lista de espera.

## Desafíos opcionales hechos

- **Tests:** 12 casos de `Pila` y `Cola` con `jest-expo` (incluye desencolar una cola vacía): `npm test`.
- **Debounce:** el buscador espera 300 ms sin escribir antes de llamar a `buscarLibros`, con limpieza del temporizador.

## Verificación

Salida de `npx expo lint`:

```
$ npx expo lint
(sin errores ni advertencias)
```

Salida de `npx tsc --noEmit`:

```
$ npx tsc --noEmit
(sin errores)
```

Salida de `npm test`:

```
Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

## Capturas

Las capturas están en la carpeta [`capturas/`](capturas/):
Catálogo cargando, con error y con datos; buscador; detalle inexistente; reserva con y sin ejemplares;
escáner en sus cuatro estados; notificación recibida; mostrador antes y después de "Entregar al
siguiente"; pantalla 404.
