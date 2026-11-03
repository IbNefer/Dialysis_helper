import { StyleSheet, View } from 'react-native';

import { radii, spacing } from '@/theme';

import { AppText } from './AppText';
import { GlassCard } from './GlassCard';

export type StatChangeTone = 'positive' | 'doctorNote' | 'neutral';

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  /** Línea inferior: cambio frente a ayer, hora de la toma o nota del doctor. */
  change?: string;
  changeTone?: StatChangeTone;
  /** Texto completo para el lector de pantalla (por ejemplo, "Presión 128 sobre 82"). */
  accessibilityLabel?: string;
};

const changeColor = {
  positive: 'success',
  doctorNote: 'accentBlue',
  neutral: 'textMuted',
} as const;

export function StatCard({
  label,
  value,
  unit,
  change,
  changeTone = 'neutral',
  accessibilityLabel,
}: StatCardProps) {
  const spoken = accessibilityLabel ?? [label, value, unit, change].filter(Boolean).join(', ');

  return (
    <GlassCard
      radius={radii.card}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={spoken}
      style={styles.card}
    >
      <AppText color="textMuted">{label}</AppText>
      <View style={styles.valueRow}>
        <AppText variant="stat">{value}</AppText>
        {unit && (
          <AppText variant="statUnit" color="textMuted">
            {unit}
          </AppText>
        )}
      </View>
      {change && (
        <AppText variant="caption" color={changeColor[changeTone]}>
          {change}
        </AppText>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing.xs,
    marginTop: spacing.xxs,
    marginBottom: spacing.xxs,
  },
});
