import { useState } from 'react';

import {
  AlertCard,
  EmptyState,
  FilterChips,
  Screen,
  ScreenHeader,
  type ChipOption,
} from '@/components/ui';
import { mockAlerts } from '@/constants/mockData';
import type { MainTabScreenProps } from '@/navigation/types';
import type { Severity } from '@/types/alerts';

type Filter = 'all' | Severity;

const filters: ChipOption<Filter>[] = [
  { key: 'all', label: 'Todas' },
  { key: 'urgent', label: 'Urgentes' },
  { key: 'attention', label: 'Atención' },
  { key: 'info', label: 'Info' },
];

/** M8 · Alertas. Maqueta con alertas ficticias de las tres severidades. */
export function AlertsScreen({ navigation }: MainTabScreenProps<'AlertsTab'>) {
  const [filter, setFilter] = useState<Filter>('all');
  const visible =
    filter === 'all' ? mockAlerts : mockAlerts.filter((alert) => alert.severity === filter);

  return (
    <Screen testID="alerts-screen">
      <ScreenHeader title="Alertas" />
      <FilterChips
        options={filters}
        value={filter}
        onChange={setFilter}
        accessibilityLabel="Filtrar alertas por severidad"
      />
      {visible.map((alert) => (
        <AlertCard
          key={alert.id}
          severity={alert.severity}
          time={alert.time}
          message={alert.message}
          read={alert.read}
          onCallTeam={() =>
            navigation.navigate('ProfileTab', { screen: 'Contacts', initial: false })
          }
          testID={`alert-${alert.id}`}
        />
      ))}
      {visible.length === 0 && (
        <EmptyState
          icon="checkmark-circle"
          title="No tienes alertas aquí"
          description="Cuando haya una alerta de este tipo, la verás en esta lista."
        />
      )}
    </Screen>
  );
}
