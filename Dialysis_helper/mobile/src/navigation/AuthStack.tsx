import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { InvitationAccountScreen } from '@/screens/auth/InvitationAccountScreen';
import { InvitationCodeScreen } from '@/screens/auth/InvitationCodeScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { DevAccountsScreen } from '@/screens/dev/DevAccountsScreen';

import { stackScreenOptions } from './navigationTheme';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen
        name="InvitationCode"
        component={InvitationCodeScreen}
        options={{ title: 'Código de invitación' }}
      />
      <Stack.Screen
        name="InvitationAccount"
        component={InvitationAccountScreen}
        options={{ title: 'Activar mi cuenta' }}
      />
      {__DEV__ && (
        <Stack.Screen
          name="DevAccounts"
          component={DevAccountsScreen}
          options={{ title: 'Cuentas de prueba' }}
        />
      )}
    </Stack.Navigator>
  );
}
