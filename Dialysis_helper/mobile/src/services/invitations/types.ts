import type { AuthSession } from '@/services/auth/types';

/** Lo que el doctor dejó cargado al crear la invitación. */
export type InvitationPreview = {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Quién invita, por ejemplo "Dra. Carmen Ortiz". */
  invitedBy: string;
  clinic: string;
  /** Fecha de vencimiento en ISO 8601. */
  expiresAt: string;
};

export type ActivationInput = {
  code: string;
  firstName: string;
  lastName: string;
  /** Opcional, solo dígitos. */
  phone?: string;
  password: string;
};

/**
 * Activación de cuenta por invitación (MOV-RF-001).
 *
 * PENDIENTE EN EL BACKEND. Contrato propuesto:
 * - POST /api/invitations/validate/  { code } → 200 InvitationPreview
 *     404 invitation_invalid · 410 invitation_expired · 409 invitation_used
 * - POST /api/invitations/activate/  ActivationInput → 201 { token, user }
 *     mismos errores que validate · 409 email_taken
 */
export interface InvitationService {
  validate(code: string): Promise<InvitationPreview>;
  activate(input: ActivationInput): Promise<AuthSession>;
}
