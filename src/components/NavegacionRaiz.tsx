import { Stack } from 'expo-router';

import { Colores } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

// Stack raíz. Lee la sesión del Context para decidir qué rutas existen.
export function NavegacionRaiz() {
  const { sesionIniciada } = useBiblioteca();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colores.primario },
        headerTintColor: Colores.textoSobrePrimario,
        contentStyle: { backgroundColor: Colores.fondo },
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{ title: 'Confirmar reserva', presentation: 'modal' }}
      />

      {/* Rutas protegidas: solo existen mientras el guard es true. */}
      <Stack.Protected guard={!sesionIniciada}>
        <Stack.Screen
          name="login"
          options={{ title: 'Ingreso del personal', presentation: 'modal' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={sesionIniciada}>
        <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
      </Stack.Protected>
    </Stack>
  );
}
