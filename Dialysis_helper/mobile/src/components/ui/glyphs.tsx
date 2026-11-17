import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Íconos SVG copiados del prototipo (docs/design/DP-Hogar_Prototipo.html), viewBox 24×24.
 * Los detalles internos (ojos, check, signo de admiración) se dibujan con el color del fondo,
 * igual que en el prototipo.
 */
type GlyphRenderer = (color: string, detail: string) => React.ReactNode;

const glyphs = {
  drop: (color) => <Path fill={color} d="M12 2s-7 7.6-7 12.5a7 7 0 0 0 14 0C19 9.6 12 2 12 2z" />,
  face: (color, detail) => (
    <>
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Circle cx={9} cy={10} r={1.4} fill={detail} />
      <Circle cx={15} cy={10} r={1.4} fill={detail} />
      <Path
        d="M8.5 14.5a4.5 4.5 0 0 0 7 0"
        fill="none"
        stroke={detail}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  ),
  check: (color, detail) => (
    <>
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path
        d="m7.5 12.5 3 3 6-6.5"
        fill="none"
        stroke={detail}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  /** Solo el trazo del check, para dibujarlo dentro de la casilla. */
  tick: (color) => (
    <Path
      d="m5 12.5 4.5 4.5L19 7"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  warn: (color, detail) => (
    <>
      <Path
        d="M12 2.5 1.5 21h21z"
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path d="M12 9.5v5M12 17.6v.2" stroke={detail} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  clock: (color, detail) => (
    <>
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path
        d="M12 7v5.5l3.5 2"
        fill="none"
        stroke={detail}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  back: (color) => (
    <Path
      d="m15 18-6-6 6-6"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  user: (color) => (
    <>
      <Circle cx={12} cy={7.5} r={4.5} fill={color} />
      <Path fill={color} d="M3 21c0-4.4 4-7.5 9-7.5s9 3.1 9 7.5z" />
    </>
  ),
  phone: (color) => (
    <Path
      fill={color}
      d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
    />
  ),
} satisfies Record<string, GlyphRenderer>;

export type GlyphName = keyof typeof glyphs;

type GlyphProps = {
  name: GlyphName;
  size: number;
  color: string;
  /** Color de los detalles internos; por defecto el fondo de la app. */
  detailColor?: string;
};

export function Glyph({ name, size, color, detailColor = colors.bg }: GlyphProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyphs[name](color, detailColor)}
    </Svg>
  );
}

export const glyphNames = Object.keys(glyphs) as GlyphName[];
