import { Stack } from 'expo-router';

import { Colores } from '@/constants/tema';

export default function LayoutCatalogo() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colores.primario },
        headerTintColor: Colores.textoSobrePrimario,
        contentStyle: { backgroundColor: Colores.fondo },
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="index" options={{ title: 'Catálogo' }} />
    </Stack>
  );
}
