import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { mockPatient } from '@/constants/mockData';
import { RootNavigator } from '@/navigation/RootNavigator';
import { SessionProvider, type SessionUser } from '@/services/session/SessionContext';

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

describe('flujos de las pantallas maquetadas', () => {
  it('Login: "Iniciar sesión" activa la sesión falsa y abre Inicio', async () => {
    await renderApp();
    expect(screen.getByText('Esta app no sustituye', { exact: false })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('Buenos días, María', {}, { timeout: 2000 })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Inicio' })).toBeSelected();
  });

  it('Login: el enlace de invitación abre el placeholder de M1', async () => {
    await renderApp();
    await fireEvent.press(screen.getByRole('link', { name: 'Tengo una invitación de mi doctor' }));
    expect(screen.getByText('Registro por invitación')).toBeOnTheScreen();
    expect(screen.getByText('En construcción')).toBeOnTheScreen();
  });

  it('Inicio: describe el gráfico de peso para lectores de pantalla', async () => {
    await renderApp(mockPatient);
    expect(screen.getByTestId('weight-chart').props.accessibilityLabel).toMatch(
      /últimos 7 días.*Hoy: 68,4 kilogramos/,
    );
  });

  it('Registrar → Signos vitales: oculta la barra y avisa la presión fuera de rango', async () => {
    await renderApp(mockPatient);
    await fireEvent.press(screen.getByRole('tab', { name: 'Registrar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Signos vitales y peso' }));

    expect(screen.getByTestId('vitals-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('floating-tab-bar')).toBeNull();
    // Valor de ejemplo 162 mmHg: fuera del rango de demostración.
    expect(screen.getByTestId('pressure-notice')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('field-systolic'), '128');
    expect(screen.queryByTestId('pressure-notice')).toBeNull();
  });

  it('Alertas: filtra por severidad', async () => {
    await renderApp(mockPatient);
    await fireEvent.press(screen.getByRole('tab', { name: 'Alertas' }));
    expect(screen.getAllByTestId(/^alert-/)).toHaveLength(4);

    await fireEvent.press(screen.getByRole('radio', { name: 'Urgentes' }));
    expect(screen.getAllByTestId(/^alert-/)).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Llamar a mi equipo' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Info' }));
    expect(screen.getAllByTestId(/^alert-/)).toHaveLength(2);
  });

  it('Perfil: cerrar sesión pide confirmación y vuelve al Login', async () => {
    await renderApp(mockPatient);
    await fireEvent.press(screen.getByRole('tab', { name: 'Perfil' }));
    expect(screen.getByTestId('profile-catalog')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));
    expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
  });
});
