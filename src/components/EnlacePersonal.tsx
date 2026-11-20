import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AREA_TACTIL_MINIMA, Colores, Espaciado, TamanioIcono, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

// Link del header del Catálogo: sin sesión lleva al login y con sesión al mostrador.
export function EnlacePersonal() {
  const { sesionIniciada } = useBiblioteca();

  return (
    <Link href={sesionIniciada ? '/mostrador' : '/login'} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sesionIniciada ? 'Ir al mostrador' : 'Ingreso del personal'}
        style={styles.enlace}>
        <Ionicons
          name="person-circle"
          size={TamanioIcono.normal}
          color={Colores.textoSobrePrimario}
        />
        <Text style={styles.texto}>Personal</Text>
      </Pressable>
    </Link>
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
  texto: {
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
    color: Colores.textoSobrePrimario,
  },
});
