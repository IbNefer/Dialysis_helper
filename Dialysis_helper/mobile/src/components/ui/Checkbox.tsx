import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '@/theme';

import { AccentGradient } from './AccentGradient';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Se lee después de la etiqueta; útil para explicar por qué está deshabilitada. */
  accessibilityHint?: string;
  testID?: string;
};

/** Casilla de 28 px con toda la fila tocable (mínimo 48 px de alto). Marcada usa el degradado. */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  accessibilityHint,
  testID,
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      testID={testID}
      style={({ pressed }) => [styles.root, disabled && styles.disabled, pressed && styles.pressed]}
    >
      {checked ? (
        <AccentGradient style={[styles.box, styles.boxChecked]}>
          <AppIcon name="dp-tick" size={20} color={colors.onAccent} />
        </AccentGradient>
      ) : (
        <View style={styles.box} />
      )}
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  box: {
    width: sizes.checkbox,
    height: sizes.checkbox,
    borderRadius: radii.sm - 4,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { borderWidth: 0 },
  label: { flex: 1 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
