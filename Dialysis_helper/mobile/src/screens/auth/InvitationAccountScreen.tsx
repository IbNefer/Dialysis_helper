import { useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View, type TextInputInstance } from 'react-native';

import {
  AppText,
  Button,
  GlassCard,
  InlineNotice,
  PasswordField,
  RequirementList,
  Screen,
  ScreenHeader,
  TextField,
  useToast,
} from '@/components/ui';
import type { AuthScreenProps } from '@/navigation/types';
import { userMessage } from '@/services/errors';
import { useSession } from '@/services/session/SessionContext';
import { radii, spacing } from '@/theme';
import {
  checkPasswordRules,
  digitsOnly,
  hasErrors,
  validateActivationForm,
  type ActivationForm,
  type FieldErrors,
} from '@/utils/validation';

const fieldOrder: (keyof ActivationForm)[] = [
  'firstName',
  'lastName',
  'phone',
  'password',
  'confirmPassword',
];

/** MOV-RF-001 · Paso 2 de 2: confirmar datos y crear la contraseña. Termina en el consentimiento. */
export function InvitationAccountScreen({
  navigation,
  route,
}: AuthScreenProps<'InvitationAccount'>) {
  const { invitation } = route.params;
  const { activateInvitation } = useSession();
  const { showToast } = useToast();
  const [form, setForm] = useState<ActivationForm>({
    firstName: invitation.firstName,
    lastName: invitation.lastName,
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors<keyof ActivationForm>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstNameRef = useRef<TextInputInstance>(null);
  const lastNameRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const focusField = (field: keyof ActivationForm) => {
    const refs = {
      firstName: firstNameRef,
      lastName: lastNameRef,
      phone: phoneRef,
      password: passwordRef,
      confirmPassword: confirmRef,
    };
    refs[field].current?.focus();
  };

  const update = (field: keyof ActivationForm) => (value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setFormError(null);
    if (submitted) setErrors(validateActivationForm(next));
  };

  const handleActivate = async () => {
    if (loading) return;
    setSubmitted(true);
    const found = validateActivationForm(form);
    setErrors(found);
    if (hasErrors(found)) {
      const first = fieldOrder.find((field) => found[field]);
      if (first) {
        AccessibilityInfo.announceForAccessibility(found[first] ?? '');
        focusField(first);
      }
      return;
    }

    setLoading(true);
    try {
      const phone = digitsOnly(form.phone);
      await activateInvitation({
        code: invitation.code,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        ...(phone ? { phone } : {}),
      });
      // La sesión queda abierta y el navegador pasa solo al consentimiento (MOV-RF-002).
      showToast('Tu cuenta quedó activada');
    } catch (error) {
      const message = userMessage(error);
      setFormError(message);
      AccessibilityInfo.announceForAccessibility(message);
      setLoading(false);
    }
  };

  const passwordRules = checkPasswordRules(form.password);
  const matches = form.confirmPassword !== '' && form.confirmPassword === form.password;

  return (
    <Screen withTabBar={false} testID="invitation-account-screen">
      <ScreenHeader
        title="Completa tus datos"
        subtitle="Paso 2 de 2 · Crea tu contraseña"
        onBack={() => navigation.goBack()}
      />

      <GlassCard tone="pending" radius={radii.card} contentStyle={styles.summary}>
        <View
          accessible
          accessibilityLabel={`Te invitó ${invitation.invitedBy}, ${invitation.clinic}`}
        >
          <AppText variant="caption" color="textMuted">
            Te invitó
          </AppText>
          <AppText variant="bodyLg">{invitation.invitedBy}</AppText>
          <AppText color="textMuted">{invitation.clinic}</AppText>
        </View>
        <View accessible accessibilityLabel={`Tu correo para entrar: ${invitation.email}`}>
          <AppText variant="caption" color="textMuted">
            Tu correo para entrar
          </AppText>
          <AppText variant="bodyLg" testID="invitation-email">
            {invitation.email}
          </AppText>
        </View>
      </GlassCard>

      <GlassCard radius={radii.cardLg} contentStyle={styles.form}>
        <TextField
          ref={firstNameRef}
          label="Nombre"
          value={form.firstName}
          onChangeText={update('firstName')}
          error={errors.firstName}
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          testID="activation-first-name"
        />
        <TextField
          ref={lastNameRef}
          label="Apellidos"
          value={form.lastName}
          onChangeText={update('lastName')}
          error={errors.lastName}
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => phoneRef.current?.focus()}
          testID="activation-last-name"
        />
        <TextField
          ref={phoneRef}
          label="Teléfono (opcional)"
          value={form.phone}
          onChangeText={update('phone')}
          error={errors.phone}
          placeholder="809-555-0100"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          testID="activation-phone"
        />
        <PasswordField
          ref={passwordRef}
          label="Contraseña"
          value={form.password}
          onChangeText={update('password')}
          error={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmRef.current?.focus()}
          testID="activation-password"
        />
        <RequirementList
          accessibilityLabel="Requisitos de la contraseña"
          requirements={passwordRules}
          testID="password-rules"
        />
        <PasswordField
          ref={confirmRef}
          label="Repite la contraseña"
          value={form.confirmPassword}
          onChangeText={update('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleActivate}
          testID="activation-confirm"
        />
        <RequirementList
          accessibilityLabel="Confirmación de la contraseña"
          requirements={[{ key: 'match', label: 'Las dos contraseñas coinciden', met: matches }]}
          testID="password-match"
        />
        {formError && (
          <InlineNotice variant="attention" message={formError} testID="activation-error" />
        )}
        <Button
          label="Activar mi cuenta"
          onPress={handleActivate}
          loading={loading}
          testID="activation-submit"
        />
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.md },
  form: { gap: spacing.md },
});
