import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

export type Requirement = { key: string; label: string; met: boolean };

type RequirementListProps = {
  requirements: Requirement[];
  /** Para el lector de pantalla, por ejemplo "Requisitos de la contraseña". */
  accessibilityLabel: string;
  testID?: string;
};

const ICON = 20;

/**
 * Lista de requisitos que se marcan mientras la persona escribe. Lo cumplido lleva el check verde
 * del prototipo; lo pendiente, un círculo vacío. Nunca depende solo del color: cada fila dice
 * "cumplido" o "pendiente" al lector de pantalla.
 */
export function RequirementList({
  requirements,
  accessibilityLabel,
  testID,
}: RequirementListProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.root} testID={testID}>
      {requirements.map((requirement) => (
        <View
          key={requirement.key}
          accessible
          accessibilityLabel={`${requirement.label}: ${requirement.met ? 'cumplido' : 'pendiente'}`}
          style={styles.row}
          testID={testID ? `${testID}-${requirement.key}` : undefined}
        >
          {requirement.met ? (
            <AppIcon name="dp-check" size={ICON} color={colors.success} />
          ) : (
            <View style={styles.pending} />
          )}
          <AppText
            variant="caption"
            color={requirement.met ? 'text' : 'textMuted'}
            style={styles.label}
          >
            {requirement.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pending: {
    width: ICON - 4,
    height: ICON - 4,
    margin: 2,
    borderRadius: ICON,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  label: { flex: 1 },
});
