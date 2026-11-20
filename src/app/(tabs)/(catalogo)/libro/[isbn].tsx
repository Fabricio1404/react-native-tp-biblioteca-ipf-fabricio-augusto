import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DatoLibro } from '@/components/DatoLibro';
import { SinResultado } from '@/components/SinResultado';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { buscarPorIsbn, esIsbnValido } from '@/lib/catalogo';
import { formatearFecha } from '@/lib/fechas';

export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { registrarVisto, disponibles, enEspera, miPosicion, prestamos } = useBiblioteca();

  // La ruta acepta cualquier texto: validar que sea un ISBN y que exista es tarea nuestra.
  const valido = esIsbnValido(isbn);
  const libro = valido ? buscarPorIsbn(isbn) : undefined;

  useEffect(() => {
    if (libro) {
      registrarVisto(libro);
    }
  }, [libro, registrarVisto]);

  if (!valido) {
    return (
      <>
        <Stack.Screen options={{ title: 'ISBN inválido' }} />
        <SinResultado
          mensaje={`"${isbn}" no es un ISBN válido. Un ISBN tiene 13 números, sin guiones.`}
        />
      </>
    );
  }

  if (!libro) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <SinResultado mensaje={`No tenemos ningún libro con el ISBN ${isbn} en el catálogo.`} />
      </>
    );
  }

  const prestamo = prestamos.find((p) => p.isbn === libro.isbn);
  const posicion = miPosicion(libro.isbn);
  const esperando = enEspera(libro.isbn).length;

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />

      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>{libro.autor}</Text>

        <DatoLibro etiqueta="Año" valor={String(libro.anio)} />
        <DatoLibro etiqueta="ISBN" valor={libro.isbn} />
        <DatoLibro etiqueta="Ejemplares disponibles" valor={String(disponibles(libro.isbn))} />
        <DatoLibro etiqueta="Personas en espera" valor={String(esperando)} />
      </View>

      {prestamo && (
        <Text style={styles.estado}>
          Lo tenés prestado. Devolvelo antes del {formatearFecha(prestamo.devolucion)}.
        </Text>
      )}
      {posicion !== null && (
        <Text style={styles.estado}>Estás en la lista de espera, en la posición {posicion}.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    gap: Espaciado.lg,
    padding: Espaciado.lg,
  },
  tarjeta: {
    gap: Espaciado.xs,
    padding: Espaciado.lg,
    borderRadius: Radio.grande,
    backgroundColor: Colores.superficie,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  titulo: {
    fontSize: TamanioTexto.tituloGrande,
    fontWeight: '800',
    color: Colores.primario,
  },
  autor: {
    fontSize: TamanioTexto.grande,
    color: Colores.textoSecundario,
    marginBottom: Espaciado.sm,
  },
  estado: {
    padding: Espaciado.md,
    borderRadius: Radio.medio,
    backgroundColor: Colores.acentoSuave,
    color: Colores.acento,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
  },
});
