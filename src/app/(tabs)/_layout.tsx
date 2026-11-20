import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { Colores } from '@/constants/tema';

function colorIcono(activa: boolean) {
  return activa ? Colores.primario : Colores.textoSecundario;
}

export default function LayoutPestanias() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colores.primario,
        tabBarInactiveTintColor: Colores.textoSecundario,
        headerStyle: { backgroundColor: Colores.primario },
        headerTintColor: Colores.textoSobrePrimario,
      }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          // La pestaña tiene su propio Stack con header.
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="library" size={size} color={colorIcono(focused)} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="bookmarks" size={size} color={colorIcono(focused)} />
          ),
        }}
      />
    </Tabs>
  );
}
