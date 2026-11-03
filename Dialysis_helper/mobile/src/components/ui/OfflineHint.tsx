import { StyleSheet, View } from 'react-native';

import { OFFLINE_MESSAGE } from '@/constants/copy';
import { colors, spacing } from '@/theme';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

export function OfflineHint() {
  return (
    <View style={styles.root} accessible accessibilityLabel={OFFLINE_MESSAGE}>
      <AppIcon name="checkmark-circle" color={colors.success} />
      <AppText color="textMuted" style={styles.text}>
        {OFFLINE_MESSAGE}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  text: { flex: 1 },
});
