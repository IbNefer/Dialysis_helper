import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppIcon, type IconName } from './AppIcon';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';

type ListItemProps = {
  icon: IconName;
  title: string;
  description?: string;
  onPress?: () => void;
  testID?: string;
};

/** Fila de vidrio para menús de lista (Perfil, ajustes). */
export function ListItem({ icon, title, description, onPress, testID }: ListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GlassCard padding={spacing.md} contentStyle={styles.row}>
        <View style={styles.iconBox}>
          <AppIcon name={icon} color={colors.accentGreen} />
        </View>
        <View style={styles.text}>
          <AppText variant="bodyLg">{title}</AppText>
          {description && <AppText color="textMuted">{description}</AppText>}
        </View>
        <AppIcon name="chevron-forward" color={colors.textMuted} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.accentGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  pressed: { opacity: 0.85 },
});
