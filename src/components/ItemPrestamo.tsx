import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { buscarPorIsbn } from '@/lib/catalogo';
import { formatearFecha } from '@/lib/fechas';
import type { Prestamo } from '@/types';

type Props = {
  prestamo: Prestamo;
};

export function ItemPrestamo({ prestamo }: Props) {
  const { devolver } = useBiblioteca();
  const titulo = buscarPorIsbn(prestamo.isbn)?.titulo ?? prestamo.isbn;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.fecha}>Devolvelo antes del {formatearFecha(prestamo.devolucion)}</Text>
      <Boton
        titulo="Devolver"
        icono="return-down-back"
        variante="peligro"
        accessibilityLabel={`Devolver ${titulo}`}
        onPress={() => devolver(prestamo.isbn)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: Espaciado.sm,
    padding: Espaciado.lg,
    borderRadius: Radio.medio,
    backgroundColor: Colores.superficie,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  titulo: {
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.texto,
  },
  fecha: {
    fontSize: TamanioTexto.normal,
    color: Colores.textoSecundario,
  },
});
