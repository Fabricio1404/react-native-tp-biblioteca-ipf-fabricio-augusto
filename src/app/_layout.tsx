import { Stack } from 'expo-router';

import { Colores } from '@/constants/tema';
import { BibliotecaProvider } from '@/context/biblioteca';

// Si la app se abre con un deep link (por ejemplo a /buscar),
// las pestañas quedan debajo en la pila para poder volver.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colores.primario },
          headerTintColor: Colores.textoSobrePrimario,
          contentStyle: { backgroundColor: Colores.fondo },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
      </Stack>
    </BibliotecaProvider>
  );
}
