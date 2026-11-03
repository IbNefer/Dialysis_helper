import type { TextStyle } from 'react-native';

/** Familias cargadas con @expo-google-fonts/plus-jakarta-sans (una por peso: Android ignora fontWeight). */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/**
 * Escala pensada para personas mayores: el cuerpo de texto nunca baja de 17 y lo mínimo es 14.
 * Todas las variantes respetan el tamaño de fuente del sistema.
 */
export const typography = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fontFamily.extrabold, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28 },
  stat: { fontFamily: fontFamily.extrabold, fontSize: 30, lineHeight: 36 },
  statUnit: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 22 },
  bodyLg: { fontFamily: fontFamily.bold, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 22 },
  button: { fontFamily: fontFamily.extrabold, fontSize: 18, lineHeight: 24 },
  caption: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20 },
  overline: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputText: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 26 },
  inputNumber: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30 },
  tabLabel: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 18 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
