import { StyleSheet, Text, View } from 'react-native';

import { Colores, Espaciado, TamanioTexto } from '@/constants/tema';

type Props = {
  etiqueta: string;
  valor: string;
};

export function DatoLibro({ etiqueta, valor }: Props) {
  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Espaciado.md,
    paddingVertical: Espaciado.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colores.borde,
  },
  etiqueta: {
    fontSize: TamanioTexto.normal,
    color: Colores.textoSecundario,
  },
  valor: {
    flexShrink: 1,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
    color: Colores.texto,
    textAlign: 'right',
  },
});
