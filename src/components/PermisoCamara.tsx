import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

import { ExplicacionPermiso } from '@/components/ExplicacionPermiso';
import { usePermiso } from '@/hooks/usePermiso';

export function PermisoCamara() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const estado = usePermiso(permiso, consultarPermiso);

  async function continuar() {
    // Recién acá aparece el diálogo del sistema.
    await pedirPermiso();
    router.back();
  }

  return <ExplicacionPermiso recurso="camara" estado={estado} onContinuar={continuar} />;
}
