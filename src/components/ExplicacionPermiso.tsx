import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { Colores, Espaciado, Interlineado, TamanioIcono, TamanioTexto } from '@/constants/tema';
import type { EstadoPermiso, Recurso } from '@/lib/permisos';

type Props = {
  recurso: Recurso;
  estado: EstadoPermiso;
  onContinuar: () => void;
};

// Pantalla previa: el beneficio en una frase y un único botón.
export function ExplicacionPermiso({ recurso, estado, onContinuar }: Props) {
  const textos = TEXTOS_PERMISO[recurso];

  if (estado === 'cargando') {
    return <Cargando mensaje="Revisando el permiso…" />;
  }

  const bloqueado = estado === 'bloqueado';

  return (
    <View style={styles.contenedor}>
      <Ionicons name={textos.icono} size={TamanioIcono.grande} color={Colores.primario} />
      <Text style={styles.titulo}>{textos.titulo}</Text>
      <Text style={styles.texto}>{bloqueado ? textos.bloqueado : textos.beneficio}</Text>
      {bloqueado ? (
        <Boton titulo="Abrir Ajustes" icono="settings" onPress={() => Linking.openSettings()} />
      ) : (
        <Boton titulo="Continuar" icono="arrow-forward" onPress={onContinuar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.lg,
    padding: Espaciado.xl,
  },
  titulo: {
    fontSize: TamanioTexto.titulo,
    fontWeight: '800',
    color: Colores.primario,
  },
  texto: {
    fontSize: TamanioTexto.grande,
    lineHeight: Interlineado.normal,
    color: Colores.texto,
    textAlign: 'center',
  },
});
