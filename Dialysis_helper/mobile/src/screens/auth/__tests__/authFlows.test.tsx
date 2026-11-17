import { fireEvent, screen } from '@testing-library/react-native';

import { DEMO_INVITATION_CODES } from '@/dev/synthetic';
import { createTestServices, fakeBiometrics, renderApp } from '@/test-utils/renderApp';

async function typeCredentials(email: string, password: string) {
  await fireEvent.changeText(await screen.findByTestId('login-email'), email);
  await fireEvent.changeText(screen.getByTestId('login-password'), password);
}

/** Simula medir el documento y desplazarse hasta `offset`. */
async function scrollConsentTo(offset: number) {
  const scroll = screen.getByTestId('consent-scroll');
  await fireEvent(scroll, 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 700 } },
  });
  await fireEvent(screen.getByTestId('consent-document'), 'layout', {
    nativeEvent: { layout: { x: 20, y: 200, width: 350, height: 1800 } },
  });
  await fireEvent.scroll(scroll, {
    nativeEvent: {
      contentOffset: { x: 0, y: offset },
      layoutMeasurement: { width: 390, height: 700 },
      contentSize: { width: 390, height: 2400 },
    },
  });
}

async function acceptConsent() {
  await screen.findByTestId('consent-screen');
  await scrollConsentTo(1400);
  await fireEvent.press(screen.getByTestId('consent-checkbox'));
  await fireEvent.press(screen.getByTestId('consent-accept'));
}

describe('MOV-RF-003 · login por credenciales', () => {
  it('se parece al prototipo: título, subtítulo, botones, enlace y aviso de emergencia', async () => {
    await renderApp();
    expect(await screen.findByRole('header', { name: 'DP-Hogar' })).toBeOnTheScreen();
    expect(
      screen.getByText('Tu diálisis en casa, acompañada por tu equipo de salud.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Entrar con Face ID o huella' })).toBeOnTheScreen();
    expect(
      screen.getByRole('link', { name: 'Tengo una invitación de mi doctor' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Esta app no sustituye la atención de urgencia. En una emergencia llama al 911.',
      ),
    ).toBeOnTheScreen();
  });

  it('valida el formulario antes de llamar al servicio', async () => {
    const services = createTestServices();
    const signIn = jest.spyOn(services.auth, 'signIn');
    await renderApp({ services });

    await fireEvent.press(await screen.findByTestId('login-submit'));
    expect(screen.getByText('Escribe tu correo electrónico.')).toBeOnTheScreen();
    expect(screen.getByText('Escribe tu contraseña.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'maria@ejemplo');
    expect(screen.getByTestId('login-email-error')).toHaveTextContent(/nombre@ejemplo\.com/);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('con credenciales incorrectas muestra un error claro y sigue en el login', async () => {
    await renderApp();
    await typeCredentials('maria@ejemplo.com', 'equivocada');
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      /El correo o la contraseña no son correctos/,
    );
    expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
  });

  it('con credenciales correctas pasa por el consentimiento y entra a Inicio', async () => {
    await renderApp();
    await typeCredentials('maria@ejemplo.com', 'demo1234');
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('consent-screen')).toBeOnTheScreen();
    await acceptConsent();
    expect(await screen.findByText('Buenos días, María')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Inicio' })).toBeSelected();
  });

  it('con una cuenta sintética muestra los datos de ese paciente', async () => {
    const services = createTestServices();
    const patient = services.mock?.accounts()[2];
    if (!patient) throw new Error('falta el paciente sintético');
    await services.consent.accept(patient.user.id);
    await renderApp({ services });

    await typeCredentials(patient.user.email, patient.password);
    await fireEvent.press(screen.getByTestId('login-submit'));

    expect(await screen.findByText(`Buenos días, ${patient.user.firstName}`)).toBeOnTheScreen();
    const count = patient.dashboard?.exchanges;
    expect(screen.getByText(`${count?.done} de ${count?.total} intercambios`)).toBeOnTheScreen();
  });

  it('Face ID o huella sin un login previo explica qué hacer', async () => {
    await renderApp({ services: createTestServices({ biometrics: fakeBiometrics('available') }) });
    await fireEvent.press(await screen.findByTestId('login-biometrics'));
    expect(await screen.findByTestId('login-error')).toHaveTextContent(
      /Primero entra una vez con tu correo y contraseña/,
    );
  });
});

describe('MOV-RF-002 · consentimiento informado', () => {
  async function loginToConsent() {
    await renderApp();
    await typeCredentials('maria@ejemplo.com', 'demo1234');
    await fireEvent.press(screen.getByTestId('login-submit'));
    await screen.findByTestId('consent-screen');
  }

  it('"Acepto" solo se habilita tras leer hasta el final y marcar la casilla', async () => {
    await loginToConsent();
    expect(screen.getByText('Versión 1.0 · 17 de noviembre de 2026')).toBeOnTheScreen();
    expect(screen.getByTestId('consent-accept')).toBeDisabled();
    expect(screen.getByTestId('consent-checkbox')).toBeDisabled();

    await scrollConsentTo(300); // todavía no llega al final
    expect(screen.getByTestId('consent-checkbox')).toBeDisabled();
    expect(screen.getByTestId('consent-read-hint')).toBeOnTheScreen();

    await scrollConsentTo(1400);
    expect(screen.queryByTestId('consent-read-hint')).toBeNull();
    expect(screen.getByTestId('consent-checkbox')).toBeEnabled();
    expect(screen.getByTestId('consent-accept')).toBeDisabled();

    await fireEvent.press(screen.getByTestId('consent-checkbox'));
    expect(screen.getByTestId('consent-checkbox')).toBeChecked();
    expect(screen.getByTestId('consent-accept')).toBeEnabled();
  });

  it('"No acepto" explica por qué y vuelve al login sin entrar', async () => {
    await loginToConsent();
    await fireEvent.press(screen.getByTestId('consent-decline'));
    expect(screen.getByText('Sin tu consentimiento no puedes usar la app')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Salir sin aceptar' }));
    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('home-screen')).toBeNull();
  });

  it('"Volver a leer" cierra el aviso y sigue en el consentimiento', async () => {
    await loginToConsent();
    await fireEvent.press(screen.getByTestId('consent-decline'));
    await fireEvent.press(screen.getByRole('button', { name: 'Volver a leer' }));
    expect(screen.getByTestId('consent-screen')).toBeOnTheScreen();
  });
});

describe('MOV-RF-001 · activación por invitación', () => {
  async function openInvitation() {
    await renderApp();
    await fireEvent.press(
      await screen.findByRole('link', { name: 'Tengo una invitación de mi doctor' }),
    );
    expect(screen.getByTestId('invitation-code-screen')).toBeOnTheScreen();
  }

  async function submitCode(code: string) {
    await fireEvent.changeText(screen.getByTestId('invitation-code'), code);
    await fireEvent.press(screen.getByTestId('invitation-validate'));
  }

  it('código con formato inválido', async () => {
    await openInvitation();
    await submitCode('ABC');
    expect(screen.getByTestId('invitation-code-error')).toHaveTextContent(/8 letras o números/);
  });

  it('código que no existe', async () => {
    await openInvitation();
    await submitCode('ZZZZ-9999');
    expect(await screen.findByTestId('invitation-code-error')).toHaveTextContent(
      /No encontramos ese código/,
    );
  });

  it('código vencido', async () => {
    await openInvitation();
    await submitCode(DEMO_INVITATION_CODES.expired);
    expect(await screen.findByTestId('invitation-code-notice')).toHaveTextContent(
      /Código vencido\..*venció/,
    );
  });

  it('código ya usado sugiere iniciar sesión', async () => {
    await openInvitation();
    await submitCode(DEMO_INVITATION_CODES.used);
    expect(await screen.findByTestId('invitation-code-notice')).toHaveTextContent(/ya se usó/);
    await fireEvent.press(screen.getByRole('link', { name: 'Ya tengo cuenta, iniciar sesión' }));
    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
  });

  it('código válido → datos y contraseña con requisitos → consentimiento → Inicio', async () => {
    await openInvitation();
    await submitCode('demo2026');
    expect(await screen.findByTestId('invitation-account-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('invitation-email')).toHaveTextContent(/@ejemplo\.com/);

    // Requisitos visibles mientras escribe
    await fireEvent.changeText(screen.getByTestId('activation-password'), 'abc');
    expect(screen.getByTestId('password-rules-length').props.accessibilityLabel).toBe(
      'Al menos 8 caracteres: pendiente',
    );
    expect(screen.getByTestId('password-rules-letter').props.accessibilityLabel).toBe(
      'Al menos una letra: cumplido',
    );

    // Errores claros al intentar activar
    await fireEvent.changeText(screen.getByTestId('activation-confirm'), 'abd');
    await fireEvent.press(screen.getByTestId('activation-submit'));
    expect(screen.getByTestId('activation-password-error')).toHaveTextContent(/requisitos/);
    expect(screen.getByTestId('activation-confirm-error')).toHaveTextContent(
      'Las contraseñas no coinciden.',
    );

    await fireEvent.changeText(screen.getByTestId('activation-password'), 'clave2026');
    await fireEvent.changeText(screen.getByTestId('activation-confirm'), 'clave2026');
    expect(screen.getByTestId('password-match-match').props.accessibilityLabel).toBe(
      'Las dos contraseñas coinciden: cumplido',
    );
    await fireEvent.press(screen.getByTestId('activation-submit'));

    // La cuenta queda activada y pasa al consentimiento antes de entrar.
    expect(await screen.findByTestId('consent-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('floating-tab-bar')).toBeNull();
    await acceptConsent();
    expect(await screen.findByTestId('home-screen')).toBeOnTheScreen();
    expect(screen.getByText('Aún no hay registros de peso. Aparecerán aquí.')).toBeOnTheScreen();
  });
});
