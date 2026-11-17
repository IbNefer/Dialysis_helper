import { fireEvent, screen } from '@testing-library/react-native';

import { mockPatient } from '@/constants/mockData';
import { renderApp as renderWithServices } from '@/test-utils/renderApp';

/** Con sesión (initialUser) o sin ella; servicios en memoria y semilla fija. */
async function renderApp(initialUser: typeof mockPatient | null = null) {
  await renderWithServices({ initialUser });
}

describe('flujos de las pantallas maquetadas', () => {
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
    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
  });
});
