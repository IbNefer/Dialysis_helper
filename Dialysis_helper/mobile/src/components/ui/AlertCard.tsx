import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { severityLabels, type Severity } from '@/types/alerts';

import { AppText } from './AppText';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { SeverityBadge } from './SeverityBadge';

type AlertCardProps = {
  severity: Severity;
  time: string;
  message: string;
  read?: boolean;
  /** Acción del botón "Llamar a mi equipo" (solo en urgentes). */
  onCallTeam?: () => void;
  testID?: string;
};

export function AlertCard({
  severity,
  time,
  message,
  read = false,
  onCallTeam,
  testID,
}: AlertCardProps) {
  const urgent = severity === 'urgent';
  const tone = urgent ? 'urgent' : read ? 'subtle' : 'default';
  const timeLabel = read ? 'Leída' : time;

  return (
    <GlassCard tone={tone} testID={testID} contentStyle={styles.content}>
      <View
        accessible
        accessibilityLabel={`Alerta ${severityLabels[severity]}. ${timeLabel}. ${message}`}
        style={styles.body}
      >
        <View style={styles.header}>
          <SeverityBadge severity={severity} />
          <AppText variant="caption" color="textMuted" style={styles.time}>
            {timeLabel}
          </AppText>
        </View>
        <AppText variant="bodyLg" color={read ? 'textMuted' : 'text'}>
          {message}
        </AppText>
      </View>
      {urgent && (
        <Button variant="danger" icon="call" label="Llamar a mi equipo" onPress={onCallTeam} />
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  body: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  time: { flexShrink: 1, textAlign: 'right' },
});
