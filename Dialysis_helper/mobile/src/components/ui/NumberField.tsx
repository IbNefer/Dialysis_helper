import { View, StyleSheet } from 'react-native';

import { spacing } from '@/theme';
import { OUT_OF_RANGE_MESSAGE } from '@/constants/copy';

import { InlineNotice } from './InlineNotice';
import { TextField, type TextFieldProps } from './TextField';

export type NumberFieldProps = Omit<TextFieldProps, 'status' | 'inputVariant' | 'keyboardType'> & {
  /** Marca el valor como fuera de lo habitual (la validación la hace la pantalla). */
  outOfRange?: boolean;
  noticeText?: string;
  /**
   * Muestra el aviso debajo del campo. Ponlo en false si la pantalla muestra un solo aviso para
   * varios campos (por ejemplo, presión alta y baja en dos columnas).
   */
  showNotice?: boolean;
};

/** Campo numérico grande (24/700) con unidad a la derecha y aviso de valor fuera de rango. */
export function NumberField({
  outOfRange = false,
  noticeText = OUT_OF_RANGE_MESSAGE,
  showNotice = true,
  ...fieldProps
}: NumberFieldProps) {
  return (
    <View style={styles.root}>
      <TextField
        {...fieldProps}
        inputVariant="inputNumber"
        keyboardType="decimal-pad"
        status={outOfRange ? 'attention' : 'default'}
        describedBy={outOfRange ? noticeText : undefined}
      />
      {outOfRange && showNotice && (
        <InlineNotice
          variant="attention"
          title="Atención."
          message={noticeText}
          testID={fieldProps.testID ? `${fieldProps.testID}-notice` : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm, flex: 1 },
});
