import { describe, expect, test } from '@jest/globals';

import { Pila } from '@/estructuras/pila';

describe('Pila', () => {
  test('empieza vacía', () => {
    const pila = new Pila<string>();
    expect(pila.vacia).toBe(true);
    expect(pila.tamanio).toBe(0);
    expect(pila.tope()).toBeUndefined();
  });

  test('el último que entra es el primero que sale (LIFO)', () => {
    const pila = new Pila<string>();
    pila.apilar('A');
    pila.apilar('B');
    pila.apilar('C');
    expect(pila.desapilar()).toBe('C');
    expect(pila.desapilar()).toBe('B');
    expect(pila.tamanio).toBe(1);
  });

  test('tope muestra el último sin sacarlo', () => {
    const pila = new Pila(['A', 'B']);
    expect(pila.tope()).toBe('B');
    expect(pila.tamanio).toBe(2);
  });

  test('desapilar una pila vacía devuelve undefined sin romperse', () => {
    const pila = new Pila<number>();
    expect(pila.desapilar()).toBeUndefined();
    expect(pila.tamanio).toBe(0);
  });

  test('aArray devuelve una copia de la base al tope', () => {
    const pila = new Pila(['A', 'B']);
    const copia = pila.aArray();
    copia.push('Z');
    expect(pila.aArray()).toEqual(['A', 'B']);
  });

  test('crear una pila desde otra no modifica la original', () => {
    const original = new Pila(['A']);
    const nueva = new Pila(original.aArray());
    nueva.apilar('B');
    expect(original.tamanio).toBe(1);
    expect(nueva.tamanio).toBe(2);
  });
});
