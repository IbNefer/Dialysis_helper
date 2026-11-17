import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing } from '@/theme';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

/** Lo que dura visible un toast (igual que el prototipo). */
export const TOAST_DURATION_MS = 2600;

type ToastContextValue = {
  /** Muestra un mensaje breve de confirmación y lo anuncia al lector de pantalla. */
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(text);
    AccessibilityInfo.announceForAccessibility(text);
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message !== null && <Toast message={message} />}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return context;
}

/** Píldora clara sobre la barra de pestañas: fondo #E6FFF6, texto #06302A y check verde. */
export function Toast({ message }: { message: string }) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, sizes.tabBar.bottom) + sizes.tabBar.height + spacing.sm;

  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.root, { bottom }]}
      testID="toast"
    >
      <AppIcon name="dp-check" size={22} color={colors.toastIcon} detailColor={colors.toastBg} />
      <AppText variant="label" color="onToast" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg - 2,
    borderRadius: 18,
    backgroundColor: colors.toastBg,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  text: { flex: 1 },
});
