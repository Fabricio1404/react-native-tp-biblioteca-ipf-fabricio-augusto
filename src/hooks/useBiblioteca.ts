import { use } from 'react';

import { BibliotecaContext } from '@/context/biblioteca';

export function useBiblioteca() {
  const valor = use(BibliotecaContext);
  if (!valor) {
    throw new Error('useBiblioteca debe usarse dentro de <BibliotecaProvider>');
  }
  return valor;
}
