import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { InvitationScreen } from '@/screens/auth/InvitationScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';

import { stackScreenOptions } from './navigationTheme';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen
        name="InvitationRegister"
        component={InvitationScreen}
        options={{ title: 'Registro por invitación' }}
      />
    </Stack.Navigator>
  );
}
