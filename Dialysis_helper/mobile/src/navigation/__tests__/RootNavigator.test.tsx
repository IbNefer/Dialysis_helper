import { fireEvent, screen } from '@testing-library/react-native';

import { mockPatient } from '@/constants/mockData';
import { storageKeys } from '@/services/storage/keyValueStore';
import { createTestServices, renderApp } from '@/test-utils/renderApp';

describe('RootNavigator', () => {
  it('sin sesión muestra el flujo de acceso y no la barra de pestañas', async () => {
    await renderApp();
    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('floating-tab-bar')).toBeNull();
  });

  it('con sesión muestra las 4 pestañas', async () => {
    await renderApp({ initialUser: mockPatient });
    for (const name of ['Inicio', 'Registrar', 'Alertas', 'Perfil']) {
      expect(screen.getByRole('tab', { name })).toBeOnTheScreen();
    }
    expect(screen.getByRole('tab', { name: 'Inicio' })).toBeSelected();
  });

  it('cambia de pestaña', async () => {
    await renderApp({ initialUser: mockPatient });
    await fireEvent.press(screen.getByRole('tab', { name: 'Alertas' }));
    expect(screen.getByRole('tab', { name: 'Alertas' })).toBeSelected();
  });

  it('con sesión guardada pero sin consentimiento solo muestra el consentimiento', async () => {
    const services = createTestServices();
    const { token } = await services.auth.signIn('maria@ejemplo.com', 'demo1234');
    await services.store.setItem(storageKeys.sessionToken, token);

    await renderApp({ services });
    expect(await screen.findByTestId('consent-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('floating-tab-bar')).toBeNull();
    expect(screen.queryByTestId('home-screen')).toBeNull();
  });
});
