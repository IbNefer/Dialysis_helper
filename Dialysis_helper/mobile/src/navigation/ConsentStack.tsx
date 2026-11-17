import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConsentScreen } from '@/screens/auth/ConsentScreen';

import { stackScreenOptions } from './navigationTheme';
import type { ConsentStackParamList } from './types';

const Stack = createNativeStackNavigator<ConsentStackParamList>();

/** Pila con una sola pantalla: sin aceptar el consentimiento no hay forma de llegar a Inicio. */
export function ConsentStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Consent"
        component={ConsentScreen}
        options={{ title: 'Consentimiento informado', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
