// Paleta basada en el escudo del Instituto Politécnico Formosa.
export const Colores = {
  primario: '#08383F', // petróleo del escudo
  primarioSuave: '#E3EEEF',
  acento: '#078654', // verde de la P
  acentoSuave: '#DDF2E7',
  crema: '#FCEFD5', // letras, borde y estrellas del escudo
  textoSobrePrimario: '#FCEFD5',
  fondo: '#F8F6F0',
  superficie: '#FFFFFF',
  borde: '#E2E2DA',
  texto: '#0B2A2F',
  textoSecundario: '#4A5F63',
  exito: '#078654',
  exitoSuave: '#DDF2E7',
  alerta: '#B45309',
  alertaSuave: '#FEF3C7',
  peligro: '#B91C1C',
  peligroSuave: '#FEE2E2',
  sombra: '#000000',
} as const;

export const Espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const TamanioTexto = {
  chico: 13,
  normal: 15,
  grande: 17,
  titulo: 22,
  tituloGrande: 28,
} as const;

export const Radio = {
  chico: 8,
  medio: 12,
  grande: 16,
  completo: 999,
} as const;

// Área táctil mínima recomendada para botones (44 × 44).
export const AREA_TACTIL_MINIMA = 44;

export const TamanioIcono = {
  chico: 18,
  normal: 24,
  grande: 48,
} as const;
