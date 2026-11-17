import type { AlertItem } from './alerts';

/** Peso de un día para el gráfico semanal (de más antiguo a hoy). */
export type WeightPoint = { day: string; kg: number };

/**
 * Resumen del día de un paciente: lo que pinta Inicio (M7) y Alertas (M8).
 * Hoy viene del backend simulado o del generador sintético; cuando exista el endpoint real
 * (pendiente, M7) se llenará desde la API.
 */
export type PatientDashboard = {
  exchanges: {
    done: number;
    total: number;
    /** Horario de los intercambios del día, ya formateado ("8:00 a. m."). */
    schedule: string[];
  };
  weight: { todayKg: number | null; yesterdayKg: number | null };
  weightWeek: WeightPoint[];
  pressure: { systolic: number; diastolic: number; time: string } | null;
  temperatureC: number | null;
  /** Balance acumulado de los intercambios de hoy (drenado − infundido), en ml. */
  balanceMl: number;
  fluids: { intakeMl: number; limitMl: number };
  /** Registro pendiente de hoy, si lo hay ("Pendiente hoy: tu peso de la noche"). */
  pending: string | null;
  alerts: AlertItem[];
  /** Teléfono de la clínica (ficticio, serie 809-555-01xx). */
  clinicPhone: string;
};
