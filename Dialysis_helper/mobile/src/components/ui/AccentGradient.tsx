import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

import { accentGradient } from '@/theme';

type AccentGradientProps = ViewProps & {
  children?: ReactNode;
};

/** Relleno con el degradado de acento #34D399 → #38BDF8 a 135°. */
export function AccentGradient({ children, ...viewProps }: AccentGradientProps) {
  return (
    <LinearGradient
      colors={accentGradient.colors}
      start={accentGradient.start}
      end={accentGradient.end}
      {...viewProps}
    >
      {children}
    </LinearGradient>
  );
}
