import type { PatientDashboard } from '@/types/patient';

/**
 * Resumen del día del paciente (lo que muestran Inicio y Alertas).
 *
 * Es sincrónico porque hoy lee datos que ya están en memoria (backend simulado). Cuando exista
 * el endpoint (M7, pendiente) pasará a ser asíncrono con caché local.
 */
export interface PatientDataService {
  getDashboard(userId: string): PatientDashboard;
}

/** Paciente recién activado: todavía no tiene registros. */
export function emptyDashboard(): PatientDashboard {
  return {
    exchanges: {
      done: 0,
      total: 4,
      schedule: ['8:00 a. m.', '12:00 p. m.', '4:00 p. m.', '8:00 p. m.'],
    },
    weight: { todayKg: null, yesterdayKg: null },
    weightWeek: [],
    pressure: null,
    temperatureC: null,
    balanceMl: 0,
    fluids: { intakeMl: 0, limitMl: 1000 },
    pending: 'Pendiente hoy: tu primer registro de peso',
    alerts: [],
    clinicPhone: '809-555-0100',
  };
}
