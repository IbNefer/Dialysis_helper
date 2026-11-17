import { CURRENT_CONSENT } from '@/services/consent/consentDocument';
import { ServiceError } from '@/services/errors';
import { storageKeys } from '@/services/storage/keyValueStore';
import { createTestServices, fakeBiometrics, TEST_NOW } from '@/test-utils/renderApp';

import { BIOMETRIC_PROMPT, createSessionManager } from '../sessionManager';

const MARIA = { email: 'maria@ejemplo.com', password: 'demo1234' };

function setup(options: Parameters<typeof createTestServices>[0] = {}) {
  const services = createTestServices(options);
  return { services, manager: createSessionManager(services) };
}

describe('sessionManager · login por credenciales (MOV-RF-003)', () => {
  it('con credenciales correctas guarda el token y pide el consentimiento la primera vez', async () => {
    const { services, manager } = setup();
    const state = await manager.signIn(MARIA.email, MARIA.password);

    expect(state.status).toBe('needsConsent');
    expect(state.user?.email).toBe(MARIA.email);
    expect(await services.store.getItem(storageKeys.sessionToken)).toMatch(/^mock\.pac-001\./);
  });

  it('acepta el correo con mayúsculas y espacios', async () => {
    const { manager } = setup();
    const state = await manager.signIn('  Maria@Ejemplo.com ', MARIA.password);
    expect(state.user?.id).toBe('pac-001');
  });

  it('con contraseña incorrecta o correo desconocido da el mismo error y no guarda token', async () => {
    const { services, manager } = setup();
    await expect(manager.signIn(MARIA.email, 'otra')).rejects.toMatchObject({
      code: 'invalid_credentials',
    });
    await expect(manager.signIn('nadie@ejemplo.com', 'demo1234')).rejects.toMatchObject({
      code: 'invalid_credentials',
    });
    expect(await services.store.getItem(storageKeys.sessionToken)).toBeNull();
  });

  it('si ya aceptó el consentimiento entra directo', async () => {
    const { services, manager } = setup();
    await services.consent.accept('pac-001');
    expect((await manager.signIn(MARIA.email, MARIA.password)).status).toBe('signedIn');
  });
});

describe('sessionManager · mantener la sesión al reabrir', () => {
  it('sin token guardado queda sin sesión', async () => {
    expect((await setup().manager.restore()).status).toBe('signedOut');
  });

  it('restaura la sesión guardada en otra "apertura" de la app', async () => {
    const { services, manager } = setup();
    await manager.signIn(MARIA.email, MARIA.password);
    await manager.acceptConsent(
      await services.auth.restore((await services.store.getItem(storageKeys.sessionToken)) ?? ''),
    );

    // Nueva instancia sobre el mismo almacenamiento = la app se volvió a abrir.
    const reopened = createSessionManager(createTestServices({ store: services.store }));
    const state = await reopened.restore();
    expect(state).toEqual({ status: 'signedIn', user: expect.objectContaining({ id: 'pac-001' }) });
  });

  it('si al reabrir no había aceptado el consentimiento, vuelve al consentimiento', async () => {
    const { services, manager } = setup();
    await manager.signIn(MARIA.email, MARIA.password);
    const reopened = createSessionManager(createTestServices({ store: services.store }));
    expect((await reopened.restore()).status).toBe('needsConsent');
  });

  it('un token vencido se borra y queda sin sesión', async () => {
    const { services, manager } = setup();
    await services.store.setItem(storageKeys.sessionToken, 'mock.pac-999.abc');
    expect((await manager.restore()).status).toBe('signedOut');
    expect(await services.store.getItem(storageKeys.sessionToken)).toBeNull();
  });

  it('cerrar sesión borra el token aunque el servidor falle', async () => {
    const { services, manager } = setup();
    await manager.signIn(MARIA.email, MARIA.password);
    services.auth.signOut = jest.fn().mockRejectedValue(new ServiceError('network'));
    expect(await manager.signOut()).toEqual({ status: 'signedOut', user: null });
    expect(await services.store.getItem(storageKeys.sessionToken)).toBeNull();
    expect((await manager.restore()).status).toBe('signedOut');
  });
});

describe('sessionManager · Face ID o huella', () => {
  it('después de un login con contraseña, entra con biometría aunque haya cerrado sesión', async () => {
    const biometrics = fakeBiometrics('available', true);
    const { manager } = setup({ biometrics });
    await manager.signIn(MARIA.email, MARIA.password);
    await manager.signOut();

    const state = await manager.signInWithBiometrics();
    expect(biometrics.authenticate).toHaveBeenCalledWith(BIOMETRIC_PROMPT);
    expect(state.user?.id).toBe('pac-001');
  });

  it.each([
    ['no_hardware', 'biometrics_unavailable'],
    ['not_enrolled', 'biometrics_not_enrolled'],
  ] as const)('si el teléfono está en %s falla con %s', async (availability, code) => {
    const { manager } = setup({ biometrics: fakeBiometrics(availability) });
    await expect(manager.signInWithBiometrics()).rejects.toMatchObject({ code });
  });

  it('sin un login previo pide entrar primero con contraseña', async () => {
    const { manager } = setup();
    await expect(manager.signInWithBiometrics()).rejects.toMatchObject({
      code: 'biometrics_no_credential',
    });
  });

  it('si la persona cancela no entra', async () => {
    const { manager } = setup({ biometrics: fakeBiometrics('available', false) });
    await manager.signIn(MARIA.email, MARIA.password);
    await manager.signOut();
    await expect(manager.signInWithBiometrics()).rejects.toMatchObject({
      code: 'biometrics_cancelled',
    });
  });
});

describe('sessionManager · consentimiento (MOV-RF-002)', () => {
  it('guarda la aceptación con versión, fecha y hora, solo en el teléfono', async () => {
    const { services, manager } = setup();
    const { user } = await manager.signIn(MARIA.email, MARIA.password);
    if (!user) throw new Error('sin usuario');

    expect(await manager.acceptConsent(user)).toEqual({ status: 'signedIn', user });
    expect(await services.consent.getRecord(user.id)).toEqual({
      userId: 'pac-001',
      version: CURRENT_CONSENT.version,
      acceptedAt: TEST_NOW.toISOString(),
      syncedAt: null,
    });
  });

  it('una aceptación de otra versión no cuenta', async () => {
    const { services, manager } = setup();
    await services.store.setItem(
      storageKeys.consent('pac-001'),
      JSON.stringify({ userId: 'pac-001', version: '0.9', acceptedAt: '2026-01-01T00:00:00Z' }),
    );
    expect(await services.consent.hasAcceptedCurrent('pac-001')).toBe(false);
    expect((await manager.signIn(MARIA.email, MARIA.password)).status).toBe('needsConsent');
  });

  it('un registro dañado se trata como no aceptado', async () => {
    const { services } = setup();
    await services.store.setItem(storageKeys.consent('pac-001'), '{no es json');
    expect(await services.consent.getRecord('pac-001')).toBeNull();
  });

  it('el consentimiento es por usuario', async () => {
    const { services } = setup();
    await services.consent.accept('pac-001');
    expect(await services.consent.hasAcceptedCurrent('pac-002')).toBe(false);
  });
});
