import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Almacenamiento clave/valor asíncrono. Permite usar SecureStore en la app y memoria en pruebas. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** SecureStore solo acepta letras, números, ".", "-" y "_" en las claves. */
function safeKeyPart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

export const storageKeys = {
  /** Token de la sesión activa. Se borra al cerrar sesión. */
  sessionToken: 'dphogar.session.token',
  /** Credencial para entrar con Face ID o huella. Sobrevive al cierre de sesión. */
  biometricToken: 'dphogar.biometric.token',
  /** Aceptación del consentimiento informado de cada usuario (MOV-RF-002). */
  consent: (userId: string) => `dphogar.consent.${safeKeyPart(userId)}`,
  /** Cuentas activadas y códigos usados en el backend simulado. */
  mockState: 'dphogar.mock.state',
} as const;

export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  };
}

/**
 * Almacenamiento cifrado del sistema: Keychain en iOS y Keystore en Android (expo-secure-store).
 * En web (solo para revisar el diseño) no hay almacenamiento seguro: se usa localStorage.
 */
export function createSecureStore(): KeyValueStore {
  if (Platform.OS === 'web') return createWebStore();
  return {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  };
}

function createWebStore(): KeyValueStore {
  const storage = typeof localStorage === 'undefined' ? null : localStorage;
  if (!storage) return createMemoryStore();
  return {
    getItem: async (key) => storage.getItem(key),
    setItem: async (key, value) => storage.setItem(key, value),
    removeItem: async (key) => storage.removeItem(key),
  };
}
