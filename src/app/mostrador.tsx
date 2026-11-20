import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ItemMostrador } from '@/components/ItemMostrador';
import { ListaVacia } from '@/components/ListaVacia';
import { YO } from '@/constants/biblioteca';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { buscarPorIsbn } from '@/lib/catalogo';

// Al cerrar sesión el guard pasa a false: esta pantalla deja de existir
// y desaparece del historial, así que "atrás" no puede volver acá.
export default function Mostrador() {
  const { conEspera, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [mensaje, setMensaje] = useState<string | null>(null);

  function entregar(isbn: string) {
    const titulo = buscarPorIsbn(isbn)?.titulo ?? isbn;
    const persona = entregarAlSiguiente(isbn);
    if (persona === null) {
      setMensaje(`Nadie está esperando "${titulo}".`);
    } else if (persona === YO) {
      setMensaje(`Entregaste "${titulo}" a la persona que usa esta app.`);
    } else {
      setMensaje(`Entregaste "${titulo}" a ${persona}.`);
    }
  }

  return (
    <FlatList
      data={conEspera}
      keyExtractor={(isbn) => isbn}
      renderItem={({ item }) => <ItemMostrador isbn={item} onEntregar={() => entregar(item)} />}
      contentContainerStyle={styles.contenido}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          <Text style={styles.texto}>Libros con lista de espera, en orden de llegada.</Text>
          {mensaje && (
            <Text style={styles.mensaje} accessibilityRole="alert">
              {mensaje}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={<ListaVacia mensaje="No hay libros con lista de espera." />}
      ListFooterComponent={
        <Boton titulo="Cerrar sesión" icono="log-out" variante="peligro" onPress={cerrarSesion} />
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
    gap: Espaciado.sm,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    color: Colores.textoSecundario,
  },
  mensaje: {
    padding: Espaciado.md,
    borderRadius: Radio.medio,
    backgroundColor: Colores.acentoSuave,
    color: Colores.acento,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
  },
});
