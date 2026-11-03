import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppIcon, type IconName } from './AppIcon';
import { AppText } from './AppText';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  return (
    <GlassCard testID={testID} contentStyle={styles.content}>
      <View style={styles.iconCircle}>
        <AppIcon name={icon} size={36} color={colors.accentGreen} />
      </View>
      <AppText variant="heading" align="center" accessibilityRole="header">
        {title}
      </AppText>
      {description && (
        <AppText color="textMuted" align="center">
          {description}
        </AppText>
      )}
      {actionLabel && <Button variant="secondary" label={actionLabel} onPress={onAction} />}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.accentGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
