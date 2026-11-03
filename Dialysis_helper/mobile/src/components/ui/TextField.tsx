import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';
import { spokenUnit } from '@/utils/units';

import { AppText } from './AppText';

export type FieldStatus = 'default' | 'attention';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Unidad a la derecha del valor (kg, mmHg, °C, ml). */
  unit?: string;
  /** 'attention' pinta el borde de atención (valor fuera de lo habitual). */
  status?: FieldStatus;
  /**
   * Texto del aviso asociado. Se lee como pista del campo: es el equivalente en React Native de
   * aria-describedby, que no existe en iOS ni Android.
   */
  describedBy?: string;
  inputVariant?: 'inputText' | 'inputNumber';
};

const BORDER = 1;
const BORDER_ACTIVE = 2;
const PADDING = spacing.lg;

export function TextField({
  label,
  unit,
  status = 'default',
  describedBy,
  inputVariant = 'inputText',
  onFocus,
  onBlur,
  accessibilityLabel,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const attention = status === 'attention';
  const active = attention || focused;
  const borderColor = attention
    ? colors.attention
    : focused
      ? colors.focusBorder
      : colors.inputBorder;
  // Compensa el grosor del borde para que el contenido no salte al enfocar.
  const inset = PADDING - (active ? BORDER_ACTIVE - BORDER : 0);

  return (
    <View style={styles.root}>
      <AppText variant="label" accessible={false} importantForAccessibility="no">
        {label}
      </AppText>
      <View
        style={[
          styles.box,
          {
            borderColor,
            borderWidth: active ? BORDER_ACTIVE : BORDER,
            paddingHorizontal: inset,
          },
        ]}
        testID={inputProps.testID ? `${inputProps.testID}-box` : undefined}
      >
        <TextInput
          {...inputProps}
          accessibilityLabel={
            accessibilityLabel ?? (unit ? `${label}, en ${spokenUnit(unit)}` : label)
          }
          accessibilityHint={describedBy}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accentStart}
          cursorColor={colors.accentStart}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[typography[inputVariant], styles.input]}
        />
        {unit && (
          <AppText variant="statUnit" color="textMuted" accessible={false}>
            {unit}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs, flex: 1 },
  box: {
    minHeight: sizes.inputHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.inputBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    paddingVertical: spacing.sm,
    // En web el navegador dibuja su propio contorno; el foco ya lo indica el borde de la caja.
    // ('solid' con ancho 0: con el estilo 'auto' Chrome dibuja el anillo aunque el ancho sea 0).
    ...Platform.select({ web: { outlineStyle: 'solid' as const, outlineWidth: 0 } }),
  },
});
