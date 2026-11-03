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
