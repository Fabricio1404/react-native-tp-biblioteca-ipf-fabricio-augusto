import { StyleSheet, Text, View } from 'react-native';

import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { buscarPorIsbn } from '@/lib/catalogo';

type Props = {
  isbn: string;
  posicion: number;
};

export function ItemEspera({ isbn, posicion }: Props) {
  const titulo = buscarPorIsbn(isbn)?.titulo ?? isbn;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.posicion}>
        {posicion === 1 ? 'Sos la próxima persona en recibirlo.' : `Posición ${posicion} en la lista de espera.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: Espaciado.xs,
    padding: Espaciado.lg,
    borderRadius: Radio.medio,
    backgroundColor: Colores.alertaSuave,
  },
  titulo: {
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.texto,
  },
  posicion: {
    fontSize: TamanioTexto.normal,
    color: Colores.alerta,
    fontWeight: '600',
  },
});
