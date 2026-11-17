import type { AppServices } from '@/services';
import type { AuthSession, AuthUser } from '@/services/auth/types';
import { isServiceError, ServiceError } from '@/services/errors';
import type { ActivationInput } from '@/services/invitations/types';
import { storageKeys } from '@/services/storage/keyValueStore';

/**
 * Estados de la sesión:
 * - restoring: al abrir la app, mientras se lee el token guardado.
 * - signedOut: sin sesión → Login.
 * - needsConsent: con sesión pero sin aceptar el consentimiento vigente → solo Consentimiento.
 * - signedIn: con sesión y consentimiento → la app.
 */
export type SessionStatus = 'restoring' | 'signedOut' | 'needsConsent' | 'signedIn';

export type SessionState = { status: SessionStatus; user: AuthUser | null };

export const signedOutState: SessionState = { status: 'signedOut', user: null };

export const BIOMETRIC_PROMPT = 'Confirma que eres tú para entrar a DP-Hogar';

type SessionDeps = Pick<AppServices, 'store' | 'auth' | 'invitations' | 'consent' | 'biometrics'>;

export type SessionManager = ReturnType<typeof createSessionManager>;

export function createSessionManager({
  store,
  auth,
  invitations,
  consent,
  biometrics,
}: SessionDeps) {
  /** Decide a dónde va el usuario: el consentimiento es obligatorio antes de entrar. */
  async function stateFor(user: AuthUser): Promise<SessionState> {
    const accepted = await consent.hasAcceptedCurrent(user.id);
    return { status: accepted ? 'signedIn' : 'needsConsent', user };
  }

  async function enter({ token, user }: AuthSession): Promise<SessionState> {
    await store.setItem(storageKeys.sessionToken, token);
    // Recuerda la cuenta en este teléfono para poder entrar con Face ID o huella.
    // TODO(backend): usar un refresh token propio y dejar que la persona lo desactive en Ajustes.
    await store.setItem(storageKeys.biometricToken, token);
    return stateFor(user);
  }

  return {
    /** Al abrir la app: mantiene la sesión si el token guardado sigue siendo válido. */
    async restore(): Promise<SessionState> {
      const token = await store.getItem(storageKeys.sessionToken);
      if (!token) return signedOutState;
      try {
        return await stateFor(await auth.restore(token));
      } catch (error) {
        if (isServiceError(error, 'session_expired')) {
          await store.removeItem(storageKeys.sessionToken);
        }
        return signedOutState;
      }
    },

    async signIn(email: string, password: string): Promise<SessionState> {
      return enter(await auth.signIn(email, password));
    },

    async signInWithBiometrics(): Promise<SessionState> {
      const availability = await biometrics.getAvailability();
      if (availability === 'no_hardware') throw new ServiceError('biometrics_unavailable');
      if (availability === 'not_enrolled') throw new ServiceError('biometrics_not_enrolled');

      const token = await store.getItem(storageKeys.biometricToken);
      if (!token) throw new ServiceError('biometrics_no_credential');
      if (!(await biometrics.authenticate(BIOMETRIC_PROMPT))) {
        throw new ServiceError('biometrics_cancelled');
      }

      try {
        const user = await auth.restore(token);
        return await enter({ token, user });
      } catch (error) {
        if (isServiceError(error, 'session_expired')) {
          await store.removeItem(storageKeys.biometricToken);
          throw new ServiceError('biometrics_no_credential');
        }
        throw error;
      }
    },

    /** Activa la cuenta con la invitación y deja la sesión abierta, pendiente del consentimiento. */
    async activate(input: ActivationInput): Promise<SessionState> {
      return enter(await invitations.activate(input));
    },

    async acceptConsent(user: AuthUser): Promise<SessionState> {
      await consent.accept(user.id);
      return { status: 'signedIn', user };
    },

    async signOut(): Promise<SessionState> {
      const token = await store.getItem(storageKeys.sessionToken);
      await store.removeItem(storageKeys.sessionToken);
      if (token) {
        // Cerrar sesión en el teléfono no debe depender de que haya conexión.
        await auth.signOut(token).catch(() => undefined);
      }
      return signedOutState;
    },
  };
}
