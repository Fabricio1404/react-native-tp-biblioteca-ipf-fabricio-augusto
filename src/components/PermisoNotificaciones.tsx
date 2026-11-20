import { router } from 'expo-router';

import { ExplicacionPermiso } from '@/components/ExplicacionPermiso';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { usePermiso } from '@/hooks/usePermiso';
import { usePermisoNotificaciones } from '@/hooks/usePermisoNotificaciones';

type Props = {
  // Préstamo cuyo interruptor "Recordarme" abrió esta pantalla.
  isbn?: string;
};

export function PermisoNotificaciones({ isbn }: Props) {
  const { activarRecordatorio } = useBiblioteca();
  const [permiso, pedirPermiso, consultarPermiso] = usePermisoNotificaciones();
  const estado = usePermiso(permiso, consultarPermiso);

  async function continuar() {
    // pedirPermiso crea el canal de Android antes de mostrar el diálogo del sistema.
    const respuesta = await pedirPermiso();
    if (respuesta.granted && isbn) {
      await activarRecordatorio(isbn);
    }
    router.back();
  }

  return <ExplicacionPermiso recurso="notificaciones" estado={estado} onContinuar={continuar} />;
}
