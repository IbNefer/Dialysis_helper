import type { AuthService } from './auth/types';
import { createExpoBiometricService, type BiometricService } from './biometrics/biometricService';
import { createLocalConsentService } from './consent/localConsentService';
import type { ConsentService } from './consent/types';
import type { InvitationService } from './invitations/types';
import { loadDevSeed } from './mock/devSeed';
import { createMockBackend, type MockBackendDevTools, type MockSeed } from './mock/mockBackend';
import type { PatientDataService } from './patients/types';
import { createSecureStore, type KeyValueStore } from './storage/keyValueStore';

/** Todo lo que la app usa para hablar con el "backend" y con el teléfono. */
export type AppServices = {
  store: KeyValueStore;
  auth: AuthService;
  invitations: InvitationService;
  consent: ConsentService;
  biometrics: BiometricService;
  patients: PatientDataService;
  /** Solo con el backend simulado: cuentas de prueba y reinicio de la demo. */
  mock?: MockBackendDevTools;
};

/** Retraso simulado para que se vean los estados de carga. */
export const MOCK_LATENCY_MS = 600;

type MockServicesOptions = {
  store: KeyValueStore;
  seed?: MockSeed;
  latencyMs?: number;
  biometrics?: BiometricService;
  now?: () => Date;
};

/**
 * Servicios con el backend simulado. Es la única implementación mientras el backend no tenga
 * los endpoints de auth, invitaciones, consentimiento y resumen del paciente.
 * TODO(backend): crear las implementaciones HTTP con API_URL y elegirlas aquí.
 */
export function createMockServices({
  store,
  seed,
  latencyMs = 0,
  biometrics = createExpoBiometricService(),
  now,
}: MockServicesOptions): AppServices {
  const backend = createMockBackend({ store, seed, latencyMs, now });
  return {
    store,
    auth: backend.auth,
    invitations: backend.invitations,
    consent: createLocalConsentService({ store, now }),
    biometrics,
    patients: backend.patients,
    mock: backend.dev,
  };
}

let defaultServices: AppServices | null = null;

/** Servicios de la app: almacenamiento seguro y, en desarrollo, pacientes sintéticos. */
export function getDefaultServices(): AppServices {
  defaultServices ??= createMockServices({
    store: createSecureStore(),
    seed: loadDevSeed(),
    latencyMs: MOCK_LATENCY_MS,
  });
  return defaultServices;
}
