import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  View,
  type TextInputInstance,
} from 'react-native';

import {
  AppLogo,
  AppText,
  Button,
  GlassCard,
  InlineNotice,
  PasswordField,
  Screen,
  TextField,
  useToast,
} from '@/components/ui';
import { EMERGENCY_DISCLAIMER } from '@/constants/copy';
import type { AuthScreenProps } from '@/navigation/types';
import { userMessage } from '@/services/errors';
import { useSession } from '@/services/session/SessionContext';
import { radii, sizes, spacing } from '@/theme';
import { hasErrors, validateLoginForm, type FieldErrors, type LoginForm } from '@/utils/validation';

/** MOV-RF-003 · Iniciar sesión con correo y contraseña (o Face ID / huella). */
export function LoginScreen({ navigation, route }: AuthScreenProps<'Login'>) {
  const { signIn, signInWithBiometrics } = useSession();
  const { showToast } = useToast();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<keyof LoginForm>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'password' | 'biometrics' | null>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  // Las cuentas de prueba (solo desarrollo) llegan con el formulario lleno. Se aplica durante el
  // render (patrón recomendado por React) en vez de en un efecto.
  const prefillEmail = route.params?.email;
  const [appliedPrefill, setAppliedPrefill] = useState<string | undefined>(undefined);
  if (prefillEmail !== undefined && prefillEmail !== appliedPrefill) {
    setAppliedPrefill(prefillEmail);
    setForm({ email: prefillEmail, password: route.params?.password ?? '' });
    setErrors({});
    setFormError(null);
  }

  const update = (field: keyof LoginForm) => (value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setFormError(null);
    // Después del primer intento, el error se corrige mientras escribe.
    if (submitted) setErrors(validateLoginForm(next));
  };

  const handleSignIn = async () => {
    if (loading) return;
    setSubmitted(true);
    const found = validateLoginForm(form);
    setErrors(found);
    if (hasErrors(found)) {
      const first = found.email ?? found.password;
      if (first) AccessibilityInfo.announceForAccessibility(first);
      (found.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setLoading('password');
    setFormError(null);
    try {
      const status = await signIn(form.email, form.password);
      if (status === 'signedIn') showToast('Sesión iniciada');
    } catch (error) {
      const message = userMessage(error);
      setFormError(message);
      AccessibilityInfo.announceForAccessibility(message);
      setLoading(null);
    }
  };

  const handleBiometrics = async () => {
    if (loading) return;
    setLoading('biometrics');
    setFormError(null);
    try {
      const status = await signInWithBiometrics();
      if (status === 'signedIn') showToast('Identidad verificada');
    } catch (error) {
      const message = userMessage(error);
      setFormError(message);
      AccessibilityInfo.announceForAccessibility(message);
      setLoading(null);
    }
  };

  return (
    <Screen withTabBar={false} contentStyle={styles.content} testID="login-screen">
      <View style={styles.brand}>
        <AppLogo />
        <View style={styles.brandText}>
          <AppText variant="display" accessibilityRole="header">
            DP-Hogar
          </AppText>
          <AppText variant="lead" color="textMuted">
            Tu diálisis en casa, acompañada por tu equipo de salud.
          </AppText>
        </View>
      </View>

      <GlassCard radius={radii.cardLg} contentStyle={styles.form}>
        <TextField
          ref={emailRef}
          label="Correo electrónico"
          value={form.email}
          onChangeText={update('email')}
          error={errors.email}
          placeholder="maria@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="login-email"
        />
        <PasswordField
          ref={passwordRef}
          label="Contraseña"
          value={form.password}
          onChangeText={update('password')}
          error={errors.password}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
          testID="login-password"
        />
        {formError && <InlineNotice variant="attention" message={formError} testID="login-error" />}
        <Button
          label="Iniciar sesión"
          onPress={handleSignIn}
          loading={loading === 'password'}
          disabled={loading === 'biometrics'}
          testID="login-submit"
        />
        <Button
          variant="secondary"
          icon="dp-face"
          label="Entrar con Face ID o huella"
          onPress={handleBiometrics}
          loading={loading === 'biometrics'}
          disabled={loading === 'password'}
          testID="login-biometrics"
        />
      </GlassCard>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Tengo una invitación de mi doctor"
        onPress={() => navigation.navigate('InvitationCode')}
        style={styles.link}
        hitSlop={8}
      >
        <AppText variant="bodyLg" color="accentBlue" align="center">
          Tengo una invitación de mi doctor
        </AppText>
      </Pressable>

      <AppText variant="caption" color="textMuted" align="center" style={styles.footer}>
        {EMERGENCY_DISCLAIMER}
      </AppText>

      {__DEV__ && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Cuentas de prueba, solo en desarrollo"
          onPress={() => navigation.navigate('DevAccounts')}
          style={styles.link}
          testID="login-dev-accounts"
        >
          <AppText variant="caption" color="textMuted" align="center">
            Cuentas de prueba (solo desarrollo)
          </AppText>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Prototipo: 28 px entre bloques y el logo más abajo que el resto de pantallas.
  content: { gap: spacing.xl + spacing.xxs },
  brand: { gap: spacing.md, marginTop: spacing.xxl },
  brandText: { gap: spacing.xs },
  form: { gap: spacing.md },
  link: { minHeight: sizes.touchTarget, justifyContent: 'center', alignSelf: 'center' },
  footer: { marginTop: 'auto', paddingHorizontal: spacing.md },
});
