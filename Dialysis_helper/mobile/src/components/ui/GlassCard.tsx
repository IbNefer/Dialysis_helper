import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { colors, glass, radii, shouldUseBlur, spacing } from '@/theme';

export type GlassTone = 'default' | 'subtle' | 'urgent' | 'pending' | 'tabBar';

const tones: Record<GlassTone, { backgroundColor: string; borderColor: string }> = {
  default: { backgroundColor: colors.glass, borderColor: colors.glassBorder },
  subtle: { backgroundColor: colors.glassSubtle, borderColor: colors.glassBorder },
  urgent: { backgroundColor: colors.urgentBg, borderColor: colors.urgentBorder },
  pending: { backgroundColor: colors.accentBlueSoft, borderColor: colors.accentBlueBorder },
  tabBar: { backgroundColor: colors.tabBarBg, borderColor: colors.glassBorder },
};

export type GlassCardProps = ViewProps & {
  children?: ReactNode;
  tone?: GlassTone;
  radius?: number;
  /** Relleno interno; 0 para manejarlo desde fuera. */
  padding?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Superficie de vidrio: desenfoque (iOS y web) o respaldo sólido (Android, configurable en el tema),
 * capa translúcida del tono y borde de 1 px.
 */
export function GlassCard({
  children,
  tone = 'default',
  radius = radii.card,
  padding = spacing.lg,
  style,
  contentStyle,
  ...rest
}: GlassCardProps) {
  const toneStyle = tones[tone];
  const blur = shouldUseBlur();

  return (
    <View
      style={[styles.base, { borderRadius: radius, borderColor: toneStyle.borderColor }, style]}
      {...rest}
    >
      {blur ? (
        <BlurView
          intensity={glass.blurIntensity}
          tint={glass.tint}
          blurMethod={Platform.OS === 'android' ? glass.androidBlurMethod : undefined}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.androidFallback }]} />
      )}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: toneStyle.backgroundColor }]}
      />
      <View style={[{ padding }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
