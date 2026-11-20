import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AREA_TACTIL_MINIMA, Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

type Props = {
  onAbrir: (isbn: string) => void;
};

export function VistosRecientemente({ onAbrir }: Props) {
  const { recientes } = useBiblioteca();

  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo}>Vistos recientemente</Text>
      {recientes.length === 0 ? (
        <Text style={styles.vacio}>Todavía no abriste ningún libro.</Text>
      ) : (
        <View style={styles.lista}>
          {recientes.map((libro) => (
            <Pressable
              key={libro.isbn}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${libro.titulo}`}
              onPress={() => onAbrir(libro.isbn)}
              style={({ pressed }) => [styles.chip, pressed && styles.presionado]}>
              <Text style={styles.textoChip} numberOfLines={2}>
                {libro.titulo}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    gap: Espaciado.sm,
  },
  titulo: {
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.primario,
  },
  vacio: {
    fontSize: TamanioTexto.chico,
    color: Colores.textoSecundario,
  },
  lista: {
    flexDirection: 'row',
    gap: Espaciado.sm,
  },
  chip: {
    flex: 1,
    minHeight: AREA_TACTIL_MINIMA,
    justifyContent: 'center',
    padding: Espaciado.sm,
    borderRadius: Radio.medio,
    backgroundColor: Colores.primarioSuave,
  },
  presionado: {
    opacity: 0.8,
  },
  textoChip: {
    fontSize: TamanioTexto.chico,
    fontWeight: '600',
    color: Colores.primario,
  },
});
