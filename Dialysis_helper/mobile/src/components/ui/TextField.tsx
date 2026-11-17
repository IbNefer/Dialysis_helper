import { forwardRef, useState, type ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';
import { spokenUnit } from '@/utils/units';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

export type FieldStatus = 'default' | 'attention' | 'error';

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
  /** Mensaje de error debajo del campo. Pone el campo en estado 'error'. */
  error?: string;
  /** Ayuda permanente debajo del campo (por ejemplo, el formato del código). */
  helperText?: string;
  /** Elemento a la derecha dentro de la caja (por ejemplo, el botón "Mostrar"). */
  accessory?: ReactNode;
  inputVariant?: 'inputText' | 'inputNumber';
};

const BORDER = 1;
const BORDER_ACTIVE = 2;
const PADDING = spacing.md;

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  {
    label,
    unit,
    status = 'default',
    describedBy,
    error,
    helperText,
    accessory,
    inputVariant = 'inputText',
    onFocus,
    onBlur,
    accessibilityLabel,
    ...inputProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const effectiveStatus: FieldStatus = error ? 'error' : status;
  const active = effectiveStatus !== 'default' || focused;
  const borderColor =
    effectiveStatus === 'error'
      ? colors.urgent
      : effectiveStatus === 'attention'
        ? colors.attention
        : focused
          ? colors.focusBorder
          : colors.inputBorder;
  // Compensa el grosor del borde para que el contenido no salte al enfocar.
  const inset = PADDING - (active ? BORDER_ACTIVE - BORDER : 0);
  const hint = [error, describedBy, helperText].filter(Boolean).join('. ') || undefined;
  const testID = inputProps.testID;

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
            paddingLeft: inset,
            paddingRight: accessory ? spacing.xxs : inset,
          },
        ]}
        testID={testID ? `${testID}-box` : undefined}
      >
        <TextInput
          ref={ref}
          {...inputProps}
          accessibilityLabel={
            accessibilityLabel ?? (unit ? `${label}, en ${spokenUnit(unit)}` : label)
          }
          accessibilityHint={hint}
          aria-invalid={effectiveStatus === 'error'}
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
        {accessory}
      </View>
      {error ? (
        <View
          style={styles.message}
          accessibilityLiveRegion="polite"
          testID={testID ? `${testID}-error` : undefined}
        >
          <AppIcon name="dp-warn" size={18} color={colors.urgent} />
          <AppText variant="caption" color="urgent" style={styles.flex}>
            {error}
          </AppText>
        </View>
      ) : (
        helperText && (
          <AppText variant="caption" color="textMuted" importantForAccessibility="no">
            {helperText}
          </AppText>
        )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { gap: spacing.xs, flex: 1 },
  box: {
    minHeight: sizes.inputHeight,
    borderRadius: radii.input,
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
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  flex: { flex: 1 },
});
