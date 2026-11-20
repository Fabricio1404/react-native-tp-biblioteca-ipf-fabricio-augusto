import * as SplashScreen from 'expo-splash-screen';

import { NavegacionRaiz } from '@/components/NavegacionRaiz';
import { BibliotecaProvider } from '@/context/biblioteca';
import { configurarNotificaciones } from '@/lib/notificaciones';

// El splash queda visible hasta que se recuperan los datos guardados
// (lo oculta NavegacionRaiz cuando el Context está listo).
SplashScreen.preventAutoHideAsync();
configurarNotificaciones();

// Si la app se abre con un deep link (por ejemplo a /buscar),
// las pestañas quedan debajo en la pila para poder volver.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <NavegacionRaiz />
    </BibliotecaProvider>
  );
}
