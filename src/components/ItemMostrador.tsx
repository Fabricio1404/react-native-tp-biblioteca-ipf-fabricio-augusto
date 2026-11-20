import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { buscarPorIsbn } from '@/lib/catalogo';

type Props = {
  isbn: string;
  onEntregar: () => void;
};

export function ItemMostrador({ isbn, onEntregar }: Props) {
  const { enEspera } = useBiblioteca();
  const personas = enEspera(isbn);
  const titulo = buscarPorIsbn(isbn)?.titulo ?? isbn;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.dato}>Al frente: {personas[0]}</Text>
      <Text style={styles.dato}>
        {personas.length === 1 ? '1 persona esperando' : `${personas.length} personas esperando`}
      </Text>
      <Boton
        titulo="Entregar al siguiente"
        icono="hand-right"
        accessibilityLabel={`Entregar ${titulo} a ${personas[0]}`}
        onPress={onEntregar}
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
  dato: {
    fontSize: TamanioTexto.normal,
    color: Colores.textoSecundario,
  },
});
