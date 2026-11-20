import { StyleSheet, Text } from 'react-native';

import { Colores, Espaciado, TamanioTexto } from '@/constants/tema';

type Props = {
  children: string;
};

export function TituloSeccion({ children }: Props) {
  return (
    <Text style={styles.titulo} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  titulo: {
    marginTop: Espaciado.sm,
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.primario,
  },
});
