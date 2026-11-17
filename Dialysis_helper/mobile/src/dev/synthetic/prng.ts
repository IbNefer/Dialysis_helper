/**
 * Generador pseudoaleatorio con semilla (mulberry32): la misma semilla da siempre la misma
 * secuencia, así las pruebas y las demos son reproducibles. No sirve para criptografía.
 */
export type Random = {
  /** Número en [0, 1). */
  next(): number;
  /** Entero en [min, max], ambos incluidos. */
  int(min: number, max: number): number;
  /** Decimal en [min, max) redondeado a `decimals` cifras. */
  float(min: number, max: number, decimals?: number): number;
  pick<T>(items: readonly T[]): T;
  chance(probability: number): boolean;
};

export function createRandom(seed: number): Random {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    float: (min, max, decimals = 1) => {
      const factor = 10 ** decimals;
      return Math.round((min + next() * (max - min)) * factor) / factor;
    },
    pick: (items) => {
      if (items.length === 0) throw new Error('pick() necesita al menos un elemento');
      return items[Math.floor(next() * items.length)] as (typeof items)[number];
    },
    chance: (probability) => next() < probability,
  };
}
