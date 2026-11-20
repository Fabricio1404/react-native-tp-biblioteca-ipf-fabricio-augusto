import { router } from 'expo-router';

// Cierra el modal actual y muestra la pestaña "Mis reservas".
// Como el modal se descarta, "atrás" no vuelve a la confirmación.
export function cerrarModalEIrAReservas() {
  router.dismiss();
  router.navigate('/reservas');
}
