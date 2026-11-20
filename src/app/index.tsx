import { StyleSheet, Text, View } from 'react-native';

export default function Inicio() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Biblioteca IPF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
  },
});
