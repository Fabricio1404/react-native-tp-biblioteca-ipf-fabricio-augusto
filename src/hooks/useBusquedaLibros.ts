import { useEffect, useState } from 'react';

import { buscarLibros } from '@/lib/api';
import type { Libro } from '@/types';

// Espera sin escribir antes de llamar a la API (debounce).
const ESPERA_MS = 300;

type Resultado = {
  consulta: string; // búsqueda a la que corresponden estos libros
  libros: Libro[];
  fallo: boolean;
};

type EstadoBusqueda = {
  libros: Libro[];
  cargando: boolean;
  fallo: boolean;
  reintentar: () => void;
};

export function useBusquedaLibros(consulta: string): EstadoBusqueda {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (consulta === '') {
      return;
    }
    // La limpieza corre antes del siguiente efecto (cuando cambia la consulta) y al
    // desmontar: cancela el temporizador y marca la respuesta vieja para ignorarla.
    let cancelado = false;
    const temporizador = setTimeout(async () => {
      try {
        const libros = await buscarLibros(consulta);
        if (!cancelado) {
          setResultado({ consulta, libros, fallo: false });
        }
      } catch {
        if (!cancelado) {
          setResultado({ consulta, libros: [], fallo: true });
        }
      }
    }, ESPERA_MS);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [consulta, intento]);

  function reintentar() {
    setResultado(null);
    setIntento((anterior) => anterior + 1);
  }

  // Solo vale el resultado que corresponde a la consulta actual.
  const actual = resultado?.consulta === consulta ? resultado : null;

  return {
    libros: actual?.libros ?? [],
    cargando: consulta !== '' && actual === null,
    fallo: actual?.fallo ?? false,
    reintentar,
  };
}
