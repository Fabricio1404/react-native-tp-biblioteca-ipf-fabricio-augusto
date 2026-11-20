import type { PermissionResponse } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import { estadoPermiso, type EstadoPermiso } from '@/lib/permisos';

// Traduce la respuesta de un permiso a los cuatro estados de la pantalla
// y la mantiene actualizada:
//  - al enfocar la pantalla (por ejemplo, al cerrarse /permisos encima de ella);
//  - al volver a la app (por ejemplo, desde Ajustes).
export function usePermiso(
  respuesta: PermissionResponse | null,
  consultar: () => Promise<unknown>,
): EstadoPermiso {
  const revisar = useCallback(() => {
    consultar();
  }, [consultar]);

  useFocusEffect(revisar);
  useRevisarAlVolver(revisar);

  return estadoPermiso(respuesta);
}
