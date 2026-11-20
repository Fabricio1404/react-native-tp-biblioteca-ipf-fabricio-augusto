import { Stack, useLocalSearchParams } from 'expo-router';

import { PermisoCamara } from '@/components/PermisoCamara';
import { PermisoNotificaciones } from '@/components/PermisoNotificaciones';
import { SinResultado } from '@/components/SinResultado';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { esRecurso } from '@/lib/permisos';

export default function PantallaPermiso() {
  const { recurso, isbn } = useLocalSearchParams<{ recurso: string; isbn?: string }>();

  if (!esRecurso(recurso)) {
    return <SinResultado mensaje="Esta app solo pide permiso para la cámara y las notificaciones." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: TEXTOS_PERMISO[recurso].titulo }} />
      {recurso === 'camara' ? <PermisoCamara /> : <PermisoNotificaciones isbn={isbn} />}
    </>
  );
}
