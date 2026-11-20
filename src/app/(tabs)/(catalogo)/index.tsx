import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { AccesosCatalogo } from '@/components/AccesosCatalogo';
import { Cargando } from '@/components/Cargando';
import { FilaLibro } from '@/components/FilaLibro';
import { ListaVacia } from '@/components/ListaVacia';
import { MensajeError } from '@/components/MensajeError';
import { VistosRecientemente } from '@/components/VistosRecientemente';
import { Espaciado } from '@/constants/tema';
import { useLibros } from '@/hooks/useLibros';

function abrirLibro(isbn: string) {
  router.push({ pathname: '/libro/[isbn]', params: { isbn } });
}

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} onPress={() => abrirLibro(item.isbn)} />}
      contentContainerStyle={styles.contenido}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          <VistosRecientemente onAbrir={abrirLibro} />
          <AccesosCatalogo />
        </View>
      }
      ListEmptyComponent={
        cargando ? (
          <Cargando mensaje="Cargando el catálogo…" />
        ) : error ? (
          <MensajeError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />
        ) : (
          <ListaVacia mensaje="El catálogo está vacío por ahora." />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  contenido: {
    gap: Espaciado.sm,
    padding: Espaciado.lg,
  },
  encabezado: {
    gap: Espaciado.lg,
    marginBottom: Espaciado.sm,
  },
});
