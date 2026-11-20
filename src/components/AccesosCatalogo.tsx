import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Espaciado } from '@/constants/tema';

export function AccesosCatalogo() {
  return (
    <View style={styles.fila}>
      <View style={styles.celda}>
        <Link href="/buscar" asChild>
          <Boton titulo="Buscar" icono="search" variante="secundario" />
        </Link>
      </View>
      <View style={styles.celda}>
        <Link href="/escanear" asChild>
          <Boton titulo="Escanear" icono="barcode" variante="secundario" />
        </Link>
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
