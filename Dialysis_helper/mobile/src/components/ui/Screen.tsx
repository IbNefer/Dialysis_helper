import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing } from '@/theme';

import { AmbientBackground } from './AmbientBackground';

type ScreenProps = {
  children: ReactNode;
  /** false para pantallas que manejan su propio scroll (por ejemplo, listas). */
  scroll?: boolean;
  /** Reserva espacio abajo para la barra de pestañas flotante. */
  withTabBar?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Eventos del ScrollView (por ejemplo, saber si se leyó hasta el final). */
  scrollViewProps?: Pick<
    ScrollViewProps,
    'onScroll' | 'scrollEventThrottle' | 'onLayout' | 'onContentSizeChange' | 'testID'
  >;
  testID?: string;
};

/** Espacio que ocupa la barra flotante más un respiro, para que el contenido no quede debajo. */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return sizes.tabBar.height + Math.max(insets.bottom, sizes.tabBar.bottom) + spacing.md;
}

export function Screen({
  children,
  scroll = true,
  withTabBar = true,
  contentStyle,
  scrollViewProps,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const paddingBottom = withTabBar ? tabBarInset : insets.bottom + spacing.xl;

  const padding: ViewStyle = {
    paddingTop: insets.top + spacing.md,
    paddingBottom,
    paddingLeft: insets.left + spacing.screen,
    paddingRight: insets.right + spacing.screen,
  };

  return (
    <View style={styles.root} testID={testID}>
      <StatusBar style="light" />
      <AmbientBackground />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            {...scrollViewProps}
            contentContainerStyle={[styles.content, padding, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.root, styles.content, padding, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {scroll && (
        <View
          pointerEvents="none"
          style={[styles.statusBarScrim, { height: insets.top }]}
          testID="status-bar-scrim"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, gap: spacing.md },
  statusBarScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.statusBarScrim,
  },
});
