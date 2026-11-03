import { Button, Grid, InlineNotice, MenuTile, Screen, ScreenHeader } from '@/components/ui';
import { mockSummary } from '@/constants/mockData';
import type { RegisterScreenProps } from '@/navigation/types';

/** Menú Registrar: lleva a M2, M3, M4 y M6. */
export function RegisterMenuScreen({ navigation }: RegisterScreenProps<'RegisterMenu'>) {
  return (
    <Screen testID="register-menu-screen">
      <ScreenHeader
        title="¿Qué quieres registrar?"
        subtitle="Toca una opción. Se guarda aunque no tengas internet."
      />

      <InlineNotice variant="pending" message={mockSummary.pending} />

      <Grid>
        <MenuTile
          icon="water"
          tone="blue"
          title="Sesión de diálisis"
          description="Intercambio, volumen y balance"
          onPress={() => navigation.navigate('DialysisSession')}
          testID="menu-dialysis"
        />
        <MenuTile
          icon="heart"
          tone="green"
          title="Signos vitales y peso"
          description="Presión, temperatura, peso"
          onPress={() => navigation.navigate('Vitals')}
          testID="menu-vitals"
        />
        <MenuTile
          icon="cafe"
          tone="blue"
          title="Líquidos y comidas"
          description="Lo que tomas y eliminas"
          onPress={() => navigation.navigate('FluidsMeals')}
          testID="menu-fluids"
        />
        <MenuTile
          icon="sad"
          tone="green"
          title="Síntomas"
          description="Dolor, fiebre, sitio de salida"
          onPress={() => navigation.navigate('Symptoms')}
          testID="menu-symptoms"
        />
      </Grid>

      <Button
        variant="dangerSoft"
        icon="call"
        label="Contactar a mi equipo"
        onPress={() => navigation.navigate('ProfileTab', { screen: 'Contacts', initial: false })}
      />
    </Screen>
  );
}
