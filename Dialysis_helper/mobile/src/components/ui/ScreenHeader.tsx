import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Muestra el botón volver. */
  onBack?: () => void;
};

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.root}>
      {onBack && (
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Volver"
          onPress={onBack}
          testID="back"
        />
      )}
      <View style={styles.text}>
        <AppText variant={onBack ? 'title' : 'display'} accessibilityRole="header">
          {title}
        </AppText>
        {subtitle && <AppText color="textMuted">{subtitle}</AppText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1 },
});
