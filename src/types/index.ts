export type Libro = {
  isbn: string; // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number; // ejemplares en el estante al iniciar la app
};

export type Prestamo = {
  isbn: string;
  devolucion: string; // fecha de devolución en formato ISO
  recordatorio: boolean; // interruptor "Recordarme"
  idNotificacion: string | null; // notificación programada, para poder cancelarla
};

// Mensaje que se muestra dentro de la app cuando no hay permiso de notificaciones.
export type Aviso = {
  id: string;
  mensaje: string;
};
