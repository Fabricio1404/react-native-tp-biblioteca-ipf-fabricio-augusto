import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Colores, Espaciado, Radio, TamanioIcono, TamanioTexto } from '@/constants/tema';
import type { Aviso } from '@/types';

type Props = {
  aviso: Aviso;
  onDescartar: () => void;
};

export function TarjetaAviso({ aviso, onDescartar }: Props) {
  return (
    <View style={styles.tarjeta} accessibilityRole="alert">
      <View style={styles.fila}>
        <Ionicons name="notifications" size={TamanioIcono.normal} color={Colores.acento} />
        <Text style={styles.mensaje}>{aviso.mensaje}</Text>
      </View>
      <Boton titulo="Entendido" variante="secundario" onPress={onDescartar} />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: Espaciado.md,
    padding: Espaciado.lg,
    borderRadius: Radio.medio,
    backgroundColor: Colores.acentoSuave,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.md,
  },
  mensaje: {
    flex: 1,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
    color: Colores.texto,
  },
});
