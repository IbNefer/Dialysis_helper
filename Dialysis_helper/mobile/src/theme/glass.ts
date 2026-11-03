import { Platform } from 'react-native';
import type { BlurMethod } from 'expo-blur';

/**
 * Configuración del efecto vidrio.
 *
 * En Android el desenfoque real necesita un BlurTargetView alrededor del contenido y puede ir lento
 * en equipos modestos, así que por defecto usamos un fondo sólido translúcido. Cambia `androidMode`
 * a 'blur' para probar el desenfoque nativo.
 */
export const glass = {
  blurIntensity: 24,
  tint: 'dark' as const,
  androidMode: 'solid' as 'solid' | 'blur',
  androidBlurMethod: 'dimezisBlurViewSdk31Plus' as BlurMethod,
  /** Respaldo sólido para Android, en el mismo tono petróleo del fondo. */
  androidFallback: 'rgba(17,36,42,0.88)',
};

export function shouldUseBlur(): boolean {
  return Platform.OS !== 'android' || glass.androidMode === 'blur';
}
