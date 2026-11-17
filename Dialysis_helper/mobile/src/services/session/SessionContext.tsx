import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getDefaultServices, type AppServices } from '@/services';
import type { AuthUser } from '@/services/auth/types';
import type { ActivationInput } from '@/services/invitations/types';

import {
  createSessionManager,
  signedOutState,
  type SessionState,
  type SessionStatus,
} from './sessionManager';

export type SessionUser = AuthUser;
export type { SessionStatus };

type SessionContextValue = {
  status: SessionStatus;
  user: SessionUser | null;
  /** true solo con sesión y consentimiento aceptado. */
  isSignedIn: boolean;
  services: AppServices;
  /** MOV-RF-003. Devuelve el estado al que llegó (signedIn o needsConsent). Lanza ServiceError. */
  signIn: (email: string, password: string) => Promise<SessionStatus>;
  signInWithBiometrics: () => Promise<SessionStatus>;
  /** MOV-RF-001. Activa la cuenta; luego toca el consentimiento. */
  activateInvitation: (input: ActivationInput) => Promise<SessionStatus>;
  /** MOV-RF-002. Guarda la aceptación con fecha, hora y versión. */
  acceptConsent: () => Promise<void>;
  /** "No acepto": cierra la sesión sin entrar a la app. */
  declineConsent: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
  /** Arranca con sesión y consentimiento ya aceptado (catálogo, pruebas). */
  initialUser?: SessionUser | null;
  /** Servicios a usar; por defecto los de la app. Las pruebas pasan unos en memoria. */
  services?: AppServices;
};

export function SessionProvider({ children, initialUser = null, services }: SessionProviderProps) {
  const resolvedServices = useMemo(() => services ?? getDefaultServices(), [services]);
  const manager = useMemo(() => createSessionManager(resolvedServices), [resolvedServices]);
  const [state, setState] = useState<SessionState>(
    initialUser ? { status: 'signedIn', user: initialUser } : { status: 'restoring', user: null },
  );

  useEffect(() => {
    if (initialUser) return;
    let active = true;
    manager.restore().then(
      (restored) => active && setState(restored),
      () => active && setState(signedOutState),
    );
    return () => {
      active = false;
    };
    // Solo al montar: restaurar la sesión guardada una vez al abrir la app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager]);

  const apply = useCallback(async (next: Promise<SessionState>) => {
    const resolved = await next;
    setState(resolved);
    return resolved.status;
  }, []);

  const signIn = useCallback(
    (email: string, password: string) => apply(manager.signIn(email, password)),
    [apply, manager],
  );
  const signInWithBiometrics = useCallback(
    () => apply(manager.signInWithBiometrics()),
    [apply, manager],
  );
  const activateInvitation = useCallback(
    (input: ActivationInput) => apply(manager.activate(input)),
    [apply, manager],
  );
  const acceptConsent = useCallback(async () => {
    if (!state.user) return;
    await apply(manager.acceptConsent(state.user));
  }, [apply, manager, state.user]);
  const signOut = useCallback(async () => {
    await apply(manager.signOut());
  }, [apply, manager]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status: state.status,
      user: state.user,
      isSignedIn: state.status === 'signedIn',
      services: resolvedServices,
      signIn,
      signInWithBiometrics,
      activateInvitation,
      acceptConsent,
      declineConsent: signOut,
      signOut,
    }),
    [
      state,
      resolvedServices,
      signIn,
      signInWithBiometrics,
      activateInvitation,
      acceptConsent,
      signOut,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return context;
}
