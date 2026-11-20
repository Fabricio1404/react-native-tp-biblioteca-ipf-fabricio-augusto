import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { CampoTexto } from '@/components/CampoTexto';
import { Cargando } from '@/components/Cargando';
import { FilaLibro } from '@/components/FilaLibro';
import { ListaVacia } from '@/components/ListaVacia';
import { MensajeError } from '@/components/MensajeError';
import { Espaciado } from '@/constants/tema';
import { buscarLibros } from '@/lib/api';
import type { Libro } from '@/types';

// Espera sin escribir antes de llamar a la API (debounce).
const ESPERA_MS = 300;

type Resultado = {
  consulta: string; // búsqueda a la que corresponden estos libros
  libros: Libro[];
  fallo: boolean;
};

function abrirLibro(isbn: string) {
  router.navigate({ pathname: '/libro/[isbn]', params: { isbn } });
}

export default function Buscar() {
  const { q = '' } = useLocalSearchParams<{ q?: string }>();
  // Estado local para que el cursor del campo no salte mientras se escribe.
  const [texto, setTexto] = useState(q);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);

  const consulta = q.trim();

  useEffect(() => {
    if (consulta === '') {
      return;
    }
    // La limpieza corre antes del siguiente efecto (cuando cambia q) y al
    // desmontar: cancela el temporizador y marca la respuesta vieja para ignorarla.
    let cancelado = false;
    const temporizador = setTimeout(async () => {
      try {
        const libros = await buscarLibros(consulta);
        if (!cancelado) {
          setResultado({ consulta, libros, fallo: false });
        }
      } catch {
        if (!cancelado) {
          setResultado({ consulta, libros: [], fallo: true });
        }
      }
    }, ESPERA_MS);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [consulta, intento]);

  function cambiarTexto(nuevo: string) {
    setTexto(nuevo);
    // setParams cambia la URL sin apilar una pantalla nueva.
    router.setParams({ q: nuevo || undefined });
  }

  function reintentar() {
    setResultado(null);
    setIntento((anterior) => anterior + 1);
  }

  // Solo se muestran resultados si corresponden a la búsqueda actual.
  const actual = resultado?.consulta === consulta ? resultado : null;
  const cargando = consulta !== '' && actual === null;

  return (
    <FlatList
      data={actual?.libros ?? []}
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
        ) : actual?.fallo ? (
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
