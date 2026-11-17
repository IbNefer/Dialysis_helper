import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Button,
  EmptyState,
  GlassCard,
  InlineNotice,
  Screen,
  ScreenHeader,
  SeverityBadge,
  useToast,
} from '@/components/ui';
import type { AuthScreenProps } from '@/navigation/types';
import type { MockInvitation } from '@/services/mock/mockBackend';
import { useSession } from '@/services/session/SessionContext';
import { spacing } from '@/theme';

function invitationState(expiresAt: string, usedAt: string | null): string {
  if (usedAt) return 'ya usado';
  return new Date(expiresAt).getTime() < Date.now() ? 'vencido' : 'válido';
}

/**
 * SOLO DESARROLLO (SIS-RF-019): pacientes sintéticos y códigos de invitación de prueba.
 * Tocar una cuenta llena el login; tocar un código llena la activación.
 */
export function DevAccountsScreen({ navigation }: AuthScreenProps<'DevAccounts'>) {
  const { services } = useSession();
  const { showToast } = useToast();
  const [resetting, setResetting] = useState(false);
  const mock = services.mock;
  const accounts = mock?.accounts() ?? [];
  const [invitations, setInvitations] = useState<MockInvitation[]>([]);

  const refreshInvitations = useCallback(() => {
    mock?.invitations().then(setInvitations, () => setInvitations([]));
  }, [mock]);

  // Se vuelve a leer al entrar a la pantalla: la demo pudo haber usado un código.
  useEffect(
    () => navigation.addListener('focus', refreshInvitations),
    [navigation, refreshInvitations],
  );
  useEffect(refreshInvitations, [refreshInvitations]);

  const reset = async () => {
    if (!mock) return;
    setResetting(true);
    try {
      await mock.reset();
      refreshInvitations();
      showToast('Datos de demostración reiniciados');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Screen withTabBar={false} testID="dev-accounts-screen">
      <ScreenHeader
        title="Cuentas de prueba"
        subtitle={`Solo en desarrollo · ${mock?.description() ?? 'sin datos sintéticos'}`}
        onBack={() => navigation.goBack()}
      />
      <InlineNotice
        variant="info"
        message="Pacientes ficticios del generador sintético. Todas las contraseñas son demo1234."
      />

      {accounts.length === 0 && (
        <EmptyState
          icon="people"
          title="No hay pacientes sintéticos"
          description="Revisa EXPO_PUBLIC_SYNTHETIC_COUNT en .env.local."
        />
      )}

      {accounts.map(({ user, password, dashboard }) => {
        const urgent = dashboard?.alerts.filter((alert) => alert.severity === 'urgent').length ?? 0;
        const attention =
          dashboard?.alerts.filter((alert) => alert.severity === 'attention').length ?? 0;
        return (
          <GlassCard key={user.id} contentStyle={styles.account} testID={`dev-account-${user.id}`}>
            <View style={styles.identity}>
              <Avatar initials={user.initials} name={user.fullName} size={44} />
              <View style={styles.flex}>
                <AppText variant="bodyLg">{user.fullName}</AppText>
                <AppText variant="caption" color="textMuted" selectable>
                  {user.email}
                </AppText>
              </View>
            </View>
            {(urgent > 0 || attention > 0) && (
              <View style={styles.badges}>
                {urgent > 0 && <SeverityBadge severity="urgent" />}
                {attention > 0 && <SeverityBadge severity="attention" />}
              </View>
            )}
            <Button
              variant="secondary"
              label="Usar esta cuenta"
              onPress={() => navigation.navigate('Login', { email: user.email, password })}
              testID={`dev-use-${user.id}`}
            />
          </GlassCard>
        );
      })}

      <AppText variant="heading" accessibilityRole="header" style={styles.sectionTitle}>
        Códigos de invitación
      </AppText>
      {invitations.map((invitation) => (
        <GlassCard key={invitation.code} contentStyle={styles.account}>
          <AppText variant="bodyLg">
            {invitation.code} · {invitationState(invitation.expiresAt, invitation.usedAt)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {invitation.firstName} {invitation.lastName} · {invitation.email}
          </AppText>
          <Button
            variant="secondary"
            label="Usar este código"
            onPress={() => navigation.navigate('InvitationCode', { code: invitation.code })}
          />
        </GlassCard>
      ))}
      <AppText variant="caption" color="textMuted">
        Cualquier otro código da &quot;código no encontrado&quot;.
      </AppText>

      <Button
        variant="dangerSoft"
        label="Reiniciar datos de demostración"
        accessibilityHint="Borra cuentas activadas, códigos usados y consentimientos de este teléfono"
        onPress={reset}
        loading={resetting}
        testID="dev-reset"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  account: { gap: spacing.sm },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  flex: { flex: 1 },
  sectionTitle: { marginTop: spacing.md },
});
