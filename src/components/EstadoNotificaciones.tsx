import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Colores, Espaciado, Radio, TamanioIcono, TamanioTexto } from '@/constants/tema';
import type { EstadoPermiso } from '@/lib/permisos';

type Props = {
  estado: EstadoPermiso;
};

const TEXTOS: Record<EstadoPermiso, string> = {
  cargando: 'Revisando las notificaciones…',
  concedido: 'Notificaciones permitidas: te avisamos aunque la app esté cerrada.',
  preguntable: 'Activá "Recordarme" en un préstamo para recibir notificaciones.',
  bloqueado: 'Notificaciones desactivadas: los avisos te aparecen acá, dentro de la app.',
};

export function EstadoNotificaciones({ estado }: Props) {
  const permitidas = estado === 'concedido';

  return (
    <View style={styles.caja}>
      <Ionicons
        name={permitidas ? 'notifications' : 'notifications-off'}
        size={TamanioIcono.chico}
        color={permitidas ? Colores.acento : Colores.textoSecundario}
      />
      <Text style={styles.texto}>{TEXTOS[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.sm,
    padding: Espaciado.md,
    borderRadius: Radio.medio,
    backgroundColor: Colores.superficie,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  texto: {
    flex: 1,
    fontSize: TamanioTexto.chico,
    color: Colores.textoSecundario,
  },
});
