import { useNavigation } from '@react-navigation/native';

import { EmptyState, Screen, ScreenHeader, type IconName } from '@/components/ui';
import { UNDER_CONSTRUCTION } from '@/constants/copy';
import { modules, type ModuleCode } from '@/constants/modules';

type PlaceholderScreenProps = {
  title: string;
  moduleCode: ModuleCode;
  icon?: IconName;
  /** Muestra el botón volver (pantallas dentro de una pila). */
  showBack?: boolean;
  withTabBar?: boolean;
};

/** Pantalla provisional para módulos sin diseño todavía: título, código del módulo y "En construcción". */
export function PlaceholderScreen({
  title,
  moduleCode,
  icon = 'construct',
  showBack = true,
  withTabBar = false,
}: PlaceholderScreenProps) {
  const navigation = useNavigation();

  return (
    <Screen withTabBar={withTabBar}>
      <ScreenHeader
        title={title}
        subtitle={`${moduleCode} · ${modules[moduleCode]}`}
        onBack={showBack && navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <EmptyState
        icon={icon}
        title={UNDER_CONSTRUCTION}
        description="Esta parte de la app llegará pronto. Por ahora no guarda ningún dato."
        testID="placeholder"
      />
    </Screen>
  );
}
