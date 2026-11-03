import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';

import { AppIcon, type IconName } from './AppIcon';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';

export type MenuTileTone = 'green' | 'blue';

type MenuTileProps = {
  icon: IconName;
  title: string;
  description: string;
  tone?: MenuTileTone;
  onPress?: () => void;
  testID?: string;
};

const toneStyle: Record<MenuTileTone, { box: string; icon: string }> = {
  green: { box: colors.accentGreenSoft, icon: colors.accentGreen },
  blue: { box: colors.accentBlueSoft, icon: colors.accentBlue },
};

/** Opción grande del menú Registrar. Pensada para una grilla de 2 columnas. */
export function MenuTile({
  icon,
  title,
  description,
  tone = 'green',
  onPress,
  testID,
}: MenuTileProps) {
  const t = toneStyle[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <GlassCard style={styles.card} contentStyle={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: t.box }]}>
          <AppIcon name={icon} size={sizes.menuIcon} color={t.icon} />
        </View>
        <View style={styles.text}>
          <AppText variant="bodyLg">{title}</AppText>
          <AppText color="textMuted">{description}</AppText>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { flex: 1, minHeight: sizes.menuTileMinHeight },
  content: { gap: spacing.lg },
  iconBox: {
    width: sizes.menuIconBox,
    height: sizes.menuIconBox,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { gap: spacing.xxs },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
