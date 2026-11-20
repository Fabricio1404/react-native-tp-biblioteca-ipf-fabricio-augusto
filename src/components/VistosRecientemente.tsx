import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TituloSeccion } from '@/components/TituloSeccion';
import {
  AREA_TACTIL_MINIMA,
  Colores,
  Espaciado,
  Radio,
  TamanioIcono,
  TamanioTexto,
} from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

type Props = {
  onAbrir: (isbn: string) => void;
};

export function VistosRecientemente({ onAbrir }: Props) {
  const { recientes } = useBiblioteca();

  return (
    <View style={styles.seccion}>
      <TituloSeccion>Vistos recientemente</TituloSeccion>
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
              style={({ pressed }) => [styles.item, pressed && styles.presionado]}>
              <Ionicons name="time-outline" size={TamanioIcono.chico} color={Colores.primario} />
              <Text style={styles.texto}>{libro.titulo}</Text>
              <Ionicons name="chevron-forward" size={TamanioIcono.chico} color={Colores.primario} />
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
  vacio: {
    fontSize: TamanioTexto.chico,
    color: Colores.textoSecundario,
  },
  lista: {
    gap: Espaciado.xs,
  },
  item: {
    minHeight: AREA_TACTIL_MINIMA,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.sm,
    paddingHorizontal: Espaciado.md,
    paddingVertical: Espaciado.sm,
    borderRadius: Radio.medio,
    backgroundColor: Colores.primarioSuave,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    flex: 1,
    flexShrink: 1,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
    color: Colores.primario,
  },
});
