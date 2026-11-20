import { Stack } from 'expo-router';

import { EnlacePersonal } from '@/components/EnlacePersonal';
import { Colores } from '@/constants/tema';

// Con un deep link a /libro/[isbn] o /escanear, el Catálogo queda debajo
// en la pila de la pestaña y "atrás" vuelve a él en lugar de salir de la app.
export const unstable_settings = {
  anchor: 'index',
};

export default function LayoutCatalogo() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colores.primario },
        headerTintColor: Colores.textoSobrePrimario,
        contentStyle: { backgroundColor: Colores.fondo },
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Catálogo', headerRight: () => <EnlacePersonal /> }}
      />
      <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
    </Stack>
  );
}
