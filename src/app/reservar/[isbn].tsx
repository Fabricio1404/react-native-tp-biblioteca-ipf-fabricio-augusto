import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { SinResultado } from '@/components/SinResultado';
import { DIAS_PRESTAMO } from '@/constants/biblioteca';
import { Colores, Espaciado, Interlineado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { buscarPorIsbn, esIsbnValido } from '@/lib/catalogo';
import { formatearFecha, sumarDias } from '@/lib/fechas';
import { cerrarModalEIrAReservas } from '@/lib/navegacion';

export default function ConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { disponibles, enEspera, tieneReserva, reservar } = useBiblioteca();

  const libro = esIsbnValido(isbn) ? buscarPorIsbn(isbn) : undefined;

  if (!libro) {
    return <SinResultado mensaje="No encontramos el libro que querés reservar." />;
  }

  if (tieneReserva(libro.isbn)) {
    return (
      <View style={styles.contenido}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.aviso}>
          Ya reservaste este libro. No se puede reservar dos veces el mismo título.
        </Text>
        <Boton titulo="Ver mis reservas" icono="bookmarks" onPress={cerrarModalEIrAReservas} />
      </View>
    );
  }

  const hayEjemplares = disponibles(libro.isbn) > 0;
  const devolucion = sumarDias(new Date(), DIAS_PRESTAMO).toISOString();
  const posicion = enEspera(libro.isbn).length + 1;

  function confirmar() {
    if (libro) {
      reservar(libro.isbn);
      cerrarModalEIrAReservas();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.autor}>{libro.autor}</Text>

      <View style={[styles.caja, hayEjemplares ? styles.cajaPrestamo : styles.cajaEspera]}>
        <Text style={styles.textoCaja}>
          {hayEjemplares
            ? `Hay ejemplares en el estante. Te lo prestamos por ${DIAS_PRESTAMO} días: tenés que devolverlo antes del ${formatearFecha(devolucion)}.`
            : `No hay ejemplares disponibles. Vas a quedar en la lista de espera en la posición ${posicion}.`}
        </Text>
      </View>

      <Boton
        titulo={hayEjemplares ? 'Confirmar préstamo' : 'Anotarme en la lista de espera'}
        icono="checkmark-circle"
        onPress={confirmar}
      />
      <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    gap: Espaciado.lg,
    padding: Espaciado.lg,
  },
  titulo: {
    fontSize: TamanioTexto.titulo,
    fontWeight: '800',
    color: Colores.primario,
  },
  autor: {
    fontSize: TamanioTexto.grande,
    color: Colores.textoSecundario,
  },
  caja: {
    padding: Espaciado.lg,
    borderRadius: Radio.medio,
  },
  cajaPrestamo: {
    backgroundColor: Colores.acentoSuave,
  },
  cajaEspera: {
    backgroundColor: Colores.alertaSuave,
  },
  textoCaja: {
    fontSize: TamanioTexto.normal,
    color: Colores.texto,
    lineHeight: Interlineado.normal,
  },
  aviso: {
    fontSize: TamanioTexto.normal,
    color: Colores.texto,
  },
});
