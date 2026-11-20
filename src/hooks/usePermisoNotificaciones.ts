import type { PermissionResponse } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';

import { consultarPermisoNotificaciones, pedirPermisoNotificaciones } from '@/lib/notificaciones';

// Misma forma que useCameraPermissions: [respuesta, pedir, consultar].
export function usePermisoNotificaciones() {
  const [respuesta, setRespuesta] = useState<PermissionResponse | null>(null);
  // Evita actualizar el estado si la pantalla se desmontó mientras se esperaba la respuesta.
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const consultar = useCallback(async () => {
    const nueva = await consultarPermisoNotificaciones();
    if (montado.current) {
      setRespuesta(nueva);
    }
    return nueva;
  }, []);

  const pedir = useCallback(async () => {
    const nueva = await pedirPermisoNotificaciones();
    if (montado.current) {
      setRespuesta(nueva);
    }
    return nueva;
  }, []);

  return [respuesta, pedir, consultar] as const;
}
