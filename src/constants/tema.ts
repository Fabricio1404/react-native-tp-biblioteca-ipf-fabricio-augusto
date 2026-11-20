export const Colores = {
  primario: '#1E3A8A',
  primarioSuave: '#DBEAFE',
  textoSobrePrimario: '#FFFFFF',
  fondo: '#F1F5F9',
  superficie: '#FFFFFF',
  borde: '#E2E8F0',
  texto: '#0F172A',
  textoSecundario: '#475569',
  exito: '#047857',
  exitoSuave: '#D1FAE5',
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
