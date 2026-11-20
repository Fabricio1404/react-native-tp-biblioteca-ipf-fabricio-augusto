import type { BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { buscarPorIsbn, esIsbnValido } from '@/lib/catalogo';

type Escaner = {
  aviso: string | null;
  alEscanear: (resultado: BarcodeScanningResult) => void;
  abrirManual: (isbn: string) => void;
};

export function useEscaner(): Escaner {
  const [aviso, setAviso] = useState<string | null>(null);

  // useRef y no useState: onBarcodeScanned se llama muchas veces por segundo y
  // necesita ver el cambio en la misma llamada siguiente, sin esperar un render.
  const navegando = useRef(false);
  const ultimoDesconocido = useRef<string | null>(null);

  function abrirLibro(isbn: string) {
    navegando.current = true;
    // replace: al tocar "atrás" desde el detalle se vuelve al Catálogo, no al escáner.
    router.replace({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  function alEscanear({ data }: BarcodeScanningResult) {
    if (navegando.current || !esIsbnValido(data)) {
      return;
    }
    if (buscarPorIsbn(data)) {
      abrirLibro(data);
      return;
    }
    // El mismo código sigue frente a la cámara: no repetir el aviso.
    if (ultimoDesconocido.current === data) {
      return;
    }
    ultimoDesconocido.current = data;
    setAviso(`El código ${data} no está en el catálogo. Probá con otro libro o escribí el ISBN.`);
  }

  function abrirManual(isbn: string) {
    if (!esIsbnValido(isbn)) {
      setAviso('El ISBN tiene que tener 13 números, sin guiones ni espacios.');
    } else if (!buscarPorIsbn(isbn)) {
      setAviso(`No tenemos el ISBN ${isbn} en el catálogo.`);
    } else {
      abrirLibro(isbn);
    }
  }

  return { aviso, alEscanear, abrirManual };
}
