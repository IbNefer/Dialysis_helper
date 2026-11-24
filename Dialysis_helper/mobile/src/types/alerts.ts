export type Severity = 'info' | 'attention' | 'urgent';

export type AlertItem = {
  id: string;
  severity: Severity;
  /** Hora ya formateada para mostrar ("Hace 5 min", "Hoy, 8:10 p. m."). */
  time: string;
  message: string;
  read: boolean;
};

export const severityLabels: Record<Severity, string> = {
  info: 'Informativa',
  attention: 'Atención',
  urgent: 'Urgente',
};
