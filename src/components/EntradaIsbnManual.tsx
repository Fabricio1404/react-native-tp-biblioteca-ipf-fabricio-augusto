import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Colores, Espaciado, TamanioTexto } from '@/constants/tema';

type Props = {
  onAbrir: (isbn: string) => void;
};

// Alternativa a la cámara: siempre está disponible, haya permiso o no.
export function EntradaIsbnManual({ onAbrir }: Props) {
  const [texto, setTexto] = useState('');

  function abrir() {
    onAbrir(texto.replace(/[-\s]/g, ''));
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>¿Preferís escribirlo?</Text>
      <CampoTexto
        value={texto}
        onChangeText={setTexto}
        placeholder="ISBN de 13 números"
        accessibilityLabel="ISBN del libro"
        keyboardType="number-pad"
        maxLength={17}
        returnKeyType="go"
        onSubmitEditing={abrir}
      />
      <Boton titulo="Abrir libro" icono="book" variante="secundario" onPress={abrir} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: Espaciado.sm,
  },
  titulo: {
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.primario,
  },
});
