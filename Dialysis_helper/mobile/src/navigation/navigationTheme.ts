import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors, fontFamily } from '@/theme';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accentStart,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.glassBorder,
    notification: colors.accentStart,
  },
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: '400' },
    medium: { fontFamily: fontFamily.medium, fontWeight: '500' },
    bold: { fontFamily: fontFamily.bold, fontWeight: '700' },
    heavy: { fontFamily: fontFamily.extrabold, fontWeight: '800' },
  },
};

export const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;
