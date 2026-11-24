export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  /** Margen lateral de las pantallas. */
  screen: 20,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  card: 24,
  pill: 999,
} as const;

export const sizes = {
  /** Área táctil mínima (WCAG recomienda 44; usamos 48). */
  touchTarget: 48,
  buttonHeight: 56,
  inputHeight: 64,
  iconButton: 48,
  icon: 24,
  menuIcon: 30,
  menuIconBox: 56,
  logo: 64,
  avatar: 52,
  progressHeight: 10,
  menuTileMinHeight: 168,
  tabBar: { height: 72, side: 16, bottom: 24 },
} as const;
