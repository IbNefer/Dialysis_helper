import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { AppIcon, type IconName } from './AppIcon';
import { AppText } from './AppText';

export type NoticeVariant = 'info' | 'attention' | 'urgent' | 'pending';

type InlineNoticeProps = {
  variant: NoticeVariant;
  message: string;
  /** Inicio en negrita, por ejemplo "Atención." */
  title?: string;
  testID?: string;
};

const variants: Record<
  NoticeVariant,
  { icon: IconName; color: string; backgroundColor: string; borderColor: string }
> = {
  info: {
    icon: 'information-circle',
    color: colors.info,
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
  },
  attention: {
    icon: 'warning',
    color: colors.attention,
    backgroundColor: colors.attentionBg,
    borderColor: colors.attentionBorder,
  },
  urgent: {
    icon: 'alert-circle',
    color: colors.urgent,
    backgroundColor: colors.urgentBg,
    borderColor: colors.urgentBorder,
  },
  pending: {
    icon: 'time',
    color: colors.accentBlue,
    backgroundColor: colors.accentBlueSoft,
    borderColor: colors.accentBlueBorder,
  },
};

export function InlineNotice({ variant, message, title, testID }: InlineNoticeProps) {
  const v = variants[variant];
  const isAlert = variant === 'attention' || variant === 'urgent';

  return (
    <View
      accessible
      accessibilityRole={isAlert ? 'alert' : 'text'}
      accessibilityLiveRegion={isAlert ? 'polite' : 'none'}
      accessibilityLabel={title ? `${title} ${message}` : message}
      testID={testID}
      style={[styles.root, { backgroundColor: v.backgroundColor, borderColor: v.borderColor }]}
    >
      <AppIcon name={v.icon} color={v.color} />
      <AppText style={styles.text}>
        {title && (
          <AppText variant="bodyLg" color={v.color} style={styles.title}>
            {title}{' '}
          </AppText>
        )}
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  text: { flex: 1 },
  title: { fontSize: 17 },
});
