import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui';
import { buildDevSeed } from '@/dev/synthetic';
import { RootNavigator } from '@/navigation/RootNavigator';
import { createMockServices, type AppServices } from '@/services';
import type {
  BiometricAvailability,
  BiometricService,
} from '@/services/biometrics/biometricService';
import { SessionProvider, type SessionUser } from '@/services/session/SessionContext';
import { createMemoryStore, type KeyValueStore } from '@/services/storage/keyValueStore';

/** "Hoy" fijo para que las invitaciones de prueba no venzan según el reloj real. */
export const TEST_NOW = new Date('2026-11-17T12:00:00Z');
export const TEST_SEED = 2026;

export const testMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function fakeBiometrics(
  availability: BiometricAvailability = 'available',
  succeeds = true,
): BiometricService & { authenticate: jest.Mock } {
  return {
    getAvailability: async () => availability,
    authenticate: jest.fn(async () => succeeds),
  };
}

type TestServicesOptions = {
  store?: KeyValueStore;
  biometrics?: BiometricService;
  count?: number;
};

/** Servicios aislados por prueba: almacenamiento en memoria, sin latencia y semilla fija. */
export function createTestServices({
  store = createMemoryStore(),
  biometrics = fakeBiometrics(),
  count = 6,
}: TestServicesOptions = {}): AppServices {
  return createMockServices({
    store,
    seed: buildDevSeed({ seed: TEST_SEED, count }, TEST_NOW),
    latencyMs: 0,
    biometrics,
    now: () => TEST_NOW,
  });
}

type RenderAppOptions = {
  initialUser?: SessionUser | null;
  services?: AppServices;
};

export async function renderApp({
  initialUser = null,
  services = createTestServices(),
}: RenderAppOptions = {}) {
  const result = await render(
    <SafeAreaProvider initialMetrics={testMetrics}>
      <ToastProvider>
        <SessionProvider initialUser={initialUser} services={services}>
          <RootNavigator />
        </SessionProvider>
      </ToastProvider>
    </SafeAreaProvider>,
  );
  return { ...result, services };
}
