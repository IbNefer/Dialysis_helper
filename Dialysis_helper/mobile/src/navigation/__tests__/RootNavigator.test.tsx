import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { mockPatient } from '@/constants/mockData';
import { SessionProvider, type SessionUser } from '@/services/session/SessionContext';

import { RootNavigator } from '../RootNavigator';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderApp(initialUser: SessionUser | null = null) {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SessionProvider initialUser={initialUser}>
        <RootNavigator />
      </SessionProvider>
    </SafeAreaProvider>,
  );
}

describe('RootNavigator', () => {
  it('sin sesión muestra el flujo de acceso y no la barra de pestañas', async () => {
    await renderApp();
    expect(screen.queryByTestId('floating-tab-bar')).toBeNull();
  });

  it('con sesión muestra las 4 pestañas', async () => {
    await renderApp(mockPatient);
    for (const name of ['Inicio', 'Registrar', 'Alertas', 'Perfil']) {
      expect(screen.getByRole('tab', { name })).toBeOnTheScreen();
    }
    expect(screen.getByRole('tab', { name: 'Inicio' })).toBeSelected();
  });

  it('cambia de pestaña', async () => {
    await renderApp(mockPatient);
    await fireEvent.press(screen.getByRole('tab', { name: 'Alertas' }));
    expect(screen.getByRole('tab', { name: 'Alertas' })).toBeSelected();
  });
});
