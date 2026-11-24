import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppIcon } from '../AppIcon';
import { FloatingTabBar } from '../FloatingTabBar';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

type Params = { Inicio: undefined; Alertas: undefined; Oculta: undefined };
const Tab = createBottomTabNavigator<Params>();

const Home = () => <Text>Pantalla de inicio</Text>;
const Alerts = () => <Text>Pantalla de alertas</Text>;
const Hidden = () => <Text>Pantalla sin barra</Text>;

async function renderTabs() {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen
            name="Inicio"
            component={Home}
            options={{ tabBarIcon: ({ color }) => <AppIcon name="home" color={color} /> }}
          />
          <Tab.Screen
            name="Alertas"
            component={Alerts}
            options={{
              tabBarIcon: ({ color }) => <AppIcon name="notifications" color={color} />,
            }}
          />
          <Tab.Screen
            name="Oculta"
            component={Hidden}
            options={{ tabBarStyle: { display: 'none' } }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );
}

describe('FloatingTabBar', () => {
  it('muestra cada pestaña con su etiqueta y marca la activa', async () => {
    await renderTabs();
    // El contenedor no es "accessible" (agruparía las pestañas en iOS), así que no se busca por rol.
    expect(screen.getByTestId('floating-tab-bar').props.accessibilityRole).toBe('tablist');
    expect(screen.getByRole('tab', { name: 'Inicio' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Alertas' })).not.toBeSelected();
    expect(screen.getByText('Inicio')).toBeOnTheScreen();
    expect(screen.getByText('Alertas')).toBeOnTheScreen();
  });

  it('cambia de pestaña al tocarla', async () => {
    await renderTabs();
    await fireEvent.press(screen.getByRole('tab', { name: 'Alertas' }));
    expect(screen.getByText('Pantalla de alertas')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Alertas' })).toBeSelected();
  });

  it('se oculta cuando la pantalla activa lo pide', async () => {
    await renderTabs();
    await fireEvent.press(screen.getByRole('tab', { name: 'Oculta' }));
    expect(screen.getByText('Pantalla sin barra')).toBeOnTheScreen();
    expect(screen.queryByTestId('floating-tab-bar')).toBeNull();
  });
});
