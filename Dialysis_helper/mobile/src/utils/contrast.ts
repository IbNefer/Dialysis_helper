type Rgba = { r: number; g: number; b: number; a: number };

/** Convierte '#RRGGBB' o 'rgba(r,g,b,a)' en componentes numéricos. */
export function parseColor(color: string): Rgba {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex?.[1]) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgba = /^rgba?\(([^)]+)\)$/i.exec(color);
  if (rgba?.[1]) {
    const [r = 0, g = 0, b = 0, a = 1] = rgba[1].split(',').map((part) => Number(part.trim()));
    return { r, g, b, a };
  }
  throw new Error(`Color no soportado: ${color}`);
}

/** Mezcla una capa translúcida sobre un fondo opaco. */
export function composite(top: string, bottom: string): string {
  const t = parseColor(top);
  const b = parseColor(bottom);
  const mix = (x: number, y: number) => Math.round(x * t.a + y * (1 - t.a));
  return `rgba(${mix(t.r, b.r)},${mix(t.g, b.g)},${mix(t.b, b.b)},1)`;
}

function luminance(color: string): number {
  const { r, g, b } = parseColor(color);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Relación de contraste WCAG entre un texto (puede ser translúcido) y un fondo opaco. */
export function contrastRatio(foreground: string, background: string): number {
  const fg = composite(foreground, background);
  const l1 = luminance(fg);
  const l2 = luminance(background);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
