import { NavigationContainer } from '@react-navigation/native';

import { LoadingView } from '@/components/ui';
import { useSession } from '@/services/session/SessionContext';

import { AuthStack } from './AuthStack';
import { ConsentStack } from './ConsentStack';
import { MainTabs } from './MainTabs';
import { navigationTheme } from './navigationTheme';

/**
 * Elige el flujo según la sesión:
 * sin sesión → acceso · con sesión sin consentimiento → consentimiento · con ambos → la app.
 */
export function RootNavigator() {
  const { status } = useSession();

  if (status === 'restoring') return <LoadingView message="Abriendo DP-Hogar…" />;

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'signedIn' && <MainTabs />}
      {status === 'needsConsent' && <ConsentStack />}
      {status === 'signedOut' && <AuthStack />}
    </NavigationContainer>
  );
}
