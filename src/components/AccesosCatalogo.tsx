import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Espaciado } from '@/constants/tema';

export function AccesosCatalogo() {
  return (
    <View style={styles.fila}>
      <View style={styles.celda}>
        <Boton
          titulo="Buscar"
          icono="search"
          variante="secundario"
          onPress={() => router.push('/buscar')}
        />
      </View>
      <View style={styles.celda}>
        <Boton
          titulo="Escanear"
          icono="barcode"
          variante="secundario"
          onPress={() => router.push('/escanear')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: Espaciado.sm,
  },
  celda: {
    flex: 1,
  },
});
