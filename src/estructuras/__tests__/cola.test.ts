import { describe, expect, test } from '@jest/globals';

import { Cola } from '@/estructuras/cola';

describe('Cola', () => {
  test('empieza vacía', () => {
    const cola = new Cola<string>();
    expect(cola.vacia).toBe(true);
    expect(cola.tamanio).toBe(0);
    expect(cola.frente()).toBeUndefined();
  });

  test('el primero que entra es el primero que sale (FIFO)', () => {
    const cola = new Cola<string>();
    cola.encolar('Ana');
    cola.encolar('Beto');
    cola.encolar('Caro');
    expect(cola.desencolar()).toBe('Ana');
    expect(cola.desencolar()).toBe('Beto');
    expect(cola.frente()).toBe('Caro');
  });

  test('desencolar una cola vacía devuelve undefined sin romperse', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
  });

  test('sigue funcionando después de vaciarse y volver a llenarse', () => {
    const cola = new Cola(['Ana']);
    cola.desencolar();
    expect(cola.desencolar()).toBeUndefined();
    cola.encolar('Beto');
    expect(cola.tamanio).toBe(1);
    expect(cola.frente()).toBe('Beto');
  });

  test('tamanio y aArray reflejan el orden de llegada', () => {
    const cola = new Cola(['Ana', 'Beto', 'Caro']);
    cola.desencolar();
    expect(cola.tamanio).toBe(2);
    expect(cola.aArray()).toEqual(['Beto', 'Caro']);
  });

  test('crear una cola desde otra no modifica la original', () => {
    const original = new Cola(['Ana']);
    const nueva = new Cola(original.aArray());
    nueva.encolar('Beto');
    expect(original.tamanio).toBe(1);
    expect(nueva.tamanio).toBe(2);
  });
});
