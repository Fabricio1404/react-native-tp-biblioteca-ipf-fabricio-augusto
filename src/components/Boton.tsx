import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import {
  AREA_TACTIL_MINIMA,
  Colores,
  Espaciado,
  Radio,
  TamanioIcono,
  TamanioTexto,
} from '@/constants/tema';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  titulo: string;
  variante?: Variante;
  icono?: ComponentProps<typeof Ionicons>['name'];
};

const COLOR_TEXTO: Record<Variante, string> = {
  primario: Colores.textoSobrePrimario,
  secundario: Colores.primario,
  peligro: Colores.peligro,
};

// Para navegar se usa onPress con router (no <Link asChild>): así el botón
// conserva siempre su estilo, también en la versión web.
export function Boton({
  titulo,
  variante = 'primario',
  icono,
  disabled,
  accessibilityRole = 'button',
  ...resto
}: Props) {
  return (
    <Pressable
      {...resto}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        pressed && styles.presionado,
        disabled && styles.deshabilitado,
      ]}>
      {icono && <Ionicons name={icono} size={TamanioIcono.chico} color={COLOR_TEXTO[variante]} />}
      <Text style={[styles.texto, textos[variante]]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: AREA_TACTIL_MINIMA,
    minWidth: AREA_TACTIL_MINIMA,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.sm,
    paddingVertical: Espaciado.md,
    paddingHorizontal: Espaciado.lg,
    borderRadius: Radio.medio,
  },
  primario: {
    backgroundColor: Colores.primario,
  },
  secundario: {
    backgroundColor: Colores.primarioSuave,
  },
  peligro: {
    backgroundColor: Colores.peligroSuave,
  },
  presionado: {
    opacity: 0.8,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  texto: {
    flexShrink: 1,
    fontSize: TamanioTexto.normal,
    fontWeight: '700',
    textAlign: 'center',
  },
});

const textos = StyleSheet.create({
  primario: {
    color: COLOR_TEXTO.primario,
  },
  secundario: {
    color: COLOR_TEXTO.secundario,
  },
  peligro: {
    color: COLOR_TEXTO.peligro,
  },
});
