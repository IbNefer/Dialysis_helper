/**
 * SIS-RF-019 · Genera pacientes sintéticos en JSON (para demos o para sembrar el backend).
 *
 *   npm run synthetic -- --seed 42 --count 10 --date 2026-11-17 > pacientes.json
 *
 * Opciones (todas opcionales):
 *   --seed <n>       semilla (por defecto 2026). La misma semilla da los mismos pacientes.
 *   --count <n>      pacientes en total, incluida María (por defecto 8).
 *   --date <AAAA-MM-DD>  "hoy" para las etiquetas del gráfico (por defecto, la fecha actual).
 *   --no-demo        no incluir a María Rodríguez (maria@ejemplo.com).
 *
 * Usa la eliminación de tipos de Node 22.18+ / 24: no necesita compilar ni dependencias.
 */
import { DEFAULT_SYNTHETIC_COUNT, DEFAULT_SYNTHETIC_SEED } from '../src/dev/synthetic/devSeed.ts';
import { generateSyntheticPatients } from '../src/dev/synthetic/generatePatients.ts';
import { generateDemoInvitations } from '../src/dev/synthetic/invitations.ts';

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function integerOption(name: string, fallback: number): number {
  const raw = option(name);
  if (raw === undefined) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 0) {
    process.stderr.write(`--${name} debe ser un entero mayor o igual a 0\n`);
    process.exit(1);
  }
  return value;
}

const seed = integerOption('seed', DEFAULT_SYNTHETIC_SEED);
const count = integerOption('count', DEFAULT_SYNTHETIC_COUNT);
const rawDate = option('date');
const referenceDate = rawDate ? new Date(`${rawDate}T12:00:00`) : new Date();
if (Number.isNaN(referenceDate.getTime())) {
  process.stderr.write('--date debe tener el formato AAAA-MM-DD\n');
  process.exit(1);
}

const patients = generateSyntheticPatients({
  seed,
  count,
  referenceDate,
  includeDemoPatient: !process.argv.includes('--no-demo'),
});

process.stdout.write(
  `${JSON.stringify(
    {
      seed,
      count: patients.length,
      referenceDate: referenceDate.toISOString().slice(0, 10),
      patients,
      invitations: generateDemoInvitations(seed, referenceDate),
    },
    null,
    2,
  )}\n`,
);
