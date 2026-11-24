import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { severityLabels, type Severity } from '@/types/alerts';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

type SeverityBadgeProps = {
  severity: Severity;
  testID?: string;
};

const styleBySeverity: Record<
  Severity,
  { color: string; backgroundColor: string; borderColor: string }
> = {
  info: { color: colors.info, backgroundColor: colors.infoBg, borderColor: colors.infoBorder },
  attention: {
    color: colors.attention,
    backgroundColor: colors.attentionBg,
    borderColor: colors.attentionBorder,
  },
  // La urgente usa fondo sólido e ícono: no depende solo del color.
  urgent: { color: colors.onUrgent, backgroundColor: colors.urgent, borderColor: colors.urgent },
};

/** Píldora de severidad con el texto siempre visible. */
export function SeverityBadge({ severity, testID }: SeverityBadgeProps) {
  const s = styleBySeverity[severity];
  const label = severityLabels[severity];

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Severidad: ${label}`}
      testID={testID}
      style={[styles.root, { backgroundColor: s.backgroundColor, borderColor: s.borderColor }]}
    >
      {severity === 'urgent' && <AppIcon name="warning" size={18} color={s.color} />}
      <AppText variant="label" color={s.color}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
});
