import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colores, Espaciado, TamanioTexto } from '@/constants/tema';

type Props = {
  mensaje?: string;
};

export function Cargando({ mensaje = 'Cargando…' }: Props) {
  return (
    <View style={styles.contenedor} accessibilityRole="progressbar" accessibilityLabel={mensaje}>
      <ActivityIndicator size="large" color={Colores.primario} />
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
  },
});
