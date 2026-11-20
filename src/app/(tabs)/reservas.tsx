import { StyleSheet, Text, View } from 'react-native';

import { Colores, TamanioTexto } from '@/constants/tema';

export default function MisReservas() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>Mis reservas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colores.fondo,
  },
  texto: {
    fontSize: TamanioTexto.titulo,
    color: Colores.texto,
  },
});
