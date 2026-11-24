import { parseDecimal } from './format';

export type Range = { min: number; max: number };

/**
 * Rangos de EJEMPLO para la validación visual en el cliente. No son criterios clínicos: los rangos
 * reales los define el equipo de salud de cada paciente y llegarán desde el backend.
 */
export const demoVitalRanges = {
  weight: { min: 40, max: 120 },
  systolic: { min: 90, max: 140 },
  diastolic: { min: 60, max: 90 },
  temperature: { min: 36, max: 37.5 },
} satisfies Record<string, Range>;

/** true si el texto es un número fuera del rango. Vacío o incompleto no se marca. */
export function isOutOfRange(text: string, range: Range): boolean {
  const value = parseDecimal(text);
  if (value === null) return false;
  return value < range.min || value > range.max;
}
