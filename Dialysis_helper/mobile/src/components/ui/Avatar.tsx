import { StyleSheet } from 'react-native';

import { radii, sizes } from '@/theme';

import { AccentGradient } from './AccentGradient';
import { AppText } from './AppText';

type AvatarProps = {
  initials: string;
  /** Nombre completo para el lector de pantalla. */
  name: string;
  size?: number;
};

export function Avatar({ initials, name, size = sizes.avatar }: AvatarProps) {
  return (
    <AccentGradient
      style={[styles.root, { width: size, height: size }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Foto de perfil de ${name}`}
    >
      <AppText
        variant="bodyLg"
        color="onAccent"
        maxFontSizeMultiplier={1.2}
        accessible={false}
        style={{ fontSize: size * 0.36, lineHeight: size * 0.46 }}
      >
        {initials}
      </AppText>
    </AccentGradient>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
});
