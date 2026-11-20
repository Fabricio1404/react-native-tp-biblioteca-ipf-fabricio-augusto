import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Llama a revisar() cada vez que la app vuelve al frente
// (por ejemplo, después de que la persona pasó por Ajustes).
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current !== 'active';
      if (estabaAfuera && nuevo === 'active') {
        revisar();
      }
      anterior.current = nuevo;
    });
    return () => suscripcion.remove();
  }, [revisar]);
}
