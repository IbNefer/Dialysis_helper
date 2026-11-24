import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { colors, glows } from '@/theme';

/**
 * Fondo de todas las pantallas: color base con un brillo verde arriba y uno azul abajo.
 * Es decorativo y no recibe toques.
 */
export function AmbientBackground() {
  const { width, height } = useWindowDimensions();
  const radius = Math.max(width, height) * 0.55;

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]}
      testID="ambient-background"
    >
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="glowPrimary" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={glows.primary.color} stopOpacity={glows.primary.opacity} />
            <Stop offset="1" stopColor={glows.primary.color} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowSecondary" cx="50%" cy="50%" r="50%">
            <Stop
              offset="0"
              stopColor={glows.secondary.color}
              stopOpacity={glows.secondary.opacity}
            />
            <Stop offset="1" stopColor={glows.secondary.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.42} cy={height * 0.06} r={radius} fill="url(#glowPrimary)" />
        <Circle cx={width * 0.15} cy={height * 0.88} r={radius * 0.85} fill="url(#glowSecondary)" />
      </Svg>
    </View>
  );
}
