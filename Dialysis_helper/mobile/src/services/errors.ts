/** Errores esperados de los servicios. La pantalla muestra `userMessage(error)`. */
export type ServiceErrorCode =
  | 'invalid_credentials'
  | 'session_expired'
  | 'invitation_invalid'
  | 'invitation_expired'
  | 'invitation_used'
  | 'email_taken'
  | 'biometrics_unavailable'
  | 'biometrics_not_enrolled'
  | 'biometrics_no_credential'
  | 'biometrics_cancelled'
  | 'network'
  | 'unknown';

export const serviceErrorMessages: Record<ServiceErrorCode, string> = {
  invalid_credentials:
    'El correo o la contraseña no son correctos. Revísalos e inténtalo de nuevo.',
  session_expired: 'Tu sesión terminó. Vuelve a iniciar sesión.',
  invitation_invalid:
    'No encontramos ese código. Revisa que esté bien escrito o pídele uno nuevo a tu doctor.',
  invitation_expired: 'Este código ya venció. Pídele a tu doctor una invitación nueva.',
  invitation_used:
    'Este código ya se usó para activar una cuenta. Si es tuya, inicia sesión con tu correo.',
  email_taken: 'Ya existe una cuenta con este correo. Inicia sesión con tu contraseña.',
  biometrics_unavailable:
    'Este teléfono no tiene Face ID ni huella. Entra con tu correo y contraseña.',
  biometrics_not_enrolled:
    'Tu teléfono no tiene Face ID ni huella configurados. Entra con tu correo y contraseña.',
  biometrics_no_credential:
    'Primero entra una vez con tu correo y contraseña. Después podrás usar Face ID o huella.',
  biometrics_cancelled: 'No se pudo confirmar tu identidad. Inténtalo de nuevo.',
  network: 'No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.',
  unknown: 'Algo salió mal. Inténtalo de nuevo en un momento.',
};

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string = serviceErrorMessages[code]) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export function isServiceError(error: unknown, code?: ServiceErrorCode): error is ServiceError {
  return error instanceof ServiceError && (code === undefined || error.code === code);
}

/** Mensaje para mostrar en pantalla, sin detalles técnicos. */
export function userMessage(error: unknown): string {
  return isServiceError(error) ? error.message : serviceErrorMessages.unknown;
}
