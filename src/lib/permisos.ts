import type { PermissionResponse } from 'expo-camera';

export type Recurso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export function esRecurso(valor: string): valor is Recurso {
  return valor === 'camara' || valor === 'notificaciones';
}

export function estadoPermiso(respuesta: PermissionResponse | null): EstadoPermiso {
  if (!respuesta) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  // Con status no alcanza: después de un "No permitir", status es 'denied' tanto si
  // el sistema vuelve a mostrar el diálogo como si ya no lo hace. canAskAgain lo distingue.
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}
