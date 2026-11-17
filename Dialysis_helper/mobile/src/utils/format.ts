/** Formatea con coma decimal, como se escribe en español: 68.4 → "68,4". */
export function formatDecimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',');
}

/** Lee un número escrito con coma o punto decimal. Devuelve null si no es un número. */
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '' || !/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

const NBSP = '\u00A0';

/**
 * Evita que una hora se parta entre líneas: "10:20 a. m." → "10:20 a.\u00A0m." con espacios
 * que no cortan. Con letra grande, "a." y "m." quedaban en renglones distintos.
 */
export function keepTimeTogether(text: string): string {
  return text.replace(/(\d) ([ap])\. m\./g, `$1${NBSP}$2.${NBSP}m.`);
}
