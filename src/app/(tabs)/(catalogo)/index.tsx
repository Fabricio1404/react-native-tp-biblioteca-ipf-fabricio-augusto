import { StyleSheet, Text, View } from 'react-native';

import { Colores, TamanioTexto } from '@/constants/tema';

export default function Catalogo() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>Catálogo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontSize: TamanioTexto.titulo,
    color: Colores.texto,
  },
});
