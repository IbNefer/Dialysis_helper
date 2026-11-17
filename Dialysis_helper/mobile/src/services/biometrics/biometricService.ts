import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricAvailability = 'available' | 'no_hardware' | 'not_enrolled';

/** Face ID / huella del sistema (MOV-RF-003, opcional). */
export interface BiometricService {
  getAvailability(): Promise<BiometricAvailability>;
  /** true si la persona confirmó su identidad; false si canceló o falló. */
  authenticate(promptMessage: string): Promise<boolean>;
}

/**
 * Implementación con expo-local-authentication. Funciona en Expo Go con huella (Android).
 * Face ID en iOS necesita una build de desarrollo (el permiso está en app.json).
 */
export function createExpoBiometricService(): BiometricService {
  return {
    async getAvailability() {
      if (!(await LocalAuthentication.hasHardwareAsync())) return 'no_hardware';
      if (!(await LocalAuthentication.isEnrolledAsync())) return 'not_enrolled';
      return 'available';
    },
    async authenticate(promptMessage) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar el código del teléfono',
      });
      return result.success;
    },
  };
}
