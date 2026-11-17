import { storageKeys, type KeyValueStore } from '@/services/storage/keyValueStore';

import { CURRENT_CONSENT, type ConsentDocument } from './consentDocument';
import type { ConsentRecord, ConsentService } from './types';

type Options = {
  store: KeyValueStore;
  document?: ConsentDocument;
  now?: () => Date;
};

function parseRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentRecord>;
    if (typeof value.userId !== 'string' || typeof value.version !== 'string') return null;
    if (typeof value.acceptedAt !== 'string') return null;
    return {
      userId: value.userId,
      version: value.version,
      acceptedAt: value.acceptedAt,
      syncedAt: typeof value.syncedAt === 'string' ? value.syncedAt : null,
    };
  } catch {
    return null;
  }
}

/**
 * Guarda la aceptación en el teléfono, por usuario, con versión y fecha/hora.
 * TODO(backend): enviar a POST /api/consents/ cuando exista y marcar `syncedAt`.
 */
export function createLocalConsentService({
  store,
  document = CURRENT_CONSENT,
  now = () => new Date(),
}: Options): ConsentService {
  async function getRecord(userId: string) {
    return parseRecord(await store.getItem(storageKeys.consent(userId)));
  }

  return {
    current: document,
    getRecord,
    async hasAcceptedCurrent(userId) {
      const record = await getRecord(userId);
      return record?.version === document.version;
    },
    async accept(userId) {
      const record: ConsentRecord = {
        userId,
        version: document.version,
        acceptedAt: now().toISOString(),
        syncedAt: null,
      };
      await store.setItem(storageKeys.consent(userId), JSON.stringify(record));
      return record;
    },
  };
}
