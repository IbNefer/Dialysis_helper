import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors, sizes } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type AppIconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

/**
 * Ícono relleno (Ionicons sólido). Siempre decorativo: el texto que lo acompaña es el que se lee.
 * Los detalles internos (el +, el check) son huecos del glifo, así que muestran el fondo oscuro.
 */
export function AppIcon({ name, size = sizes.icon, color = colors.text }: AppIconProps) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
