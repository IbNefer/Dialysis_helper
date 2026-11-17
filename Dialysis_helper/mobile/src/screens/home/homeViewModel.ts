import type { StatChangeTone } from '@/components/ui';
import type { PatientDashboard } from '@/types/patient';
import { formatDecimal, keepTimeTogether } from '@/utils/format';

type Stat = {
  value: string;
  unit?: string;
  change: string;
  tone: StatChangeTone;
  /** Texto completo para el lector de pantalla. */
  spoken: string;
};

export type HomeViewModel = {
  exchangesDone: number;
  exchangesTotal: number;
  progress: number;
  percent: number;
  nextExchange: string;
  hasUnreadAlerts: boolean;
  weight: Stat;
  pressure: Stat;
  balance: Stat;
  fluids: Stat;
};

const NO_RECORD = 'Sin registro todavía';
const MINUS = '−';

function signed(value: number, format: (n: number) => string = String): string {
  if (value > 0) return `+${format(value)}`;
  if (value < 0) return `${MINUS}${format(Math.abs(value))}`;
  return format(0);
}

/** Convierte el resumen del paciente en los textos de Inicio (como en el prototipo). */
export function homeViewModel(dashboard: PatientDashboard): HomeViewModel {
  const { done, total, schedule } = dashboard.exchanges;
  const progress = total > 0 ? Math.min(done / total, 1) : 0;

  const { todayKg, yesterdayKg } = dashboard.weight;
  let weight: Stat;
  if (todayKg === null) {
    weight = { value: '—', change: NO_RECORD, tone: 'neutral', spoken: `Peso, ${NO_RECORD}` };
  } else {
    const diff = yesterdayKg === null ? null : Math.round((todayKg - yesterdayKg) * 10) / 10;
    const change = diff === null ? 'Primer registro' : `${signed(diff, formatDecimal)} vs. ayer`;
    weight = {
      value: formatDecimal(todayKg),
      unit: 'kg',
      change,
      tone: diff !== null && diff > 0 ? 'attention' : 'positive',
      spoken: `Peso, ${formatDecimal(todayKg)} kilogramos, ${change}`,
    };
  }

  const bp = dashboard.pressure;
  const pressure: Stat = bp
    ? {
        value: `${bp.systolic}/${bp.diastolic}`,
        change: `mmHg · ${keepTimeTogether(bp.time)}`,
        tone: 'neutral',
        spoken: `Presión, ${bp.systolic} sobre ${bp.diastolic} milímetros de mercurio, ${bp.time}`,
      }
    : { value: '—', change: NO_RECORD, tone: 'neutral', spoken: `Presión, ${NO_RECORD}` };

  const exchangesNote = `${done} ${done === 1 ? 'intercambio' : 'intercambios'}`;
  const b = dashboard.balanceMl;
  const balance: Stat = {
    value: signed(b),
    unit: 'ml',
    change: exchangesNote,
    tone: 'neutral',
    spoken: `Balance, ${b > 0 ? 'más ' : b < 0 ? 'menos ' : ''}${Math.abs(b)} mililitros, ${exchangesNote}`,
  };

  const { intakeMl, limitMl } = dashboard.fluids;
  const reached = intakeMl >= limitMl;
  const fluidsNote = reached ? 'Llegaste a tu límite' : 'Límite de tu doctor';
  const fluids: Stat = {
    value: String(intakeMl),
    unit: `/ ${limitMl} ml`,
    change: fluidsNote,
    tone: reached ? 'attention' : 'doctorNote',
    spoken: `Líquidos, ${intakeMl} de ${limitMl} mililitros. ${fluidsNote}`,
  };

  return {
    exchangesDone: done,
    exchangesTotal: total,
    progress,
    percent: Math.round(progress * 100),
    nextExchange: keepTimeTogether(schedule[done] ?? 'Completado por hoy'),
    hasUnreadAlerts: dashboard.alerts.some((alert) => !alert.read),
    weight,
    pressure,
    balance,
    fluids,
  };
}
