import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Button,
  ConfirmDialog,
  GlassCard,
  ListItem,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import type { ProfileScreenProps } from '@/navigation/types';
import { useSession } from '@/services/session/SessionContext';
import { spacing } from '@/theme';

/** M1/M12 · Perfil. Acceso a contactos de emergencia (M9), ajustes y, en desarrollo, al catálogo. */
export function ProfileScreen({ navigation }: ProfileScreenProps<'Profile'>) {
  const { user, signOut } = useSession();
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <Screen testID="profile-screen">
      <ScreenHeader title="Perfil" />

      <GlassCard contentStyle={styles.identity}>
        <Avatar initials={user?.initials ?? ''} name={user?.fullName ?? ''} size={72} />
        <View style={styles.flex}>
          <AppText variant="heading">{user?.fullName}</AppText>
          <AppText color="textMuted">
            {user?.role === 'cuidador' ? 'Cuidador' : 'Paciente'} · {user?.email}
          </AppText>
        </View>
      </GlassCard>

      <ListItem
        icon="call"
        title="Contactos y emergencia"
        description="Tu equipo de salud y a quién avisar"
        onPress={() => navigation.navigate('Contacts')}
        testID="profile-contacts"
      />
      <ListItem
        icon="settings"
        title="Ajustes y accesibilidad"
        description="Tamaño de letra, avisos y cuenta"
        onPress={() => navigation.navigate('Settings')}
      />
      {__DEV__ && (
        <ListItem
          icon="color-palette"
          title="Catálogo de componentes"
          description="Solo en desarrollo"
          onPress={() => navigation.navigate('ComponentCatalog')}
          testID="profile-catalog"
        />
      )}

      <Button
        variant="secondary"
        icon="log-out"
        label="Cerrar sesión"
        onPress={() => setConfirmVisible(true)}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="¿Cerrar sesión?"
        message="Tus registros guardados en el teléfono se conservan."
        confirmLabel="Cerrar sesión"
        onConfirm={() => {
          setConfirmVisible(false);
          signOut();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
});
