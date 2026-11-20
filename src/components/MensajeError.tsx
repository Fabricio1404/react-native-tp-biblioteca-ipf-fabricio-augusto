import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Colores, Espaciado, TamanioIcono, TamanioTexto } from '@/constants/tema';

type Props = {
  mensaje: string;
  textoAccion: string;
  onAccion: () => void;
};

// Todo error ofrece una acción para salir de él (reintentar, volver, etc.).
export function MensajeError({ mensaje, textoAccion, onAccion }: Props) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name="alert-circle" size={TamanioIcono.grande} color={Colores.peligro} />
      <Text style={styles.texto}>{mensaje}</Text>
      <Boton titulo={textoAccion} icono="refresh" onPress={onAccion} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.md,
    padding: Espaciado.xl,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    color: Colores.texto,
    textAlign: 'center',
  },
});
