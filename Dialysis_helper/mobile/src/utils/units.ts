/** Cómo se leen en voz alta las unidades que muestran los campos y tarjetas. */
const spokenUnits: Record<string, string> = {
  kg: 'kilogramos',
  mmHg: 'milímetros de mercurio',
  '°C': 'grados Celsius',
  ml: 'mililitros',
};

export function spokenUnit(unit: string): string {
  return spokenUnits[unit] ?? unit;
}
