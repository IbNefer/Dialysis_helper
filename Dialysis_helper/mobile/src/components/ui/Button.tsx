import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';

import { AccentGradient } from './AccentGradient';
import { AppIcon, type IconName } from './AppIcon';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerSoft';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible (por defecto). */
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const foreground: Record<ButtonVariant, string> = {
  primary: colors.onAccent,
  secondary: colors.text,
  danger: colors.onUrgent,
  dangerSoft: colors.urgentTextSoft,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const color = foreground[variant];

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={color} testID={testID ? `${testID}-loading` : undefined} />
      ) : (
        icon && <AppIcon name={icon} color={color} />
      )}
      <AppText variant="button" color={color} align="center" style={styles.label}>
        {label}
      </AppText>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {variant === 'primary' && <AccentGradient style={styles.fill}>{content}</AccentGradient>}
      {variant === 'secondary' && (
        <GlassCard radius={radii.pill} padding={0} style={styles.glass} contentStyle={styles.fill}>
          {content}
        </GlassCard>
      )}
      {variant === 'danger' && (
        <View style={[styles.fill, { backgroundColor: colors.urgent }]}>{content}</View>
      )}
      {variant === 'dangerSoft' && <View style={[styles.fill, styles.dangerSoft]}>{content}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.buttonHeight,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fullWidth: { alignSelf: 'stretch' },
  fill: {
    flexGrow: 1,
    minHeight: sizes.buttonHeight,
    borderRadius: radii.pill,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  glass: { flexGrow: 1 },
  dangerSoft: {
    backgroundColor: colors.urgentBg,
    borderWidth: 1,
    borderColor: colors.urgentBorder,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: { flexShrink: 1 },
  inactive: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
