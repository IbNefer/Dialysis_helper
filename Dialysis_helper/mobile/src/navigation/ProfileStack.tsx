import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComponentCatalogScreen } from '@/screens/dev/ComponentCatalogScreen';
import { ContactsScreen } from '@/screens/profile/ContactsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';

import { stackScreenOptions } from './navigationTheme';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {__DEV__ && <Stack.Screen name="ComponentCatalog" component={ComponentCatalogScreen} />}
    </Stack.Navigator>
  );
}
