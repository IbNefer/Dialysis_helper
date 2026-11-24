import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppLogo, AppText, Button, GlassCard, Screen, TextField } from '@/components/ui';
import { EMERGENCY_DISCLAIMER } from '@/constants/copy';
import type { AuthScreenProps } from '@/navigation/types';
import { useSession } from '@/services/session/SessionContext';
import { sizes, spacing } from '@/theme';

/** M1 · Iniciar sesión. Maqueta: el botón activa la sesión simulada con cualquier dato. */
export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen withTabBar={false} contentStyle={styles.content} testID="login-screen">
      <View style={styles.brand}>
        <AppLogo />
        <AppText variant="display" accessibilityRole="header">
          DP-Hogar
        </AppText>
        <AppText variant="lead" color="textMuted">
          Tu diálisis en casa, acompañada por tu equipo de salud.
        </AppText>
      </View>

      <GlassCard contentStyle={styles.form}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="maria@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
        />
        <Button label="Iniciar sesión" onPress={handleSignIn} loading={loading} />
        <Button
          variant="secondary"
          icon="happy"
          label="Entrar con Face ID o huella"
          accessibilityHint="Disponible próximamente"
        />
      </GlassCard>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Tengo una invitación de mi doctor"
        onPress={() => navigation.navigate('InvitationRegister')}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: spacing.xl },
  brand: { gap: spacing.sm },
  form: { gap: spacing.md },
  link: { minHeight: sizes.touchTarget, justifyContent: 'center' },
  footer: { marginTop: 'auto', paddingHorizontal: spacing.md },
});
