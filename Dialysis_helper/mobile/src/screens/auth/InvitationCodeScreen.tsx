import { useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet } from 'react-native';

import {
  AppText,
  Button,
  GlassCard,
  InlineNotice,
  Screen,
  ScreenHeader,
  TextField,
} from '@/components/ui';
import type { AuthScreenProps } from '@/navigation/types';
import { isServiceError, userMessage } from '@/services/errors';
import { useSession } from '@/services/session/SessionContext';
import { radii, sizes, spacing } from '@/theme';
import { normalizeInvitationCode, validateInvitationCode } from '@/utils/validation';

type CodeProblem =
  { kind: 'field'; message: string } | { kind: 'expired' | 'used' | 'other'; message: string };

const noticeTitles = { expired: 'Código vencido.', used: 'Código ya usado.', other: '' } as const;

/** MOV-RF-001 · Paso 1 de 2: escribir el código que dio el doctor y validarlo. */
export function InvitationCodeScreen({ navigation, route }: AuthScreenProps<'InvitationCode'>) {
  const { services } = useSession();
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState<CodeProblem | null>(null);
  const [loading, setLoading] = useState(false);

  // Los códigos de prueba (solo desarrollo) llegan ya escritos.
  const prefill = route.params?.code;
  const [appliedPrefill, setAppliedPrefill] = useState<string | undefined>(undefined);
  if (prefill !== undefined && prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    setCode(prefill);
    setProblem(null);
  }

  const handleValidate = async () => {
    if (loading) return;
    const formatError = validateInvitationCode(code);
    if (formatError) {
      setProblem({ kind: 'field', message: formatError });
      AccessibilityInfo.announceForAccessibility(formatError);
      return;
    }

    const normalized = normalizeInvitationCode(code);
    setCode(normalized);
    setProblem(null);
    setLoading(true);
    try {
      const invitation = await services.invitations.validate(normalized);
      navigation.navigate('InvitationAccount', { invitation });
    } catch (error) {
      const message = userMessage(error);
      const kind = isServiceError(error, 'invitation_invalid')
        ? 'field'
        : isServiceError(error, 'invitation_expired')
          ? 'expired'
          : isServiceError(error, 'invitation_used')
            ? 'used'
            : 'other';
      setProblem({ kind, message });
      AccessibilityInfo.announceForAccessibility(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen withTabBar={false} testID="invitation-code-screen">
      <ScreenHeader
        title="Activa tu cuenta"
        subtitle="Paso 1 de 2 · Código de invitación"
        onBack={() => navigation.goBack()}
      />
      <AppText color="textMuted">
        Escribe el código que te dio tu doctor. Está en el mensaje o en la hoja de invitación.
      </AppText>

      <GlassCard radius={radii.cardLg} contentStyle={styles.form}>
        <TextField
          label="Código de invitación"
          value={code}
          onChangeText={(value) => {
            setCode(value);
            setProblem(null);
          }}
          onBlur={() => setCode((current) => normalizeInvitationCode(current))}
          error={problem?.kind === 'field' ? problem.message : undefined}
          helperText="8 letras o números. El guion es opcional."
          placeholder="ABCD-2345"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={12}
          returnKeyType="go"
          onSubmitEditing={handleValidate}
          testID="invitation-code"
        />
        {problem && problem.kind !== 'field' && (
          <InlineNotice
            variant="attention"
            title={noticeTitles[problem.kind] || undefined}
            message={problem.message}
            testID="invitation-code-notice"
          />
        )}
        <Button
          label="Validar código"
          onPress={handleValidate}
          loading={loading}
          testID="invitation-validate"
        />
      </GlassCard>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Ya tengo cuenta, iniciar sesión"
        onPress={() => navigation.navigate('Login')}
        style={styles.link}
        hitSlop={8}
      >
        <AppText variant="bodyLg" color="accentBlue" align="center">
          Ya tengo cuenta · Iniciar sesión
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  link: { minHeight: sizes.touchTarget, justifyContent: 'center', alignSelf: 'center' },
});
