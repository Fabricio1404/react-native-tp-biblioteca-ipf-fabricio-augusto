// Cola (FIFO): el primer elemento que entra es el primero que sale.
// Sin shift(): cada elemento se guarda con un número de turno y la cola
// recuerda qué turno está al frente (#inicio) y cuál es el próximo libre (#fin).
export class Cola<T> {
  #items = new Map<number, T>();
  #inicio = 0;
  #fin = 0;

  constructor(items: readonly T[] = []) {
    for (const elemento of items) {
      this.encolar(elemento);
    }
  }

  encolar(elemento: T): void {
    this.#items.set(this.#fin, elemento);
    this.#fin++;
  }

  desencolar(): T | undefined {
    if (this.vacia) {
      return undefined;
    }
    const elemento = this.#items.get(this.#inicio);
    this.#items.delete(this.#inicio);
    this.#inicio++;
    return elemento;
  }

  frente(): T | undefined {
    return this.#items.get(this.#inicio);
  }

  get tamanio(): number {
    return this.#fin - this.#inicio;
  }

  get vacia(): boolean {
    return this.tamanio === 0;
  }

  // Copia de los elementos, del frente al final.
  aArray(): T[] {
    return [...this.#items.values()];
  }
}
