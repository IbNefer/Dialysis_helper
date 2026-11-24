import { Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  /** Token de color o un color literal. */
  color?: ColorToken | (string & {});
  align?: 'left' | 'center' | 'right';
};

export function AppText({
  variant = 'body',
  color = 'text',
  align,
  style,
  accessibilityRole = 'text',
  ...rest
}: AppTextProps) {
  const resolved = color in colors ? colors[color as ColorToken] : color;
  return (
    <Text
      accessibilityRole={accessibilityRole}
      style={[typography[variant], { color: resolved }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
