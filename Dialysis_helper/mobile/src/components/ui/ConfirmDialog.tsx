import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** 'danger' para acciones que no se pueden deshacer. */
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
        <GlassCard
          style={styles.card}
          padding={spacing.xl}
          contentStyle={styles.content}
          accessibilityViewIsModal
        >
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          <AppText color="textMuted">{message}</AppText>
          <View style={styles.actions}>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              label={confirmLabel}
              onPress={onConfirm}
              testID="confirm-dialog-confirm"
            />
            <Button
              variant="secondary"
              label={cancelLabel}
              onPress={onCancel}
              testID="confirm-dialog-cancel"
            />
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.screen,
  },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  content: { gap: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
});
