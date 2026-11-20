// Pila (LIFO): el último elemento que entra es el primero que sale.
export class Pila<T> {
  #items: T[];

  constructor(items: readonly T[] = []) {
    this.#items = [...items];
  }

  apilar(elemento: T): void {
    this.#items.push(elemento);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  tope(): T | undefined {
    return this.#items.at(-1);
  }

  get tamanio(): number {
    return this.#items.length;
  }

  get vacia(): boolean {
    return this.#items.length === 0;
  }

  // Copia de los elementos, de la base al tope.
  aArray(): T[] {
    return [...this.#items];
  }
}
