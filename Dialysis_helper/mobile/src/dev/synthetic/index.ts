/**
 * SIS-RF-019 · Generador de pacientes sintéticos.
 *
 * SOLO DESARROLLO: la app lo carga dentro de `if (__DEV__)` (services/mock/devSeed.ts), así que
 * no entra en el bundle de producción. No lo importes desde código que corre en producción.
 */
export {
  ALERT_MESSAGES,
  DEMO_PASSWORD,
  generateSyntheticPatients,
  type GenerateOptions,
  type Scenario,
  type SyntheticPatient,
} from './generatePatients.ts';
export { DEMO_INVITATION_CODES, generateDemoInvitations } from './invitations.ts';
export {
  buildDevSeed,
  DEFAULT_SYNTHETIC_COUNT,
  DEFAULT_SYNTHETIC_SEED,
  readSyntheticConfig,
  type SyntheticConfig,
} from './devSeed.ts';
export { createRandom, type Random } from './prng.ts';
