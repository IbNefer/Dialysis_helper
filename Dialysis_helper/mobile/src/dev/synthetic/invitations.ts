/**
 * Invitaciones de prueba para el flujo de activación (MOV-RF-001), una por cada caso:
 * válida, vencida y ya usada. Cualquier otro código da "no encontramos ese código".
 */
import type { MockInvitation } from '@/services/mock/mockBackend';

import { CLINICS, DOCTORS, FEMALE_NAMES, LAST_NAMES } from './catalog.ts';
import { EMAIL_DOMAIN, slug } from './generatePatients.ts';
import { createRandom } from './prng.ts';

export const DEMO_INVITATION_CODES = {
  valid: 'DEMO-2026',
  expired: 'VENC-2025',
  used: 'USAD-2026',
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export function generateDemoInvitations(seed: number, referenceDate: Date): MockInvitation[] {
  // Semilla propia para no alterar la secuencia de los pacientes.
  const random = createRandom(seed + 7919);
  const at = (days: number) => new Date(referenceDate.getTime() + days * DAY_MS).toISOString();

  const invitee = (prefix: string) => {
    const firstName = random.pick(FEMALE_NAMES);
    const lastName = random.pick(LAST_NAMES);
    return {
      firstName,
      lastName,
      email: `${slug(firstName)}.${slug(lastName)}.${prefix}@${EMAIL_DOMAIN}`,
      invitedBy: random.pick(DOCTORS),
      clinic: random.pick(CLINICS),
    };
  };

  return [
    {
      code: DEMO_INVITATION_CODES.valid,
      ...invitee('invitada'),
      expiresAt: at(7),
      usedAt: null,
    },
    {
      code: DEMO_INVITATION_CODES.expired,
      ...invitee('vencida'),
      expiresAt: at(-3),
      usedAt: null,
    },
    {
      code: DEMO_INVITATION_CODES.used,
      ...invitee('usada'),
      expiresAt: at(20),
      usedAt: at(-10),
    },
  ];
}
