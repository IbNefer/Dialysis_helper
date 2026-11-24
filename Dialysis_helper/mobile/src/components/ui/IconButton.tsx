import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, sizes } from '@/theme';

import { AppIcon, type IconName } from './AppIcon';
import { GlassCard } from './GlassCard';

type IconButtonProps = {
  icon: IconName;
  /** Obligatorio: es el único texto que oye el lector de pantalla. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress?: () => void;
  /** Muestra un punto de aviso (por ejemplo, alertas sin leer). */
  badge?: boolean;
  testID?: string;
};

/** Botón circular de vidrio de 48 px, solo con ícono. */
export function IconButton({
  icon,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  badge = false,
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={4}
      testID={testID}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <GlassCard radius={radii.pill} padding={0} contentStyle={styles.circle}>
        <AppIcon name={icon} />
      </GlassCard>
      {badge && <View style={styles.badge} testID={testID ? `${testID}-badge` : undefined} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: sizes.iconButton, height: sizes.iconButton },
  circle: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accentStart,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  pressed: { opacity: 0.8 },
});
