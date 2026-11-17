export type UserRole = 'paciente' | 'cuidador';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  role: UserRole;
};

export type AuthSession = {
  /** Token opaco que se guarda en el almacenamiento seguro. */
  token: string;
  user: AuthUser;
};

/**
 * Autenticación por credenciales (MOV-RF-003).
 *
 * PENDIENTE EN EL BACKEND: hoy solo existe /api/health/. Contrato propuesto:
 * - POST /api/auth/login/   { email, password }  → 200 { token, user } · 401 credenciales inválidas
 * - GET  /api/auth/me/      Authorization: Token → 200 user · 401 sesión vencida
 * - POST /api/auth/logout/  Authorization: Token → 204
 */
export interface AuthService {
  signIn(email: string, password: string): Promise<AuthSession>;
  /** Comprueba un token guardado y devuelve su usuario. Falla con `session_expired`. */
  restore(token: string): Promise<AuthUser>;
  signOut(token: string): Promise<void>;
}

/** "María Rodríguez" → "MR". */
export function initialsOf(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}
