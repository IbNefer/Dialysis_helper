import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DialysisSessionScreen } from '@/screens/register/DialysisSessionScreen';
import { FluidsMealsScreen } from '@/screens/register/FluidsMealsScreen';
import { RegisterMenuScreen } from '@/screens/register/RegisterMenuScreen';
import { SymptomsScreen } from '@/screens/register/SymptomsScreen';
import { VitalsScreen } from '@/screens/register/VitalsScreen';

import { stackScreenOptions } from './navigationTheme';
import type { RegisterStackParamList } from './types';

const Stack = createNativeStackNavigator<RegisterStackParamList>();

export function RegisterStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="RegisterMenu" component={RegisterMenuScreen} />
      <Stack.Screen name="DialysisSession" component={DialysisSessionScreen} />
      <Stack.Screen name="Vitals" component={VitalsScreen} />
      <Stack.Screen name="FluidsMeals" component={FluidsMealsScreen} />
      <Stack.Screen name="Symptoms" component={SymptomsScreen} />
    </Stack.Navigator>
  );
}
