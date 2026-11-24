import { StyleSheet, View } from 'react-native';

import { colors, radii, sizes } from '@/theme';

import { AccentGradient } from './AccentGradient';

type ProgressBarProps = {
  /** Valor entre 0 y 1. */
  progress: number;
  accessibilityLabel: string;
};

export function ProgressBar({ progress, accessibilityLabel }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const percent = Math.round(clamped * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent} %` }}
      style={styles.track}
    >
      <AccentGradient style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: sizes.progressHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
});
