import { Pressable, StyleSheet, View } from 'react-native';

import { radii, sizes, spacing } from '@/theme';

import { AccentGradient } from './AccentGradient';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';

export type ChipOption<K extends string> = { key: K; label: string };

type FilterChipsProps<K extends string> = {
  options: readonly ChipOption<K>[];
  value: K;
  onChange: (key: K) => void;
  accessibilityLabel: string;
};

export function FilterChips<K extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: FilterChipsProps<K>) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {options.map((option) => {
        const selected = option.key === value;
        const label = (
          <AppText variant="label" color={selected ? 'onAccent' : 'text'} style={styles.label}>
            {option.label}
          </AppText>
        );
        return (
          <Pressable
            key={option.key}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected, selected }}
            onPress={() => onChange(option.key)}
            testID={`chip-${option.key}`}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            {selected ? (
              <AccentGradient style={styles.fill}>{label}</AccentGradient>
            ) : (
              <GlassCard radius={radii.pill} padding={0} contentStyle={styles.fill}>
                {label}
              </GlassCard>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: radii.pill, overflow: 'hidden' },
  fill: {
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  label: { textAlign: 'center' },
  pressed: { opacity: 0.85 },
});
