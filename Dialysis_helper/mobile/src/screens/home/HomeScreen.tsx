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
import {
  mockAlerts,
  mockStats,
  mockSummary,
  mockToday,
  mockWeightWeek,
} from '@/constants/mockData';
import type { MainTabScreenProps } from '@/navigation/types';
import { useSession } from '@/services/session/SessionContext';
import { colors, radii, sizes, spacing } from '@/theme';

import { WeightWeekChart } from './WeightWeekChart';

/** M7 · Inicio. Maqueta con datos ficticios estáticos. */
export function HomeScreen({ navigation }: MainTabScreenProps<'HomeTab'>) {
  const { user } = useSession();
  const { exchangesDone, exchangesTotal, nextExchange } = mockSummary;
  const progress = exchangesDone / exchangesTotal;
  const percent = Math.round(progress * 100);
  const unread = mockAlerts.some((alert) => !alert.read);
  const { weight, pressure, balance, fluids } = mockStats;

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
          changeTone="positive"
          accessibilityLabel={`Peso, ${weight.value} kilogramos, ${weight.change}`}
        />
        <StatCard
          label="Presión"
          value={pressure.value}
          change={pressure.note}
          accessibilityLabel={`Presión, ${pressure.systolic} sobre ${pressure.diastolic} milímetros de mercurio, 8:10 a. m.`}
        />
        <StatCard
          label="Balance"
          value={balance.value}
          unit={balance.unit}
          change={balance.note}
          accessibilityLabel={`Balance, más 450 mililitros, ${balance.note}`}
        />
        <StatCard
          label="Líquidos"
          value={fluids.value}
          unit={fluids.unit}
          change={fluids.note}
          changeTone="doctorNote"
          accessibilityLabel={`Líquidos, 600 de 1000 mililitros. ${fluids.note}`}
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
        <WeightWeekChart data={mockWeightWeek} />
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
