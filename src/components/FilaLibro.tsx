import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AREA_TACTIL_MINIMA,
  Colores,
  Espaciado,
  Radio,
  TamanioIcono,
  TamanioTexto,
} from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import type { Libro } from '@/types';

type Props = {
  libro: Libro;
  onPress: () => void;
};

export function FilaLibro({ libro, onPress }: Props) {
  const { disponibles } = useBiblioteca();
  const cantidad = disponibles(libro.isbn);
  const hay = cantidad > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
      onPress={onPress}
      style={({ pressed }) => [styles.fila, pressed && styles.presionada]}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>
          {libro.autor} · {libro.anio}
        </Text>
      </View>
      <Text style={[styles.estado, hay ? styles.disponible : styles.agotado]}>
        {hay ? `${cantidad} disponible${cantidad === 1 ? '' : 's'}` : 'Sin ejemplares'}
      </Text>
      <Ionicons name="chevron-forward" size={TamanioIcono.chico} color={Colores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    minHeight: AREA_TACTIL_MINIMA,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.md,
    padding: Espaciado.md,
    borderRadius: Radio.medio,
    backgroundColor: Colores.superficie,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  presionada: {
    opacity: 0.8,
  },
  textos: {
    flex: 1,
    gap: Espaciado.xs,
  },
  titulo: {
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.texto,
  },
  autor: {
    fontSize: TamanioTexto.chico,
    color: Colores.textoSecundario,
  },
  estado: {
    fontSize: TamanioTexto.chico,
    fontWeight: '700',
    paddingVertical: Espaciado.xs,
    paddingHorizontal: Espaciado.sm,
    borderRadius: Radio.completo,
    overflow: 'hidden',
  },
  disponible: {
    color: Colores.acento,
    backgroundColor: Colores.acentoSuave,
  },
  agotado: {
    color: Colores.alerta,
    backgroundColor: Colores.alertaSuave,
  },
});
