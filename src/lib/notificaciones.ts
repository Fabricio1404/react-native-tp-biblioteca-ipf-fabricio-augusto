import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '@/constants/biblioteca';

// Muestra las notificaciones aunque la app esté abierta.
export function configurarNotificaciones() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// En Android 13 o superior el canal tiene que existir antes de pedir el permiso.
async function prepararCanal() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
      name: 'Préstamos',
      importance: AndroidImportance.DEFAULT,
    });
  }
}

export function consultarPermisoNotificaciones() {
  return Notifications.getPermissionsAsync();
}

export async function pedirPermisoNotificaciones() {
  await prepararCanal();
  return Notifications.requestPermissionsAsync();
}

// Consulta el permiso en el momento: el valor guardado puede estar viejo
// si la persona lo cambió desde Ajustes.
export async function puedeNotificar() {
  const permiso = await Notifications.getPermissionsAsync();
  return permiso.granted;
}

// Devuelve el identificador, necesario para cancelar el recordatorio después.
export async function programarRecordatorio(titulo: string): Promise<string> {
  await prepararCanal();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolución',
      body: `Acordate de devolver "${titulo}" a la biblioteca.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export function cancelarRecordatorio(id: string) {
  return Notifications.cancelScheduledNotificationAsync(id);
}

// Al abrir la app se cancelan las notificaciones programadas que ya no
// corresponden a ningún préstamo guardado (por ejemplo, de un libro devuelto
// justo antes de que se cerrara la app).
export async function cancelarRecordatoriosHuerfanos(idsVigentes: string[]) {
  try {
    const programadas = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      programadas
        .filter((n) => !idsVigentes.includes(n.identifier))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // Si no se pueden revisar, no se cancela nada.
  }
}

export async function avisarLibroEntregado(titulo: string) {
  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Llegó tu libro!',
      body: `Ya podés retirar "${titulo}". Lo tenés en tus préstamos.`,
    },
    trigger: { channelId: CANAL_PRESTAMOS },
  });
}
