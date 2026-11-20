import type { Href } from 'expo-router';

// La URL del Catálogo es "/". En Windows, el generador de rutas tipadas de Expo
// no quita el "/index" final de (tabs)/(catalogo)/index.tsx y la tipa como "/index",
// así que se indica el tipo una sola vez acá en lugar de en cada pantalla.
export const RUTA_CATALOGO = '/' as Href;
