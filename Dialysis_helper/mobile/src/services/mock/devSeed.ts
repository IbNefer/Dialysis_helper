import type { MockSeed } from './mockBackend';

/**
 * Datos de prueba del generador sintético (SIS-RF-019), SOLO en desarrollo.
 *
 * El `require` va dentro de `if (__DEV__)`: al empaquetar para producción, Metro reemplaza
 * `__DEV__` por `false`, elimina la rama y el generador no entra en el bundle.
 * (Comprobado con `npx expo export`: ver el README.)
 */
export function loadDevSeed(): MockSeed | undefined {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const synthetic = require('@/dev/synthetic') as typeof import('@/dev/synthetic');
    return synthetic.buildDevSeed();
  }
  return undefined;
}
