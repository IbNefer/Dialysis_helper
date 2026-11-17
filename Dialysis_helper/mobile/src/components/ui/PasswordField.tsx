import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, type TextInputInstance } from 'react-native';

import { sizes, spacing } from '@/theme';

import { AppText } from './AppText';
import { TextField, type TextFieldProps } from './TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'accessory' | 'unit'>;

/** Campo de contraseña con botón "Mostrar / Ocultar" (ayuda a quien escribe con dificultad). */
export const PasswordField = forwardRef<TextInputInstance, PasswordFieldProps>(
  function PasswordField({ label, testID, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <TextField
        ref={ref}
        label={label}
        testID={testID}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
        accessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`
            }
            onPress={() => setVisible((current) => !current)}
            hitSlop={4}
            style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
            testID={testID ? `${testID}-toggle` : undefined}
          >
            <AppText variant="label" color="accentBlue">
              {visible ? 'Ocultar' : 'Mostrar'}
            </AppText>
          </Pressable>
        }
      />
    );
  },
);

const styles = StyleSheet.create({
  toggle: {
    minHeight: sizes.touchTarget,
    minWidth: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
