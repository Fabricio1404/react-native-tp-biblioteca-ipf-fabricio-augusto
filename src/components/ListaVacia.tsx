import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colores, Espaciado, TamanioIcono, TamanioTexto } from '@/constants/tema';

type Props = {
  mensaje: string;
  icono?: ComponentProps<typeof Ionicons>['name'];
};

export function ListaVacia({ mensaje, icono = 'file-tray-outline' }: Props) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={TamanioIcono.grande} color={Colores.textoSecundario} />
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.md,
    padding: Espaciado.xl,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    color: Colores.textoSecundario,
    textAlign: 'center',
  },
});
