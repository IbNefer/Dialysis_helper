import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, type RouteProp } from '@react-navigation/native';
import type { ViewStyle } from 'react-native';

import { AppIcon, FloatingTabBar, type IconName } from '@/components/ui';
import { AlertsScreen } from '@/screens/alerts/AlertsScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { colors } from '@/theme';

import { ProfileStack } from './ProfileStack';
import { RegisterStack } from './RegisterStack';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: string; size: number }) {
    return <AppIcon name={name} color={color} size={size} />;
  }
  return TabIcon;
}

/** La barra solo se muestra en la primera pantalla de cada pila; en los formularios se oculta. */
function tabBarStyleFor(
  route: RouteProp<MainTabParamList, keyof MainTabParamList>,
  rootScreen: string,
): ViewStyle | undefined {
  const focused = getFocusedRouteNameFromRoute(route) ?? rootScreen;
  return focused === rootScreen ? undefined : { display: 'none' };
}

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Inicio', tabBarIcon: tabIcon('home') }}
      />
      <Tab.Screen
        name="RegisterTab"
        component={RegisterStack}
        options={({ route }) => ({
          title: 'Registrar',
          tabBarIcon: tabIcon('add-circle'),
          tabBarStyle: tabBarStyleFor(route, 'RegisterMenu'),
        })}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{ title: 'Alertas', tabBarIcon: tabIcon('notifications') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={({ route }) => ({
          title: 'Perfil',
          tabBarIcon: tabIcon('person'),
          tabBarStyle: tabBarStyleFor(route, 'Profile'),
        })}
      />
    </Tab.Navigator>
  );
}
