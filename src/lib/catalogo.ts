import { LIBROS } from '@/data/libros';
import type { Libro } from '@/types';

// Un ISBN-13 (o un EAN-13 leído de la contratapa) son exactamente 13 dígitos.
export function esIsbnValido(texto: string): boolean {
  return /^\d{13}$/.test(texto);
}

export function buscarPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}
