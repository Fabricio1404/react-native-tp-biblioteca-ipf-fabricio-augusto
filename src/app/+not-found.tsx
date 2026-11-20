import { Link, Stack, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { RUTA_CATALOGO } from '@/constants/rutas';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';

export default function NoEncontrada() {
  const ruta = usePathname();

  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <Text style={styles.codigo}>404</Text>
      <Text style={styles.texto}>No existe ninguna pantalla para esta dirección:</Text>
      <Text style={styles.ruta}>{ruta}</Text>
      <Link href={RUTA_CATALOGO} asChild>
        <Boton titulo="Ir al Catálogo" icono="library" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.md,
    padding: Espaciado.xl,
    backgroundColor: Colores.fondo,
  },
  codigo: {
    fontSize: TamanioTexto.gigante,
    fontWeight: '900',
    color: Colores.primario,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    color: Colores.texto,
    textAlign: 'center',
  },
  ruta: {
    paddingHorizontal: Espaciado.md,
    paddingVertical: Espaciado.xs,
    borderRadius: Radio.chico,
    backgroundColor: Colores.primarioSuave,
    color: Colores.primario,
    fontSize: TamanioTexto.normal,
    fontWeight: '700',
  },
});
