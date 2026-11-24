/**
 * Paleta "glass oscuro": fondo azul petróleo, vidrio translúcido y acento verde → azul.
 * Los nombres siguen la especificación de diseño BASE-MOV (sección 5.1).
 */
export const colors = {
  bg: '#0A171C',
  glowPrimary: 'rgba(16,185,129,0.38)',
  glowSecondary: 'rgba(59,130,246,0.34)',

  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.14)',
  glassSubtle: 'rgba(255,255,255,0.05)',
  tabBarBg: 'rgba(15,32,38,0.82)',

  inputBg: 'rgba(0,0,0,0.25)',
  inputBorder: 'rgba(255,255,255,0.18)',
  progressTrack: 'rgba(255,255,255,0.12)',
  overlay: 'rgba(3,10,13,0.72)',

  text: '#F0FDFA',
  textMuted: 'rgba(240,253,250,0.72)',

  accentStart: '#34D399',
  accentEnd: '#38BDF8',
  onAccent: '#04231F',
  accentGreen: '#6EE7B7',
  accentGreenSoft: 'rgba(52,211,153,0.18)',
  accentBlue: '#7DD3FC',
  accentBlueSoft: 'rgba(56,189,248,0.16)',
  accentBlueBorder: 'rgba(56,189,248,0.40)',
  focusBorder: '#34D399',

  success: '#6EE7B7',
  info: '#93C5FD',
  infoBg: 'rgba(96,165,250,0.18)',
  infoBorder: 'rgba(96,165,250,0.40)',
  attention: '#FCD34D',
  attentionBg: 'rgba(251,191,36,0.14)',
  attentionBorder: 'rgba(251,191,36,0.40)',
  urgent: '#F87171',
  urgentBg: 'rgba(248,113,113,0.12)',
  urgentBorder: 'rgba(248,113,113,0.45)',
  urgentTextSoft: '#FECACA',
  onUrgent: '#2A0A0A',
} as const;

/** Degradado de acento a 135° (de arriba-izquierda a abajo-derecha) para expo-linear-gradient. */
export const accentGradient = {
  colors: [colors.accentStart, colors.accentEnd] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** Brillos ambientales en el formato que necesita un RadialGradient de react-native-svg. */
export const glows = {
  primary: { color: '#10B981', opacity: 0.38 },
  secondary: { color: '#3B82F6', opacity: 0.34 },
} as const;

/** Alias semánticos usados por los componentes. */
export const semantic = {
  accentText: colors.accentGreen,
  accentSoft: colors.accentGreenSoft,
  link: colors.accentBlue,
} as const;

export type ColorToken = keyof typeof colors;
