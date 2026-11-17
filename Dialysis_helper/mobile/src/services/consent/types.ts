import type { ConsentDocument } from './consentDocument';

export type ConsentRecord = {
  userId: string;
  /** Versión del documento aceptado. */
  version: string;
  /** Fecha y hora de la aceptación en ISO 8601 (UTC). */
  acceptedAt: string;
  /** Cuándo se envió al backend; null mientras solo está guardado en el teléfono. */
  syncedAt: string | null;
};

/**
 * Consentimiento informado (MOV-RF-002).
 *
 * PENDIENTE EN EL BACKEND: no hay endpoint. Hoy la aceptación se guarda solo en el teléfono
 * (almacenamiento seguro). Contrato propuesto:
 * - GET  /api/consents/current/  → 200 { version, accepted, acceptedAt }
 * - POST /api/consents/          { version, acceptedAt } → 201 ConsentRecord
 */
export interface ConsentService {
  readonly current: ConsentDocument;
  getRecord(userId: string): Promise<ConsentRecord | null>;
  /** true solo si aceptó la versión vigente. */
  hasAcceptedCurrent(userId: string): Promise<boolean>;
  accept(userId: string): Promise<ConsentRecord>;
}
