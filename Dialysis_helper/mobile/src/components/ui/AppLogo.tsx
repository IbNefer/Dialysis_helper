import { StyleSheet } from 'react-native';

import { colors, sizes } from '@/theme';

import { AccentGradient } from './AccentGradient';
import { AppIcon } from './AppIcon';

/** Logo de DP-Hogar: gota sobre un cuadro de acento de 64 px. */
export function AppLogo({ size = sizes.logo }: { size?: number }) {
  return (
    <AccentGradient
      style={[styles.root, { width: size, height: size, borderRadius: size * 0.28 }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Logo de DP-Hogar"
    >
      <AppIcon name="water" size={size * 0.48} color={colors.onAccent} />
    </AccentGradient>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});
