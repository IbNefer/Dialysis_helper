import { StyleSheet, View } from 'react-native';

import { AccentGradient, AppText } from '@/components/ui';
import { radii, spacing } from '@/theme';
import { formatDecimal } from '@/utils/format';

type WeightPoint = { day: string; kg: number };

const MIN_BAR = 56;
const MAX_BAR = 112;

/** Barras tipo cápsula del peso de la semana. La de hoy (última) va con el acento. */
export function WeightWeekChart({ data }: { data: WeightPoint[] }) {
  const values = data.map((point) => point.kg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const today = data[data.length - 1];
  const heightFor = (kg: number) =>
    max === min ? MAX_BAR : MIN_BAR + ((kg - min) / (max - min)) * (MAX_BAR - MIN_BAR);

  const description =
    `Gráfico de tu peso en los últimos ${data.length} días. ` +
    `Mínimo ${formatDecimal(min)} kilogramos, máximo ${formatDecimal(max)} kilogramos.` +
    (today ? ` Hoy: ${formatDecimal(today.kg)} kilogramos.` : '');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={description}
      style={styles.root}
      testID="weight-chart"
    >
      {data.map((point, index) => {
        const isToday = index === data.length - 1;
        const height = heightFor(point.kg);
        return (
          <View key={point.day} style={styles.column}>
            <View style={styles.barArea}>
              {isToday ? (
                <AccentGradient style={[styles.bar, { height }]} />
              ) : (
                <View style={[styles.bar, styles.barMuted, { height }]} />
              )}
            </View>
            <AppText
              variant="caption"
              color={isToday ? 'accentGreen' : 'textMuted'}
              maxFontSizeMultiplier={1.4}
              numberOfLines={1}
            >
              {point.day}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  column: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barArea: { height: MAX_BAR, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '80%', maxWidth: 48, borderRadius: radii.pill },
  barMuted: { backgroundColor: 'rgba(255,255,255,0.14)' },
});
