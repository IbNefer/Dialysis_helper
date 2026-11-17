/**
 * DATOS FICTICIOS para maquetar pantallas. No corresponden a ninguna persona real.
 * Se reemplazarán por la API cuando se implemente cada módulo.
 *
 * Inicio y Alertas ya leen el resumen del paciente con sesión (usePatientDashboard): en desarrollo
 * sale del generador sintético (SIS-RF-019). Lo de aquí queda para las pantallas que aún son maqueta.
 */
import type { AlertItem } from '@/types/alerts';

import { demoDashboard, demoUser } from './demoPatient';

export const mockPatient = demoUser;

export const mockToday = {
  dateLabel: 'Martes, 3 de noviembre',
  greeting: 'Buenos días',
};

/** Peso de los últimos 7 días, de más antiguo a hoy. */
export const mockWeightWeek = demoDashboard.weightWeek;

export const mockVitals = {
  timeLabel: 'Hoy · 8:10 p. m.',
  weight: '68,4',
  systolic: '162',
  diastolic: '88',
  temperature: '36,8',
};

export const mockAlerts: AlertItem[] = demoDashboard.alerts;
