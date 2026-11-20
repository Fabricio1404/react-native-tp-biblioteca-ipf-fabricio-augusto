import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AREA_TACTIL_MINIMA, Colores, Espaciado, TamanioIcono, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

// Link del header del Catálogo: sin sesión lleva al login y con sesión al mostrador.
export function EnlacePersonal() {
  const { sesionIniciada } = useBiblioteca();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={sesionIniciada ? 'Ir al mostrador' : 'Ingreso del personal'}
      onPress={() => router.push(sesionIniciada ? '/mostrador' : '/login')}
      style={({ pressed }) => [styles.enlace, pressed && styles.presionado]}>
      <Ionicons name="person-circle" size={TamanioIcono.normal} color={Colores.textoSobrePrimario} />
      <Text style={styles.texto}>Personal</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  enlace: {
    minHeight: AREA_TACTIL_MINIMA,
    minWidth: AREA_TACTIL_MINIMA,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.xs,
    paddingHorizontal: Espaciado.sm,
  },
  presionado: {
    opacity: 0.7,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
    color: Colores.textoSobrePrimario,
  },
});
