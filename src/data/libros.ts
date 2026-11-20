import type { Libro } from '@/types';

export const LIBROS: Libro[] = [
  {
    isbn: '9789870001010',
    titulo: 'Ficciones',
    autor: 'Jorge Luis Borges',
    anio: 1944,
    ejemplares: 2,
  },
  {
    isbn: '9789870001027',
    titulo: 'El Aleph',
    autor: 'Jorge Luis Borges',
    anio: 1949,
    ejemplares: 1,
  },
  {
    isbn: '9789870001034',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    anio: 1963,
    ejemplares: 0,
  },
  {
    isbn: '9789870001041',
    titulo: 'Martín Fierro',
    autor: 'José Hernández',
    anio: 1872,
    ejemplares: 3,
  },
  {
    isbn: '9789870001058',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    anio: 1967,
    ejemplares: 0,
  },
  {
    isbn: '9789870001065',
    titulo: 'El túnel',
    autor: 'Ernesto Sabato',
    anio: 1948,
    ejemplares: 2,
  },
  {
    isbn: '9789870001072',
    titulo: 'Sobre héroes y tumbas',
    autor: 'Ernesto Sabato',
    anio: 1961,
    ejemplares: 1,
  },
  {
    isbn: '9789870001089',
    titulo: 'Don Segundo Sombra',
    autor: 'Ricardo Güiraldes',
    anio: 1926,
    ejemplares: 1,
  },
  {
    isbn: '9789870001096',
    titulo: 'Cuentos de la selva',
    autor: 'Horacio Quiroga',
    anio: 1918,
    ejemplares: 2,
  },
  {
    isbn: '9789870001102',
    titulo: 'Código limpio',
    autor: 'Robert C. Martin',
    anio: 2008,
    ejemplares: 0,
  },
  {
    isbn: '9789870001119',
    titulo: 'El programador pragmático',
    autor: 'Andrew Hunt y David Thomas',
    anio: 1999,
    ejemplares: 1,
  },
  {
    isbn: '9789870001126',
    titulo: 'Estructuras de datos y algoritmos',
    autor: 'Alfred Aho, John Hopcroft y Jeffrey Ullman',
    anio: 1983,
    ejemplares: 2,
  },
  {
    isbn: '9789870001133',
    titulo: 'Introducción a los algoritmos',
    autor: 'Thomas H. Cormen',
    anio: 1990,
    ejemplares: 1,
  },
];

// Personas que ya esperaban un libro al iniciar la app, en orden de llegada.
export const ESPERA_INICIAL: Record<string, string[]> = {
  '9789870001034': ['Lucía Benítez', 'Martín Gómez'],
  '9789870001102': ['Sofía Ramírez'],
};
