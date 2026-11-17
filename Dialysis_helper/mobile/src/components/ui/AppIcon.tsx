import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors, sizes } from '@/theme';

import { Glyph, type GlyphName } from './glyphs';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Nombre de ícono: uno de Ionicons (rellenos) o uno de los SVG del prototipo con el prefijo `dp-`
 * (por ejemplo `dp-face`, `dp-warn`). El prefijo evita choques con los nombres de Ionicons.
 */
export type IconName = IoniconName | `dp-${GlyphName}`;

type AppIconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /** Solo íconos `dp-`: color de los detalles internos (ojos, check). */
  detailColor?: string;
};

function isGlyph(name: IconName): name is `dp-${GlyphName}` {
  return name.startsWith('dp-');
}

/**
 * Ícono relleno. Siempre decorativo: el texto que lo acompaña es el que se lee.
 * Los detalles internos (el +, el check) son huecos del glifo, así que muestran el fondo oscuro.
 */
export function AppIcon({
  name,
  size = sizes.icon,
  color = colors.text,
  detailColor,
}: AppIconProps) {
  if (isGlyph(name)) {
    return (
      <Glyph
        name={name.slice(3) as GlyphName}
        size={size}
        color={color}
        detailColor={detailColor}
      />
    );
  }
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
