import { formatDecimal, parseDecimal } from './format';
import { demoVitalRanges, isOutOfRange } from './ranges';

describe('parseDecimal / formatDecimal', () => {
  it('acepta coma o punto decimal', () => {
    expect(parseDecimal('68,4')).toBe(68.4);
    expect(parseDecimal('36.8')).toBe(36.8);
    expect(parseDecimal(' 120 ')).toBe(120);
  });

  it('devuelve null si no es un número completo', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('68,')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
  });

  it('formatea con coma decimal', () => {
    expect(formatDecimal(68.4)).toBe('68,4');
    expect(formatDecimal(69, 1)).toBe('69,0');
  });
});

describe('isOutOfRange', () => {
  it('marca valores fuera del rango de ejemplo', () => {
    expect(isOutOfRange('162', demoVitalRanges.systolic)).toBe(true);
    expect(isOutOfRange('35,2', demoVitalRanges.temperature)).toBe(true);
  });

  it('no marca valores dentro del rango ni texto incompleto', () => {
    expect(isOutOfRange('128', demoVitalRanges.systolic)).toBe(false);
    expect(isOutOfRange('140', demoVitalRanges.systolic)).toBe(false);
    expect(isOutOfRange('', demoVitalRanges.weight)).toBe(false);
    expect(isOutOfRange('36,', demoVitalRanges.temperature)).toBe(false);
  });
});
