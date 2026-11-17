import { demoDashboard } from '@/constants/demoPatient';
import {
  initialsOf,
  type AuthService,
  type AuthSession,
  type AuthUser,
} from '@/services/auth/types';
import { ServiceError } from '@/services/errors';
import type {
  ActivationInput,
  InvitationPreview,
  InvitationService,
} from '@/services/invitations/types';
import { emptyDashboard, type PatientDataService } from '@/services/patients/types';
import { storageKeys, type KeyValueStore } from '@/services/storage/keyValueStore';
import type { PatientDashboard } from '@/types/patient';
import { normalizeEmail, normalizeInvitationCode } from '@/utils/validation';

/**
 * BACKEND SIMULADO para auth, invitaciones y datos del paciente mientras el backend real no tenga
 * esos endpoints (ver los contratos propuestos en cada `types.ts`).
 *
 * - Las cuentas y las invitaciones de prueba llegan como `seed` (en desarrollo, del generador
 *   sintético SIS-RF-019). En producción no hay seed: el backend simulado arranca vacío.
 * - Las cuentas activadas por invitación y los códigos usados se guardan en `store`, para que
 *   sigan ahí al reabrir la app.
 */

export type MockAccount = {
  user: AuthUser;
  /** Contraseña de prueba en texto plano (solo datos ficticios del seed). */
  password: string;
  dashboard?: PatientDashboard;
};

export type MockInvitation = InvitationPreview & {
  /** Fecha ISO en que se usó, o null si sigue libre. */
  usedAt: string | null;
};

export type MockSeed = {
  accounts: MockAccount[];
  invitations: MockInvitation[];
  /** Cómo se generó, para mostrarlo en la pantalla de desarrollo ("Semilla 2026 · 8 pacientes"). */
  description?: string;
};

type ActivatedAccount = { user: AuthUser; passwordHash: string; phone?: string };
type PersistedState = { activated: ActivatedAccount[]; usedCodes: Record<string, string> };

export type MockBackendOptions = {
  store: KeyValueStore;
  seed?: MockSeed;
  /** Retraso simulado de red. 0 en pruebas. */
  latencyMs?: number;
  now?: () => Date;
};

/** Herramientas de desarrollo: listar cuentas de prueba y reiniciar los datos de demostración. */
export type MockBackendDevTools = {
  description(): string | undefined;
  accounts(): MockAccount[];
  /** Invitaciones de prueba con su estado real en este teléfono (lee los códigos usados). */
  invitations(): Promise<MockInvitation[]>;
  /**
   * Reinicia la demo: borra cuentas activadas, códigos usados y los consentimientos guardados en
   * este teléfono (las cuentas del seed no cambian).
   */
  reset(): Promise<void>;
};

export type MockBackend = {
  auth: AuthService;
  invitations: InvitationService;
  patients: PatientDataService;
  dev: MockBackendDevTools;
};

/**
 * FNV-1a de 32 bits. Solo para no guardar la contraseña en claro en el backend SIMULADO:
 * NO es un hash seguro y no debe usarse fuera de este archivo.
 */
function mockHash(password: string, salt: string): string {
  let hash = 0x811c9dc5;
  for (const char of `${salt}:${password}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

const TOKEN_PATTERN = /^mock\.([A-Za-z0-9_-]+)\.[a-z0-9]+$/;

function emptyState(): PersistedState {
  return { activated: [], usedCodes: {} };
}

function parseState(raw: string | null): PersistedState {
  if (!raw) return emptyState();
  try {
    const value = JSON.parse(raw) as Partial<PersistedState>;
    return {
      activated: Array.isArray(value.activated) ? value.activated : [],
      usedCodes: value.usedCodes && typeof value.usedCodes === 'object' ? value.usedCodes : {},
    };
  } catch {
    return emptyState();
  }
}

export function createMockBackend({
  store,
  seed = { accounts: [], invitations: [] },
  latencyMs = 0,
  now = () => new Date(),
}: MockBackendOptions): MockBackend {
  let state: PersistedState | null = null;

  async function load(): Promise<PersistedState> {
    if (!state) state = parseState(await store.getItem(storageKeys.mockState));
    return state;
  }

  async function save(next: PersistedState) {
    state = next;
    await store.setItem(storageKeys.mockState, JSON.stringify(next));
  }

  async function network() {
    if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }

  function issueToken(user: AuthUser): AuthSession {
    return { token: `mock.${user.id}.${now().getTime().toString(36)}`, user };
  }

  function findSeedAccount(predicate: (account: MockAccount) => boolean) {
    return seed.accounts.find(predicate);
  }

  function findUserById(current: PersistedState, id: string): AuthUser | undefined {
    return (
      findSeedAccount((account) => account.user.id === id)?.user ??
      current.activated.find((account) => account.user.id === id)?.user
    );
  }

  function emailExists(current: PersistedState, email: string): boolean {
    return (
      findSeedAccount((account) => account.user.email === email) !== undefined ||
      current.activated.some((account) => account.user.email === email)
    );
  }

  /** Busca la invitación y comprueba que se pueda usar. */
  function checkInvitation(current: PersistedState, rawCode: string): MockInvitation {
    const code = normalizeInvitationCode(rawCode);
    const invitation = seed.invitations.find((item) => item.code === code);
    if (!invitation) throw new ServiceError('invitation_invalid');
    if (invitation.usedAt || current.usedCodes[code]) throw new ServiceError('invitation_used');
    if (new Date(invitation.expiresAt).getTime() < now().getTime()) {
      throw new ServiceError('invitation_expired');
    }
    return invitation;
  }

  const auth: AuthService = {
    async signIn(rawEmail, password) {
      await network();
      const current = await load();
      const email = normalizeEmail(rawEmail);

      const seeded = findSeedAccount((account) => account.user.email === email);
      if (seeded && seeded.password === password) return issueToken(seeded.user);

      const activated = current.activated.find((account) => account.user.email === email);
      if (activated && activated.passwordHash === mockHash(password, email)) {
        return issueToken(activated.user);
      }
      // Mismo mensaje si el correo no existe o la contraseña está mal: no revela qué falló.
      throw new ServiceError('invalid_credentials');
    },

    async restore(token) {
      await network();
      const current = await load();
      const userId = TOKEN_PATTERN.exec(token)?.[1];
      const user = userId ? findUserById(current, userId) : undefined;
      if (!user) throw new ServiceError('session_expired');
      return user;
    },

    async signOut() {
      // TODO(backend): POST /api/auth/logout/ para revocar el token en el servidor.
      await network();
    },
  };

  const invitations: InvitationService = {
    async validate(rawCode) {
      await network();
      const { usedAt: _usedAt, ...preview } = checkInvitation(await load(), rawCode);
      return preview;
    },

    async activate(input: ActivationInput) {
      await network();
      const current = await load();
      const invitation = checkInvitation(current, input.code);
      if (emailExists(current, invitation.email)) throw new ServiceError('email_taken');

      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const user: AuthUser = {
        id: `pac-inv-${invitation.code.replace('-', '').toLowerCase()}`,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        initials: initialsOf(firstName, lastName),
        email: invitation.email,
        role: 'paciente',
      };
      await save({
        activated: [
          ...current.activated,
          {
            user,
            passwordHash: mockHash(input.password, invitation.email),
            ...(input.phone ? { phone: input.phone } : {}),
          },
        ],
        usedCodes: { ...current.usedCodes, [invitation.code]: now().toISOString() },
      });
      return issueToken(user);
    },
  };

  const patients: PatientDataService = {
    getDashboard(userId) {
      const seeded = findSeedAccount((account) => account.user.id === userId);
      if (seeded) return seeded.dashboard ?? emptyDashboard();
      if (state?.activated.some((account) => account.user.id === userId)) return emptyDashboard();
      // Sin datos del backend simulado (por ejemplo, en producción): datos de la maqueta.
      return demoDashboard;
    },
  };

  const dev: MockBackendDevTools = {
    description: () => seed.description,
    accounts: () => seed.accounts,
    async invitations() {
      const current = await load();
      return seed.invitations.map((invitation) => ({
        ...invitation,
        usedAt: invitation.usedAt ?? current.usedCodes[invitation.code] ?? null,
      }));
    },
    async reset() {
      const current = await load();
      const userIds = [
        ...seed.accounts.map((account) => account.user.id),
        ...current.activated.map((account) => account.user.id),
      ];
      await Promise.all(userIds.map((id) => store.removeItem(storageKeys.consent(id))));
      await save(emptyState());
    },
  };

  return { auth, invitations, patients, dev };
}
