import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { CampoTexto } from '@/components/CampoTexto';
import { Cargando } from '@/components/Cargando';
import { FilaLibro } from '@/components/FilaLibro';
import { ListaVacia } from '@/components/ListaVacia';
import { MensajeError } from '@/components/MensajeError';
import { Espaciado } from '@/constants/tema';
import { useBusquedaLibros } from '@/hooks/useBusquedaLibros';

function abrirLibro(isbn: string) {
  router.navigate({ pathname: '/libro/[isbn]', params: { isbn } });
}

export default function Buscar() {
  const { q = '' } = useLocalSearchParams<{ q?: string }>();
  // Estado local para que el cursor del campo no salte mientras se escribe.
  const [texto, setTexto] = useState(q);
  const consulta = q.trim();
  const { libros, cargando, fallo, reintentar } = useBusquedaLibros(consulta);

  function cambiarTexto(nuevo: string) {
    setTexto(nuevo);
    // setParams cambia la URL sin apilar una pantalla nueva.
    router.setParams({ q: nuevo || undefined });
  }

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} onPress={() => abrirLibro(item.isbn)} />}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <CampoTexto
          value={texto}
          onChangeText={cambiarTexto}
          placeholder="Buscá por título o autor"
          accessibilityLabel="Buscar por título o autor"
          autoCorrect={false}
          autoFocus
          returnKeyType="search"
        />
      }
      ListEmptyComponent={
        consulta === '' ? (
          <ListaVacia mensaje="Escribí un título o un autor para buscar." icono="search" />
        ) : cargando ? (
          <Cargando mensaje="Buscando…" />
        ) : fallo ? (
          <MensajeError
            mensaje="No pudimos completar la búsqueda. Intentá de nuevo."
            textoAccion="Reintentar"
            onAccion={reintentar}
          />
        ) : (
          <ListaVacia mensaje={`No encontramos libros para "${consulta}".`} />
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
});
