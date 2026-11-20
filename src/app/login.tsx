import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

// Al iniciar sesión no se llama a router.back(): el guard de Stack.Protected
// pasa a false, esta pantalla deja de existir y el modal se cierra solo.
export default function Login() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  function ingresar() {
    if (!iniciarSesion(usuario, clave)) {
      setError('Usuario o clave incorrectos. Revisalos e intentá de nuevo.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <Text style={styles.texto}>Ingresá con la cuenta del personal de biblioteca.</Text>
      <CampoTexto
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Usuario"
        accessibilityLabel="Usuario"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />
      <CampoTexto
        value={clave}
        onChangeText={setClave}
        placeholder="Clave"
        accessibilityLabel="Clave"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={ingresar}
      />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Boton titulo="Ingresar" icono="log-in" onPress={ingresar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    gap: Espaciado.md,
    padding: Espaciado.lg,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    color: Colores.texto,
  },
  error: {
    padding: Espaciado.md,
    borderRadius: Radio.medio,
    backgroundColor: Colores.peligroSuave,
    color: Colores.peligro,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
  },
});
