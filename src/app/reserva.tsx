import { Redirect } from 'expo-router';

// URL de la versión anterior de la app: se reemplaza por /reservas
// sin dejar esta pantalla en el historial.
export default function ReservaVieja() {
  return <Redirect href="/reservas" />;
}
