import { useEffect, useState } from 'react';

import { obtenerLibros } from '@/lib/api';
import type { Libro } from '@/types';

const MENSAJE_ERROR = 'No pudimos cargar el catálogo. Revisá tu conexión e intentá de nuevo.';

type EstadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useLibros(): EstadoLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cada vez que cambia, el efecto vuelve a pedir los libros.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si el componente se desmonta (o se reintenta) antes de que llegue la
    // respuesta, la limpieza marca este pedido como cancelado y se ignora.
    let cancelado = false;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (!cancelado) {
          setLibros(datos);
        }
      } catch {
        if (!cancelado) {
          setError(MENSAJE_ERROR);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [intento]);

  function reintentar() {
    setError(null);
    setCargando(true);
    setIntento((anterior) => anterior + 1);
  }

  return { libros, cargando, error, reintentar };
}
