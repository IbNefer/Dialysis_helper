/**
 * DATOS FICTICIOS para maquetar pantallas. No corresponden a ninguna persona real.
 * Se reemplazarán por la API cuando se implemente cada módulo.
 */
import type { AlertItem } from '@/types/alerts';

export const mockPatient = {
  firstName: 'María',
  fullName: 'María Rodríguez',
  initials: 'MR',
  email: 'maria@ejemplo.com',
  role: 'paciente' as const,
};

export const mockToday = {
  dateLabel: 'Martes, 3 de noviembre',
  greeting: 'Buenos días',
};

export const mockSummary = {
  exchangesDone: 3,
  exchangesTotal: 4,
  nextExchange: '2:00 p. m.',
  pending: 'Pendiente hoy: tu peso de la noche',
};

export const mockStats = {
  weight: { value: '68,4', unit: 'kg', change: '−0,3 vs. ayer' },
  pressure: { value: '128/82', note: 'mmHg · 8:10 a. m.', systolic: 128, diastolic: 82 },
  balance: { value: '+450', unit: 'ml', note: '3 intercambios' },
  fluids: { value: '600', unit: '/ 1000 ml', note: 'Límite de tu doctor' },
};

/** Peso de los últimos 7 días, de más antiguo a hoy. */
export const mockWeightWeek = [
  { day: 'Mié', kg: 68.6 },
  { day: 'Jue', kg: 68.9 },
  { day: 'Vie', kg: 68.5 },
  { day: 'Sáb', kg: 69.1 },
  { day: 'Dom', kg: 68.7 },
  { day: 'Lun', kg: 68.9 },
  { day: 'Hoy', kg: 68.4 },
];

export const mockVitals = {
  timeLabel: 'Hoy · 8:10 p. m.',
  weight: '68,4',
  systolic: '162',
  diastolic: '88',
  temperature: '36,8',
};

export const mockAlerts: AlertItem[] = [
  {
    id: 'a1',
    severity: 'urgent',
    time: 'Hace 5 min',
    message: 'Registraste líquido drenado turbio. Contacta a tu equipo ahora.',
    read: false,
  },
  {
    id: 'a2',
    severity: 'attention',
    time: 'Hoy, 8:10 p. m.',
    message: 'Tu presión estuvo fuera de lo habitual 2 veces. Avisa a tu equipo de salud.',
    read: false,
  },
  {
    id: 'a3',
    severity: 'info',
    time: 'Hoy, 1:45 p. m.',
    message: 'Es hora de tu intercambio de las 2:00 p. m.',
    read: false,
  },
  {
    id: 'a4',
    severity: 'info',
    time: 'Hoy, 7:00 a. m.',
    message: 'Aún no has registrado tu peso de hoy.',
    read: true,
  },
];
