import { demoDashboard } from '@/constants/demoPatient';
import { DEMO_INVITATION_CODES } from '@/dev/synthetic';
import { createSessionManager } from '@/services/session/sessionManager';
import { createMemoryStore, storageKeys } from '@/services/storage/keyValueStore';
import { createTestServices } from '@/test-utils/renderApp';

describe('invitaciones del backend simulado (MOV-RF-001)', () => {
  it('un código válido devuelve los datos que cargó el doctor (con o sin guion)', async () => {
    const { invitations } = createTestServices();
    const preview = await invitations.validate('demo2026');
    expect(preview).toMatchObject({ code: DEMO_INVITATION_CODES.valid });
    expect(preview.email).toMatch(/@ejemplo\.com$/);
    expect(preview).not.toHaveProperty('usedAt');
  });

  it.each([
    ['ZZZZ-9999', 'invitation_invalid'],
    [DEMO_INVITATION_CODES.expired, 'invitation_expired'],
    [DEMO_INVITATION_CODES.used, 'invitation_used'],
  ])('%s falla con %s', async (code, errorCode) => {
    const { invitations } = createTestServices();
    await expect(invitations.validate(code)).rejects.toMatchObject({ code: errorCode });
  });

  it('activar crea la cuenta, marca el código como usado y permite iniciar sesión', async () => {
    const store = createMemoryStore();
    const services = createTestServices({ store });
    const preview = await services.invitations.validate(DEMO_INVITATION_CODES.valid);
    const session = await services.invitations.activate({
      code: DEMO_INVITATION_CODES.valid,
      firstName: ' Rosa ',
      lastName: 'Almonte Peña',
      password: 'clave2026',
    });

    expect(session.user).toMatchObject({
      fullName: 'Rosa Almonte Peña',
      initials: 'RA',
      email: preview.email,
      role: 'paciente',
    });
    await expect(services.invitations.validate(DEMO_INVITATION_CODES.valid)).rejects.toMatchObject({
      code: 'invitation_used',
    });

    // Al reabrir la app (mismo almacenamiento) la cuenta sigue existiendo.
    const reopened = createTestServices({ store });
    await expect(reopened.auth.signIn(preview.email, 'clave2026')).resolves.toMatchObject({
      user: { id: session.user.id },
    });
    await expect(reopened.auth.signIn(preview.email, 'otra1234')).rejects.toMatchObject({
      code: 'invalid_credentials',
    });
    // La contraseña no se guarda en claro.
    expect(await store.getItem(storageKeys.mockState)).not.toContain('clave2026');
  });

  it('una cuenta recién activada no tiene registros', async () => {
    const services = createTestServices();
    const { user } = await services.invitations.activate({
      code: DEMO_INVITATION_CODES.valid,
      firstName: 'Rosa',
      lastName: 'Almonte',
      password: 'clave2026',
    });
    const dashboard = services.patients.getDashboard(user.id);
    expect(dashboard.weight.todayKg).toBeNull();
    expect(dashboard.alerts).toEqual([]);
  });

  it('activar lleva al consentimiento antes de entrar', async () => {
    const services = createTestServices();
    const state = await createSessionManager(services).activate({
      code: DEMO_INVITATION_CODES.valid,
      firstName: 'Rosa',
      lastName: 'Almonte',
      password: 'clave2026',
    });
    expect(state.status).toBe('needsConsent');
  });

  it('reiniciar la demo libera el código y borra los consentimientos', async () => {
    const services = createTestServices();
    const { user } = await services.invitations.activate({
      code: DEMO_INVITATION_CODES.valid,
      firstName: 'Rosa',
      lastName: 'Almonte',
      password: 'clave2026',
    });
    await services.consent.accept(user.id);
    await services.consent.accept('pac-001');

    await services.mock?.reset();
    await expect(services.invitations.validate(DEMO_INVITATION_CODES.valid)).resolves.toBeTruthy();
    expect(await services.consent.hasAcceptedCurrent('pac-001')).toBe(false);
    expect(await services.consent.hasAcceptedCurrent(user.id)).toBe(false);
  });

  it('la lista de desarrollo muestra el código como usado, también al reabrir la app', async () => {
    const store = createMemoryStore();
    const services = createTestServices({ store });
    await services.invitations.activate({
      code: DEMO_INVITATION_CODES.valid,
      firstName: 'Rosa',
      lastName: 'Almonte',
      password: 'clave2026',
    });

    // Otra "apertura": sin sesión, nada más ha leído el estado guardado.
    const reopened = createTestServices({ store });
    const usedAt = async () =>
      (await reopened.mock?.invitations())?.find((i) => i.code === DEMO_INVITATION_CODES.valid)
        ?.usedAt;
    expect(await usedAt()).not.toBeNull();

    await reopened.mock?.reset();
    expect(await usedAt()).toBeNull();
  });
});

describe('datos del paciente', () => {
  it('cada paciente sintético tiene su propio resumen', () => {
    const services = createTestServices();
    const accounts = services.mock?.accounts() ?? [];
    expect(services.patients.getDashboard('pac-001')).toEqual(demoDashboard);
    expect(services.patients.getDashboard(accounts[1]?.user.id ?? '')).toEqual(
      accounts[1]?.dashboard,
    );
  });
});
