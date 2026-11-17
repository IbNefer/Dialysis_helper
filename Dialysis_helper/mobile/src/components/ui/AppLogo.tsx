import { StyleSheet } from 'react-native';

import { colors, sizes } from '@/theme';

import { AccentGradient } from './AccentGradient';
import { AppIcon } from './AppIcon';

/** Logo de DP-Hogar: gota del prototipo (34 px) sobre un cuadro de acento de 64 px y radio 20. */
export function AppLogo({ size = sizes.logo }: { size?: number }) {
  return (
    <AccentGradient
      style={[styles.root, { width: size, height: size, borderRadius: size * 0.3125 }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Logo de DP-Hogar"
    >
      <AppIcon name="dp-drop" size={size * 0.53} color={colors.onAccent} />
    </AccentGradient>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
});
