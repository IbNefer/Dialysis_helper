/**
 * SIS-RF-019 · Generador de pacientes sintéticos (solo desarrollo y demos).
 *
 * Crea pacientes FICTICIOS con datos coherentes con los rangos del prototipo. Es determinista:
 * la misma semilla da los mismos pacientes. La fecha de referencia solo cambia las etiquetas de
 * los días del gráfico, no los valores.
 *
 * Los imports de valores son relativos y con extensión .ts para que el script de Node
 * (`npm run synthetic`) pueda ejecutar este archivo sin compilar.
 */
import type { AuthUser } from '@/services/auth/types';
import type { AlertItem } from '@/types/alerts';
import type { PatientDashboard, WeightPoint } from '@/types/patient';

import { demoDashboard, demoUser } from '../../constants/demoPatient.ts';
import { demoVitalRanges } from '../../utils/ranges.ts';
import {
  CLINICS,
  DOCTORS,
  EXCHANGE_SCHEDULES,
  FEMALE_NAMES,
  FLUID_LIMITS_ML,
  LAST_NAMES,
  MALE_NAMES,
  PENDING_ITEMS,
  PRESSURE_TIMES,
  WEEKDAYS,
} from './catalog.ts';
import { createRandom, type Random } from './prng.ts';

export type Scenario = 'estable' | 'atencion' | 'urgente';
type AttentionCause = 'presion' | 'temperatura' | 'peso' | 'liquidos';

export type SyntheticPatient = {
  user: AuthUser;
  /** Contraseña de prueba. Todos los pacientes sintéticos usan la misma. */
  password: string;
  profile: {
    age: number;
    sex: 'F' | 'M';
    scenario: Scenario;
    /** Peso seco fijado por el doctor (objetivo), en kg. */
    dryWeightKg: number;
    doctor: string;
    clinic: string;
  };
  dashboard: PatientDashboard;
};

export type GenerateOptions = {
  seed: number;
  /** Cuántos pacientes en total (incluida María si `includeDemoPatient`). */
  count: number;
  /** Incluye primero a María Rodríguez (maria@ejemplo.com), la paciente del prototipo. */
  includeDemoPatient?: boolean;
  /** Fecha de "hoy" para las etiquetas del gráfico. */
  referenceDate?: Date;
};

export const EMAIL_DOMAIN = 'ejemplo.com';

/**
 * Contraseña de prueba de todos los pacientes sintéticos (documentada en el README). Vive aquí,
 * en código solo de desarrollo, para que no llegue al bundle de producción.
 */
export const DEMO_PASSWORD = 'demo1234';

/** Mensajes de alerta. Nunca diagnostican: dicen qué pasó y a quién avisar. */
export const ALERT_MESSAGES = {
  turbid: 'Registraste líquido drenado turbio. Contacta a tu equipo ahora.',
  pressure: 'Tu presión está fuera de lo habitual. Avisa a tu equipo de salud.',
  temperature: 'Tu temperatura está fuera de lo habitual. Avisa a tu equipo de salud.',
  weight: 'Tu peso subió más de lo habitual. Avisa a tu equipo de salud.',
  fluids: 'Llegaste al límite de líquidos que fijó tu doctor para hoy.',
  weightMissing: 'Aún no has registrado tu peso de hoy.',
  nextExchange: (time: string) => `Es hora de tu intercambio de las ${time}.`,
} as const;

/** Subida de peso sobre el peso seco a partir de la cual el generador crea un aviso. */
export const WEIGHT_GAIN_ALERT_KG = 1.5;

/** "José Núñez" → "josenunez": para armar correos sin tildes ni espacios. */
export function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function pickScenario(random: Random): Scenario {
  const roll = random.next();
  if (roll < 0.12) return 'urgente';
  if (roll < 0.4) return 'atencion';
  return 'estable';
}

function dayLabels(referenceDate: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    if (index === 6) return 'Hoy';
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() - (6 - index));
    return WEEKDAYS[date.getDay()] ?? '';
  });
}

function isPressureOut(systolic: number, diastolic: number): boolean {
  const { systolic: s, diastolic: d } = demoVitalRanges;
  return systolic < s.min || systolic > s.max || diastolic < d.min || diastolic > d.max;
}

function isTemperatureOut(celsius: number): boolean {
  const { min, max } = demoVitalRanges.temperature;
  return celsius < min || celsius > max;
}

function generatePatient(
  random: Random,
  index: number,
  usedEmails: Set<string>,
  referenceDate: Date,
): SyntheticPatient {
  const id = `pac-${String(index + 1).padStart(3, '0')}`;

  // Identidad
  const sex = random.chance(0.5) ? 'F' : 'M';
  const firstName = random.pick(sex === 'F' ? FEMALE_NAMES : MALE_NAMES);
  const firstLast = random.pick(LAST_NAMES);
  let secondLast = random.pick(LAST_NAMES);
  if (secondLast === firstLast) secondLast = random.pick(LAST_NAMES);
  const lastName = secondLast === firstLast ? firstLast : `${firstLast} ${secondLast}`;
  let email = `${slug(firstName)}.${slug(firstLast)}@${EMAIL_DOMAIN}`;
  for (let n = 2; usedEmails.has(email); n += 1) {
    email = `${slug(firstName)}.${slug(firstLast)}${n}@${EMAIL_DOMAIN}`;
  }
  usedEmails.add(email);

  const scenario = pickScenario(random);
  const cause: AttentionCause | null =
    scenario === 'atencion'
      ? random.pick(['presion', 'temperatura', 'peso', 'liquidos'] as const)
      : null;

  // Peso (kg). El peso seco es el objetivo; hoy suele estar un poco por encima.
  const dryWeightKg = sex === 'F' ? random.float(48, 82) : random.float(58, 96);
  const gain = cause === 'peso' ? random.float(1.6, 2.4) : random.float(-0.4, 1.2);
  const todayKg = round(dryWeightKg + gain);
  const yesterdayKg = round(todayKg + random.float(-0.6, 0.6));
  const labels = dayLabels(referenceDate);
  const weightWeek: WeightPoint[] = labels.map((day, i) => ({
    day,
    kg: i === 6 ? todayKg : round(dryWeightKg + random.float(-0.5, 1.0)),
  }));

  // Presión (mmHg) y temperatura (°C)
  const highPressure = cause === 'presion';
  const systolic = highPressure ? random.int(146, 168) : random.int(108, 138);
  const diastolic = highPressure ? random.int(86, 98) : random.int(64, 88);
  const temperatureC =
    cause === 'temperatura' || (scenario === 'urgente' && random.chance(0.5))
      ? random.float(37.7, 38.4)
      : random.float(36.1, 37.2);

  // Intercambios del día y balance (drenado − infundido)
  const total = random.pick([4, 4, 4, 3] as const);
  const schedule = EXCHANGE_SCHEDULES[total];
  const done = random.int(0, total);
  let balanceMl = 0;
  for (let i = 0; i < done; i += 1) balanceMl += random.int(-15, 35) * 10;

  // Líquidos (ml)
  const limitMl = random.pick(FLUID_LIMITS_ML);
  const intakeMl =
    cause === 'liquidos'
      ? roundTo(limitMl * random.float(1.0, 1.2, 2), 50)
      : roundTo(limitMl * random.float(0.2, 0.95, 2), 50);

  const pressureTime = random.pick(PRESSURE_TIMES);
  const pending = random.chance(0.5) ? random.pick(PENDING_ITEMS) : null;
  const clinicPhone = `809-555-01${String(random.int(1, 99)).padStart(2, '0')}`;
  const age = random.int(28, 82);
  const doctor = random.pick(DOCTORS);
  const clinic = random.pick(CLINICS);

  // Alertas coherentes con los valores
  const alerts: AlertItem[] = [];
  const add = (severity: AlertItem['severity'], message: string, time: string, read = false) =>
    alerts.push({ id: `${id}-a${alerts.length + 1}`, severity, message, time, read });

  if (scenario === 'urgente') add('urgent', ALERT_MESSAGES.turbid, `Hace ${random.int(3, 40)} min`);
  if (isPressureOut(systolic, diastolic))
    add('attention', ALERT_MESSAGES.pressure, `Hoy, ${pressureTime}`);
  if (isTemperatureOut(temperatureC))
    add('attention', ALERT_MESSAGES.temperature, 'Hoy, 9:30 a. m.');
  if (todayKg - dryWeightKg >= WEIGHT_GAIN_ALERT_KG) {
    add('attention', ALERT_MESSAGES.weight, 'Hoy, 7:45 a. m.');
  }
  if (intakeMl >= limitMl) add('info', ALERT_MESSAGES.fluids, 'Hoy, 6:15 p. m.');
  const next = schedule[done];
  if (next) add('info', ALERT_MESSAGES.nextExchange(next), 'Hace 15 min');
  if (random.chance(0.4)) add('info', ALERT_MESSAGES.weightMissing, 'Ayer, 9:00 a. m.', true);

  return {
    user: {
      id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      initials: `${firstName.charAt(0)}${firstLast.charAt(0)}`.toUpperCase(),
      email,
      role: 'paciente',
    },
    password: DEMO_PASSWORD,
    profile: { age, sex, scenario, dryWeightKg, doctor, clinic },
    dashboard: {
      exchanges: { done, total, schedule },
      weight: { todayKg, yesterdayKg },
      weightWeek,
      pressure: { systolic, diastolic, time: pressureTime },
      temperatureC,
      balanceMl,
      fluids: { intakeMl, limitMl },
      pending,
      alerts,
      clinicPhone,
    },
  };
}

/** María Rodríguez, con los mismos datos que el prototipo. */
function demoPatient(): SyntheticPatient {
  return {
    user: demoUser,
    password: DEMO_PASSWORD,
    profile: {
      age: 58,
      sex: 'F',
      scenario: 'urgente',
      dryWeightKg: 68.2,
      doctor: DOCTORS[0],
      clinic: CLINICS[0],
    },
    dashboard: demoDashboard,
  };
}

export function generateSyntheticPatients({
  seed,
  count,
  includeDemoPatient = true,
  referenceDate = new Date(),
}: GenerateOptions): SyntheticPatient[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('count debe ser un entero mayor o igual a 0');
  }
  const random = createRandom(seed);
  const patients: SyntheticPatient[] = [];
  const usedEmails = new Set<string>();

  if (includeDemoPatient && count > 0) {
    patients.push(demoPatient());
    usedEmails.add(demoUser.email);
  }
  while (patients.length < count) {
    patients.push(generatePatient(random, patients.length, usedEmails, referenceDate));
  }
  return patients;
}
