import { useMemo } from 'react';

import { useSession } from '@/services/session/SessionContext';
import type { PatientDashboard } from '@/types/patient';

import { emptyDashboard } from './types';

/** Resumen del día del paciente con sesión (en desarrollo, sus datos sintéticos). */
export function usePatientDashboard(): PatientDashboard {
  const { user, services } = useSession();
  return useMemo(
    () => (user ? services.patients.getDashboard(user.id) : emptyDashboard()),
    [user, services],
  );
}
