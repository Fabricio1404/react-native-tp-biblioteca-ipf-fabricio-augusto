import { createContext, useState, type ReactNode } from 'react';

import { CANTIDAD_RECIENTES } from '@/constants/biblioteca';
import { CLAVE_PERSONAL, USUARIO_PERSONAL } from '@/constants/personal';
import { Pila } from '@/estructuras/pila';
import type { Libro } from '@/types';

export type ValorBiblioteca = {
  // Del más reciente al más antiguo, como máximo 3.
  recientes: Libro[];
  registrarVisto: (libro: Libro) => void;
  sesionIniciada: boolean;
  // Devuelve false si el usuario o la clave no coinciden.
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
};

export const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

type Props = {
  children: ReactNode;
};

export function BibliotecaProvider({ children }: Props) {
  const [vistos, setVistos] = useState(() => new Pila<Libro>());
  const [sesionIniciada, setSesionIniciada] = useState(false);

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

  function iniciarSesion(usuario: string, clave: string) {
    const correcto =
      usuario.trim().toLowerCase() === USUARIO_PERSONAL && clave === CLAVE_PERSONAL;
    if (correcto) {
      setSesionIniciada(true);
    }
    return correcto;
  }

  function cerrarSesion() {
    setSesionIniciada(false);
  }

  const recientes = vistos.aArray().reverse().slice(0, CANTIDAD_RECIENTES);

  return (
    <BibliotecaContext
      value={{ recientes, registrarVisto, sesionIniciada, iniciarSesion, cerrarSesion }}>
      {children}
    </BibliotecaContext>
  );
}
