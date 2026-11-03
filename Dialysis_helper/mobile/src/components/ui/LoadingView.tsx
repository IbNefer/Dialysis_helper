import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AmbientBackground } from './AmbientBackground';
import { AppText } from './AppText';

type LoadingViewProps = {
  message?: string;
  /** Ocupa toda la pantalla con el fondo ambiental (por defecto) o solo su contenedor. */
  fullScreen?: boolean;
};

export function LoadingView({ message = 'Cargando…', fullScreen = true }: LoadingViewProps) {
  return (
    <View
      style={[styles.root, fullScreen && styles.fullScreen]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityState={{ busy: true }}
    >
      {fullScreen && <AmbientBackground />}
      <ActivityIndicator size="large" color={colors.accentStart} />
      <AppText color="textMuted">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  fullScreen: { flex: 1 },
});
