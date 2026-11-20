import { router } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { AREA_TACTIL_MINIMA, Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { buscarPorIsbn } from '@/lib/catalogo';
import { formatearFecha } from '@/lib/fechas';
import type { EstadoPermiso } from '@/lib/permisos';
import type { Prestamo } from '@/types';

type Props = {
  prestamo: Prestamo;
  permisoNotificaciones: EstadoPermiso;
};

export function ItemPrestamo({ prestamo, permisoNotificaciones }: Props) {
  const { devolver, activarRecordatorio, desactivarRecordatorio } = useBiblioteca();
  const titulo = buscarPorIsbn(prestamo.isbn)?.titulo ?? prestamo.isbn;

  function cambiarRecordatorio(activo: boolean) {
    if (!activo) {
      desactivarRecordatorio(prestamo.isbn);
    } else if (permisoNotificaciones === 'concedido') {
      activarRecordatorio(prestamo.isbn);
    } else {
      // El permiso se pide recién acá, en contexto, pasando antes por la pantalla previa.
      router.push({
        pathname: '/permisos/[recurso]',
        params: { recurso: 'notificaciones', isbn: prestamo.isbn },
      });
    }
  }

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.fecha}>Devolvelo antes del {formatearFecha(prestamo.devolucion)}</Text>

      <View style={styles.fila}>
        <Text style={styles.etiqueta}>Recordarme</Text>
        <Switch
          value={prestamo.recordatorio}
          onValueChange={cambiarRecordatorio}
          accessibilityLabel={`Recordarme devolver ${titulo}`}
          trackColor={{ true: Colores.acento, false: Colores.borde }}
          thumbColor={Colores.superficie}
        />
      </View>

      <Boton
        titulo="Devolver"
        icono="return-down-back"
        variante="peligro"
        accessibilityLabel={`Devolver ${titulo}`}
        onPress={() => devolver(prestamo.isbn)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: Espaciado.sm,
    padding: Espaciado.lg,
    borderRadius: Radio.medio,
    backgroundColor: Colores.superficie,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  titulo: {
    fontSize: TamanioTexto.grande,
    fontWeight: '700',
    color: Colores.texto,
  },
  fecha: {
    fontSize: TamanioTexto.normal,
    color: Colores.textoSecundario,
  },
  fila: {
    minHeight: AREA_TACTIL_MINIMA,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
    color: Colores.texto,
  },
});
