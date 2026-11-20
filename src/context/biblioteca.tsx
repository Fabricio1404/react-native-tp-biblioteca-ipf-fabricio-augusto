import { createContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { CANTIDAD_RECIENTES, DIAS_PRESTAMO, YO } from '@/constants/biblioteca';
import { CLAVE_PERSONAL, USUARIO_PERSONAL } from '@/constants/personal';
import { ESPERA_INICIAL } from '@/data/libros';
import { Cola } from '@/estructuras/cola';
import { Pila } from '@/estructuras/pila';
import { buscarPorIsbn } from '@/lib/catalogo';
import { sumarDias } from '@/lib/fechas';
import {
  avisarLibroEntregado,
  cancelarRecordatorio,
  programarRecordatorio,
  puedeNotificar,
} from '@/lib/notificaciones';
import type { Aviso, Libro, Prestamo } from '@/types';

export type ResultadoReserva =
  | { tipo: 'prestamo'; devolucion: string }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'repetida' }
  | { tipo: 'inexistente' };

export type ValorBiblioteca = {
  // Del más reciente al más antiguo, como máximo 3.
  recientes: Libro[];
  registrarVisto: (libro: Libro) => void;

  sesionIniciada: boolean;
  // Devuelve false si el usuario o la clave no coinciden.
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;

  prestamos: Prestamo[];
  disponibles: (isbn: string) => number;
  enEspera: (isbn: string) => string[];
  // Posición (empezando en 1) de la persona usuaria, o null si no espera ese libro.
  miPosicion: (isbn: string) => number | null;
  tieneReserva: (isbn: string) => boolean;
  // Libros en los que la persona usuaria está esperando, con su posición.
  misEsperas: { isbn: string; posicion: number }[];
  // ISBN de los libros que tienen al menos una persona esperando (para el mostrador).
  conEspera: string[];
  reservar: (isbn: string) => ResultadoReserva;
  devolver: (isbn: string) => void;
  // Programa la notificación de devolución (el permiso ya tiene que estar concedido).
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => void;
  // Desencola a la persona del frente. Devuelve su nombre, o null si nadie esperaba.
  entregarAlSiguiente: (isbn: string) => string | null;

  avisos: Aviso[];
  descartarAviso: (id: string) => void;
};

export const BibliotecaContext = createContext<ValorBiblioteca | null>(null);

function crearEsperasIniciales(): Record<string, Cola<string>> {
  const esperas: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(ESPERA_INICIAL)) {
    esperas[isbn] = new Cola(personas);
  }
  return esperas;
}

type Props = {
  children: ReactNode;
};

export function BibliotecaProvider({ children }: Props) {
  const [vistos, setVistos] = useState(() => new Pila<Libro>());
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [esperas, setEsperas] = useState(crearEsperasIniciales);
  // Ejemplares que volvieron a la biblioteca y se entregaron a la persona usuaria
  // desde el mostrador: no salen del estante inicial, así que se suman aparte.
  const [devueltos, setDevueltos] = useState<Record<string, number>>({});
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  // Copia de los préstamos para leer su valor actual después de un await.
  const prestamosActuales = useRef(prestamos);
  useEffect(() => {
    prestamosActuales.current = prestamos;
  }, [prestamos]);

  // Nunca se modifica la pila o la cola guardada en el estado: se crea una
  // nueva para que React detecte el cambio y vuelva a renderizar.
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

  // Los ejemplares disponibles no se guardan: se calculan a partir del estante
  // inicial y de los préstamos activos, así no pueden quedar desincronizados.
  function disponibles(isbn: string) {
    const libro = buscarPorIsbn(isbn);
    if (!libro) {
      return 0;
    }
    const prestados = prestamos.filter((p) => p.isbn === isbn).length;
    return Math.max(0, libro.ejemplares + (devueltos[isbn] ?? 0) - prestados);
  }

  function enEspera(isbn: string) {
    return esperas[isbn]?.aArray() ?? [];
  }

  function miPosicion(isbn: string) {
    const indice = enEspera(isbn).indexOf(YO);
    return indice === -1 ? null : indice + 1;
  }

  function tieneReserva(isbn: string) {
    return prestamos.some((p) => p.isbn === isbn) || miPosicion(isbn) !== null;
  }

  function crearPrestamo(isbn: string): Prestamo {
    return {
      isbn,
      devolucion: sumarDias(new Date(), DIAS_PRESTAMO).toISOString(),
      recordatorio: false,
      idNotificacion: null,
    };
  }

  function reservar(isbn: string): ResultadoReserva {
    if (!buscarPorIsbn(isbn)) {
      return { tipo: 'inexistente' };
    }
    if (tieneReserva(isbn)) {
      return { tipo: 'repetida' };
    }
    if (disponibles(isbn) > 0) {
      const prestamo = crearPrestamo(isbn);
      setPrestamos((anteriores) => [...anteriores, prestamo]);
      return { tipo: 'prestamo', devolucion: prestamo.devolucion };
    }
    const nueva = new Cola(enEspera(isbn));
    nueva.encolar(YO);
    setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
    return { tipo: 'espera', posicion: nueva.tamanio };
  }

  function devolver(isbn: string) {
    // Si había un recordatorio programado, se cancela: el libro ya no está prestado.
    const id = prestamos.find((p) => p.isbn === isbn)?.idNotificacion;
    if (id) {
      cancelarRecordatorio(id);
    }
    setPrestamos((anteriores) => anteriores.filter((p) => p.isbn !== isbn));
  }

  function actualizarPrestamo(isbn: string, cambios: Partial<Prestamo>) {
    setPrestamos((anteriores) =>
      anteriores.map((p) => (p.isbn === isbn ? { ...p, ...cambios } : p)),
    );
  }

  async function activarRecordatorio(isbn: string) {
    actualizarPrestamo(isbn, { recordatorio: true });
    const titulo = buscarPorIsbn(isbn)?.titulo ?? isbn;
    try {
      const id = await programarRecordatorio(titulo);
      // Mientras se programaba, la persona pudo desactivar el interruptor o devolver el libro.
      const actual = prestamosActuales.current.find((p) => p.isbn === isbn);
      if (!actual?.recordatorio) {
        cancelarRecordatorio(id);
        return;
      }
      actualizarPrestamo(isbn, { idNotificacion: id });
    } catch {
      actualizarPrestamo(isbn, { recordatorio: false, idNotificacion: null });
      agregarAviso('No pudimos programar el recordatorio. Intentá activarlo de nuevo.');
    }
  }

  function desactivarRecordatorio(isbn: string) {
    const id = prestamos.find((p) => p.isbn === isbn)?.idNotificacion;
    if (id) {
      cancelarRecordatorio(id);
    }
    actualizarPrestamo(isbn, { recordatorio: false, idNotificacion: null });
  }

  function agregarAviso(mensaje: string) {
    const aviso: Aviso = { id: `${Date.now()}-${Math.random()}`, mensaje };
    setAvisos((anteriores) => [aviso, ...anteriores]);
  }

  function descartarAviso(id: string) {
    setAvisos((anteriores) => anteriores.filter((a) => a.id !== id));
  }

  function entregarAlSiguiente(isbn: string) {
    const nueva = new Cola(enEspera(isbn));
    const persona = nueva.desencolar();
    if (persona === undefined) {
      return null;
    }
    setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));

    if (persona === YO) {
      setDevueltos((anteriores) => ({ ...anteriores, [isbn]: (anteriores[isbn] ?? 0) + 1 }));
      setPrestamos((anteriores) => [...anteriores, crearPrestamo(isbn)]);
      avisarEntrega(buscarPorIsbn(isbn)?.titulo ?? 'el libro que esperabas');
    }
    return persona;
  }

  // Si el permiso está concedido llega una notificación; si no, un aviso dentro de la app.
  async function avisarEntrega(titulo: string) {
    try {
      if (await puedeNotificar()) {
        await avisarLibroEntregado(titulo);
        return;
      }
    } catch {
      // Si la notificación falla, se avisa dentro de la app.
    }
    agregarAviso(`¡Ya podés retirar "${titulo}"! Lo tenés en tus préstamos.`);
  }

  const recientes = vistos.aArray().reverse().slice(0, CANTIDAD_RECIENTES);

  const misEsperas = Object.entries(esperas).flatMap(([isbn, cola]) => {
    const indice = cola.aArray().indexOf(YO);
    return indice === -1 ? [] : [{ isbn, posicion: indice + 1 }];
  });

  const conEspera = Object.entries(esperas)
    .filter(([, cola]) => !cola.vacia)
    .map(([isbn]) => isbn);

  return (
    <BibliotecaContext
      value={{
        recientes,
        registrarVisto,
        sesionIniciada,
        iniciarSesion,
        cerrarSesion,
        prestamos,
        disponibles,
        enEspera,
        miPosicion,
        tieneReserva,
        misEsperas,
        conEspera,
        reservar,
        devolver,
        activarRecordatorio,
        desactivarRecordatorio,
        entregarAlSiguiente,
        avisos,
        descartarAviso,
      }}>
      {children}
    </BibliotecaContext>
  );
}
