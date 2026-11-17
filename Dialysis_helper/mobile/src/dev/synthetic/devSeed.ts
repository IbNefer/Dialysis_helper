import type { MockSeed } from '@/services/mock/mockBackend';

import { generateSyntheticPatients } from './generatePatients.ts';
import { generateDemoInvitations } from './invitations.ts';

export const DEFAULT_SYNTHETIC_SEED = 2026;
export const DEFAULT_SYNTHETIC_COUNT = 8;
const MAX_SYNTHETIC_COUNT = 200;

export type SyntheticConfig = { seed: number; count: number };

function parseInteger(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
}

/**
 * Semilla y cantidad desde .env.local. Se leen de forma literal (`process.env.EXPO_PUBLIC_…`)
 * porque Expo solo reemplaza las variables escritas así al empaquetar.
 */
export function readSyntheticConfig(): SyntheticConfig {
  return {
    seed: parseInteger(
      process.env.EXPO_PUBLIC_SYNTHETIC_SEED,
      DEFAULT_SYNTHETIC_SEED,
      Number.MAX_SAFE_INTEGER,
    ),
    count: parseInteger(
      process.env.EXPO_PUBLIC_SYNTHETIC_COUNT,
      DEFAULT_SYNTHETIC_COUNT,
      MAX_SYNTHETIC_COUNT,
    ),
  };
}

/** Cuentas e invitaciones de prueba para el backend simulado. */
export function buildDevSeed(
  { seed, count }: SyntheticConfig = readSyntheticConfig(),
  referenceDate: Date = new Date(),
): MockSeed {
  const patients = generateSyntheticPatients({ seed, count, referenceDate });
  return {
    accounts: patients.map(({ user, password, dashboard }) => ({ user, password, dashboard })),
    invitations: generateDemoInvitations(seed, referenceDate),
    description: `Semilla ${seed} · ${patients.length} pacientes`,
  };
}
