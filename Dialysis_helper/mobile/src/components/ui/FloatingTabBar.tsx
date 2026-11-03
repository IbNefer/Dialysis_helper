import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, radii, sizes, spacing } from '@/theme';

import { AppText } from './AppText';
import { GlassCard } from './GlassCard';

/** La barra tiene alto fijo: limitamos el crecimiento de la etiqueta para que no se corte. */
const LABEL_MAX_SCALE = 1.3;

/**
 * Barra de pestañas flotante: píldora de vidrio oscuro de 72 px, a 16 px de los lados y 24 px del
 * fondo (o más si el teléfono tiene zona segura). Se oculta si la pantalla activa pide
 * `tabBarStyle: { display: 'none' }`.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index];
  const focusedOptions = focusedRoute ? descriptors[focusedRoute.key]?.options : undefined;
  const hidden = StyleSheet.flatten(focusedOptions?.tabBarStyle)?.display === 'none';

  if (hidden) return null;

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, sizes.tabBar.bottom) }]}
      pointerEvents="box-none"
    >
      <GlassCard
        tone="tabBar"
        radius={radii.pill}
        padding={0}
        contentStyle={styles.bar}
        accessibilityRole="tablist"
        testID="floating-tab-bar"
      >
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          const label =
            typeof options?.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options?.title ?? route.name);
          const focused = state.index === index;
          const color = focused ? colors.accentGreen : colors.text;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(route),
                target: state.key,
              });
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              testID={`tab-${route.name}`}
              style={[styles.tab, focused && styles.tabActive]}
            >
              {options?.tabBarIcon?.({ focused, color, size: sizes.icon })}
              <AppText
                variant="tabLabel"
                color={color}
                numberOfLines={1}
                maxFontSizeMultiplier={LABEL_MAX_SCALE}
                style={focused && styles.labelActive}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: sizes.tabBar.side,
    right: sizes.tabBar.side,
  },
  bar: {
    height: sizes.tabBar.height,
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: spacing.xs - 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radii.pill,
    minWidth: sizes.touchTarget,
  },
  tabActive: { backgroundColor: colors.accentGreenSoft },
  labelActive: { fontFamily: fontFamily.bold },
});
