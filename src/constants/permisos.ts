import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Recurso } from '@/lib/permisos';

type TextoPermiso = {
  titulo: string;
  beneficio: string;
  bloqueado: string;
  icono: ComponentProps<typeof Ionicons>['name'];
};

export const TEXTOS_PERMISO: Record<Recurso, TextoPermiso> = {
  camara: {
    titulo: 'Cámara',
    beneficio:
      'Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro sin escribir el ISBN.',
    bloqueado:
      'La cámara está desactivada para esta app. Podés activarla en Ajustes o escribir el ISBN a mano.',
    icono: 'camera',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio:
      'Usamos las notificaciones para recordarte cuándo devolver tus libros y avisarte cuando llegue uno que esperás.',
    bloqueado:
      'Las notificaciones están desactivadas para esta app. Podés activarlas en Ajustes; mientras tanto, los avisos aparecen dentro de la app.',
    icono: 'notifications',
  },
};
