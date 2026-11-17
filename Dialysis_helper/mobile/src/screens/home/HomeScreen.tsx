import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Button,
  GlassCard,
  Grid,
  IconButton,
  ProgressBar,
  Screen,
  StatCard,
} from '@/components/ui';
import { mockToday } from '@/constants/mockData';
import type { MainTabScreenProps } from '@/navigation/types';
import { usePatientDashboard } from '@/services/patients/usePatientDashboard';
import { useSession } from '@/services/session/SessionContext';
import { colors, radii, sizes, spacing } from '@/theme';

import { homeViewModel } from './homeViewModel';
import { WeightWeekChart } from './WeightWeekChart';

/** M7 · Inicio con el resumen del paciente con sesión (en desarrollo, datos sintéticos). */
export function HomeScreen({ navigation }: MainTabScreenProps<'HomeTab'>) {
  const { user } = useSession();
  const dashboard = usePatientDashboard();
  const {
    exchangesDone,
    exchangesTotal,
    nextExchange,
    progress,
    percent,
    hasUnreadAlerts: unread,
    weight,
    pressure,
    balance,
    fluids,
  } = homeViewModel(dashboard);

  return (
    <Screen testID="home-screen">
      <View style={styles.header}>
        <Avatar initials={user?.initials ?? ''} name={user?.fullName ?? ''} />
        <View style={styles.greeting}>
          <AppText color="textMuted">{mockToday.dateLabel}</AppText>
          <AppText variant="heading" accessibilityRole="header">
            {mockToday.greeting}, {user?.firstName}
          </AppText>
        </View>
        <IconButton
          icon="notifications"
          badge={unread}
          accessibilityLabel={unread ? 'Alertas, tienes alertas sin leer' : 'Alertas'}
          onPress={() => navigation.navigate('AlertsTab')}
          testID="home-bell"
        />
      </View>

      <GlassCard contentStyle={styles.summary}>
        <View>
          <View style={styles.summaryTop}>
            <AppText variant="overline" color="textMuted" style={styles.flex}>
              Resumen de hoy
            </AppText>
            <View style={styles.percentBadge}>
              <AppText variant="label" color="accentBlue">
                {percent} %
              </AppText>
            </View>
          </View>
          <AppText variant="title">
            {exchangesDone} de {exchangesTotal} intercambios
          </AppText>
        </View>
        <ProgressBar
          progress={progress}
          accessibilityLabel={`Intercambios de hoy: ${exchangesDone} de ${exchangesTotal}`}
        />
        <View style={styles.summaryBottom}>
          <View accessible>
            <AppText color="textMuted">Próximo intercambio</AppText>
            <AppText variant="heading">{nextExchange}</AppText>
          </View>
          <Button
            label="Registrar ahora"
            onPress={() =>
              navigation.navigate('RegisterTab', { screen: 'DialysisSession', initial: false })
            }
          />
        </View>
      </GlassCard>

      <Grid>
        <StatCard
          label="Peso"
          value={weight.value}
          unit={weight.unit}
          change={weight.change}
          changeTone={weight.tone}
          accessibilityLabel={weight.spoken}
        />
        <StatCard
          label="Presión"
          value={pressure.value}
          change={pressure.change}
          changeTone={pressure.tone}
          accessibilityLabel={pressure.spoken}
        />
        <StatCard
          label="Balance"
          value={balance.value}
          unit={balance.unit}
          change={balance.change}
          changeTone={balance.tone}
          accessibilityLabel={balance.spoken}
        />
        <StatCard
          label="Líquidos"
          value={fluids.value}
          unit={fluids.unit}
          change={fluids.change}
          changeTone={fluids.tone}
          accessibilityLabel={fluids.spoken}
        />
      </Grid>

      <GlassCard contentStyle={styles.chartCard}>
        <View style={styles.chartHeader}>
          <AppText variant="bodyLg" accessibilityRole="header" style={styles.flex}>
            Peso · últimos 7 días
          </AppText>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Ver historial de peso"
            accessibilityHint="Disponible próximamente"
            hitSlop={8}
            style={styles.link}
          >
            <AppText variant="label" color="accentBlue">
              Ver historial
            </AppText>
          </Pressable>
        </View>
        {dashboard.weightWeek.length > 0 ? (
          <WeightWeekChart data={dashboard.weightWeek} />
        ) : (
          <AppText color="textMuted">Aún no hay registros de peso. Aparecerán aquí.</AppText>
        )}
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greeting: { flex: 1 },
  summary: { gap: spacing.md },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  percentBadge: {
    backgroundColor: colors.accentBlueSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  // En columna: con fuente grande una fila que salta de línea deforma el botón.
  summaryBottom: { gap: spacing.md },
  chartCard: { gap: spacing.lg },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  link: { minHeight: sizes.touchTarget, justifyContent: 'center' },
});
