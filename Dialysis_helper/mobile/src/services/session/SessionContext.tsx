import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { mockPatient } from '@/constants/mockData';

export type SessionUser = {
  firstName: string;
  fullName: string;
  initials: string;
  email: string;
  role: 'paciente' | 'cuidador';
};

type SessionContextValue = {
  user: SessionUser | null;
  isSignedIn: boolean;
  /** Inicio de sesión SIMULADO: acepta cualquier dato y entra con el paciente ficticio. */
  signIn: () => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/** Retraso para que se vea el estado de carga del botón. */
export const FAKE_SIGN_IN_DELAY_MS = 600;

type SessionProviderProps = {
  children: ReactNode;
  /** Permite arrancar con sesión (catálogo, pruebas). */
  initialUser?: SessionUser | null;
};

export function SessionProvider({ children, initialUser = null }: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  const signIn = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, FAKE_SIGN_IN_DELAY_MS));
    setUser(mockPatient);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, isSignedIn: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return context;
}
