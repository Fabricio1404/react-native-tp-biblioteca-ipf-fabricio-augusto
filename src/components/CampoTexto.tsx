import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { AREA_TACTIL_MINIMA, Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'>;

export function CampoTexto(props: Props) {
  return (
    <TextInput
      placeholderTextColor={Colores.textoSecundario}
      style={styles.campo}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  campo: {
    minHeight: AREA_TACTIL_MINIMA,
    paddingHorizontal: Espaciado.md,
    paddingVertical: Espaciado.md,
    borderRadius: Radio.medio,
    borderWidth: 1,
    borderColor: Colores.borde,
    backgroundColor: Colores.superficie,
    fontSize: TamanioTexto.grande,
    color: Colores.texto,
  },
});
