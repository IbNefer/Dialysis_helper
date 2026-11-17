/**
 * Paciente de demostración del prototipo: María Rodríguez (DATOS FICTICIOS).
 *
 * Este archivo no importa valores de otros módulos para que también lo pueda usar el script del
 * generador sintético con Node (`npm run synthetic`).
 */
import type { AuthUser } from '@/services/auth/types';
import type { PatientDashboard } from '@/types/patient';

export const demoUser: AuthUser = {
  id: 'pac-001',
  firstName: 'María',
  lastName: 'Rodríguez',
  fullName: 'María Rodríguez',
  initials: 'MR',
  email: 'maria@ejemplo.com',
  role: 'paciente',
};

/** Los mismos valores que muestra el prototipo HTML. */
export const demoDashboard: PatientDashboard = {
  exchanges: {
    done: 3,
    total: 4,
    schedule: ['8:00 a. m.', '12:00 p. m.', '2:00 p. m.', '8:00 p. m.'],
  },
  weight: { todayKg: 68.4, yesterdayKg: 68.7 },
  weightWeek: [
    { day: 'Mié', kg: 68.6 },
    { day: 'Jue', kg: 68.9 },
    { day: 'Vie', kg: 68.5 },
    { day: 'Sáb', kg: 69.1 },
    { day: 'Dom', kg: 68.7 },
    { day: 'Lun', kg: 68.9 },
    { day: 'Hoy', kg: 68.4 },
  ],
  pressure: { systolic: 128, diastolic: 82, time: '8:10 a. m.' },
  temperatureC: 36.8,
  balanceMl: 450,
  fluids: { intakeMl: 600, limitMl: 1000 },
  pending: 'Pendiente hoy: tu peso de la noche',
  alerts: [
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
  ],
  clinicPhone: '809-555-0100',
};
