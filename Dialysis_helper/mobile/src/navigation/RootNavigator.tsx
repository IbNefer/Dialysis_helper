import { NavigationContainer } from '@react-navigation/native';

import { useSession } from '@/services/session/SessionContext';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { navigationTheme } from './navigationTheme';

/** Muestra el flujo de acceso o la app principal según la sesión (simulada). */
export function RootNavigator() {
  const { isSignedIn } = useSession();

  return (
    <NavigationContainer theme={navigationTheme}>
      {isSignedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
