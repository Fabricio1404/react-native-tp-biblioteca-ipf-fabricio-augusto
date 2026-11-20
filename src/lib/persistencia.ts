import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Prestamo } from '@/types';

// Si cambia la forma de los datos, se sube la versión y lo viejo se descarta.
const CLAVE = 'bibliotecaipf:datos:v1';

export type DatosGuardados = {
  prestamos: Prestamo[];
  vistos: string[]; // ISBN de los vistos, de la base al tope de la pila
  esperas: Record<string, string[]>; // personas en espera por ISBN, en orden de llegada
  devueltos: Record<string, number>;
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function esListaDeTextos(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((x) => typeof x === 'string');
}

function esPrestamo(valor: unknown): valor is Prestamo {
  return (
    esObjeto(valor) &&
    typeof valor.isbn === 'string' &&
    typeof valor.devolucion === 'string' &&
    typeof valor.recordatorio === 'boolean' &&
    (valor.idNotificacion === null || typeof valor.idNotificacion === 'string')
  );
}

// Lo que se lee del almacenamiento puede estar roto o ser de otra versión:
// se valida campo por campo antes de usarlo.
function sonDatosValidos(valor: unknown): valor is DatosGuardados {
  return (
    esObjeto(valor) &&
    Array.isArray(valor.prestamos) &&
    valor.prestamos.every(esPrestamo) &&
    esListaDeTextos(valor.vistos) &&
    esObjeto(valor.esperas) &&
    Object.values(valor.esperas).every(esListaDeTextos) &&
    esObjeto(valor.devueltos) &&
    Object.values(valor.devueltos).every((n) => typeof n === 'number')
  );
}

// Devuelve null si no hay nada guardado o si lo guardado no sirve.
export async function leerDatos(): Promise<DatosGuardados | null> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE);
    if (texto === null) {
      return null;
    }
    const datos: unknown = JSON.parse(texto);
    return sonDatosValidos(datos) ? datos : null;
  } catch {
    return null;
  }
}

export async function guardarDatos(datos: DatosGuardados): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Si no se puede guardar, la app sigue funcionando con lo que tiene en memoria.
  }
}
