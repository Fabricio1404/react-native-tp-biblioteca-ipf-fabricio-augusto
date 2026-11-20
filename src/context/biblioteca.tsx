import { createContext, useState, type ReactNode } from 'react';

import { Pila } from '@/estructuras/pila';
import type { Libro } from '@/types';

const CANTIDAD_RECIENTES = 3;

export type ValorBiblioteca = {
  // Del más reciente al más antiguo, como máximo 3.
  recientes: Libro[];
  registrarVisto: (libro: Libro) => void;
};

export const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

type Props = {
  children: ReactNode;
};

export function BibliotecaProvider({ children }: Props) {
  const [vistos, setVistos] = useState(() => new Pila<Libro>());

  // Nunca se modifica la pila guardada en el estado: se crea una nueva
  // para que React detecte el cambio y vuelva a renderizar.
  function registrarVisto(libro: Libro) {
    setVistos((anterior) => {
      if (anterior.tope()?.isbn === libro.isbn) {
        return anterior;
      }
      const nueva = new Pila(anterior.aArray());
      nueva.apilar(libro);
      return nueva;
    });
  }

  const recientes = vistos.aArray().reverse().slice(0, CANTIDAD_RECIENTES);

  return (
    <BibliotecaContext value={{ recientes, registrarVisto }}>
      {children}
    </BibliotecaContext>
  );
}
