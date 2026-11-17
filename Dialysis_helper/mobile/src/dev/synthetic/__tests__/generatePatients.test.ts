import { demoDashboard, demoUser } from '@/constants/demoPatient';
import { demoVitalRanges } from '@/utils/ranges';

import {
  ALERT_MESSAGES,
  buildDevSeed,
  createRandom,
  DEMO_INVITATION_CODES,
  generateSyntheticPatients,
} from '..';

const REFERENCE = new Date('2026-11-17T12:00:00Z'); // martes

describe('createRandom', () => {
  it('es determinista con la misma semilla', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    expect(Array.from({ length: 5 }, a.next)).toEqual(Array.from({ length: 5 }, b.next));
  });

  it('cambia con otra semilla y respeta los límites', () => {
    const random = createRandom(7);
    expect(createRandom(8).next()).not.toBe(createRandom(7).next());
    for (let i = 0; i < 500; i += 1) {
      const n = random.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
});

describe('generateSyntheticPatients (SIS-RF-019)', () => {
  const patients = generateSyntheticPatients({ seed: 2026, count: 40, referenceDate: REFERENCE });

  it('la misma semilla da exactamente los mismos pacientes', () => {
    const again = generateSyntheticPatients({ seed: 2026, count: 40, referenceDate: REFERENCE });
    expect(again).toEqual(patients);
  });

  it('otra semilla da otros pacientes', () => {
    const other = generateSyntheticPatients({ seed: 99, count: 40, referenceDate: REFERENCE });
    expect(other.slice(1).map((p) => p.user.email)).not.toEqual(
      patients.slice(1).map((p) => p.user.email),
    );
  });

  it('pedir menos pacientes da un prefijo de la misma lista', () => {
    const few = generateSyntheticPatients({ seed: 2026, count: 5, referenceDate: REFERENCE });
    expect(few).toEqual(patients.slice(0, 5));
  });

  it('empieza con María, la paciente del prototipo, con la contraseña demo1234', () => {
    expect(patients).toHaveLength(40);
    expect(patients[0]?.user).toEqual(demoUser);
    expect(patients[0]?.user.email).toBe('maria@ejemplo.com');
    expect(patients[0]?.password).toBe('demo1234');
    expect(patients[0]?.dashboard).toEqual(demoDashboard);
  });

  it('sin la paciente demo empieza en pac-001 con un paciente generado', () => {
    const [first] = generateSyntheticPatients({
      seed: 2026,
      count: 1,
      includeDemoPatient: false,
      referenceDate: REFERENCE,
    });
    expect(first?.user.id).toBe('pac-001');
    expect(first?.user.email).not.toBe('maria@ejemplo.com');
  });

  it('ids y correos son únicos y los correos usan el dominio de ejemplo', () => {
    const ids = new Set(patients.map((p) => p.user.id));
    const emails = new Set(patients.map((p) => p.user.email));
    expect(ids.size).toBe(patients.length);
    expect(emails.size).toBe(patients.length);
    for (const { user } of patients) {
      expect(user.email).toMatch(/^[a-z0-9.]+@ejemplo\.com$/);
      expect(user.initials).toMatch(/^[A-ZÁÉÍÓÚÑ]{2}$/);
      expect(user.fullName).toBe(`${user.firstName} ${user.lastName}`);
    }
  });

  it('los valores están en rangos realistas como los del prototipo', () => {
    for (const { dashboard, profile } of patients.slice(1)) {
      const { exchanges, weight, pressure, temperatureC, fluids, weightWeek } = dashboard;
      expect(profile.age).toBeGreaterThanOrEqual(28);
      expect(profile.age).toBeLessThanOrEqual(82);
      expect(weight.todayKg).toBeGreaterThanOrEqual(45);
      expect(weight.todayKg).toBeLessThanOrEqual(100);
      expect(Math.abs((weight.todayKg ?? 0) - (weight.yesterdayKg ?? 0))).toBeLessThanOrEqual(0.6);
      expect(pressure?.systolic).toBeGreaterThanOrEqual(100);
      expect(pressure?.systolic).toBeLessThanOrEqual(170);
      expect(pressure?.diastolic).toBeGreaterThanOrEqual(60);
      expect(pressure?.diastolic).toBeLessThanOrEqual(100);
      expect(temperatureC).toBeGreaterThanOrEqual(36);
      expect(temperatureC).toBeLessThanOrEqual(38.5);
      expect([3, 4]).toContain(exchanges.total);
      expect(exchanges.schedule).toHaveLength(exchanges.total);
      expect(exchanges.done).toBeLessThanOrEqual(exchanges.total);
      expect([800, 1000, 1200, 1500]).toContain(fluids.limitMl);
      expect(fluids.intakeMl % 50).toBe(0);
      expect(weightWeek).toHaveLength(7);
      expect(weightWeek[6]).toEqual({ day: 'Hoy', kg: weight.todayKg });
    }
  });

  it('las etiquetas de días salen de la fecha de referencia', () => {
    // 17/11/2026 es martes: la semana va de miércoles a hoy.
    expect(patients[1]?.dashboard.weightWeek.map((d) => d.day)).toEqual([
      'Mié',
      'Jue',
      'Vie',
      'Sáb',
      'Dom',
      'Lun',
      'Hoy',
    ]);
  });

  it('las alertas son coherentes con los valores y nunca diagnostican', () => {
    const { systolic, diastolic, temperature } = demoVitalRanges;
    for (const { dashboard, profile } of patients.slice(1)) {
      const messages = dashboard.alerts.map((a) => a.message);
      const bp = dashboard.pressure;
      const bpOut =
        !!bp &&
        (bp.systolic > systolic.max ||
          bp.systolic < systolic.min ||
          bp.diastolic > diastolic.max ||
          bp.diastolic < diastolic.min);
      expect(messages.includes(ALERT_MESSAGES.pressure)).toBe(bpOut);

      const t = dashboard.temperatureC ?? 0;
      expect(messages.includes(ALERT_MESSAGES.temperature)).toBe(
        t > temperature.max || t < temperature.min,
      );
      expect(messages.includes(ALERT_MESSAGES.turbid)).toBe(profile.scenario === 'urgente');
      expect(messages.includes(ALERT_MESSAGES.fluids)).toBe(
        dashboard.fluids.intakeMl >= dashboard.fluids.limitMl,
      );

      for (const alert of dashboard.alerts) {
        expect(alert.message).not.toMatch(/peritonitis|infecci[oó]n|diagn[oó]stico/i);
        if (alert.severity === 'urgent') expect(alert.message).toMatch(/Contacta a tu equipo/);
        if (alert.severity === 'attention') expect(alert.message).toMatch(/equipo de salud/);
      }
    }
  });

  it('genera pacientes de los tres escenarios', () => {
    const scenarios = new Set(patients.slice(1).map((p) => p.profile.scenario));
    expect(scenarios).toEqual(new Set(['estable', 'atencion', 'urgente']));
  });

  it('rechaza una cantidad inválida', () => {
    expect(() => generateSyntheticPatients({ seed: 1, count: -1 })).toThrow();
  });
});

describe('buildDevSeed', () => {
  it('arma cuentas e invitaciones de prueba para el backend simulado', () => {
    const seed = buildDevSeed({ seed: 2026, count: 8 }, REFERENCE);
    expect(seed.accounts).toHaveLength(8);
    expect(seed.description).toBe('Semilla 2026 · 8 pacientes');
    expect(seed.invitations.map((i) => i.code)).toEqual([
      DEMO_INVITATION_CODES.valid,
      DEMO_INVITATION_CODES.expired,
      DEMO_INVITATION_CODES.used,
    ]);
    const [valid, expired, used] = seed.invitations;
    expect(new Date(valid?.expiresAt ?? 0).getTime()).toBeGreaterThan(REFERENCE.getTime());
    expect(valid?.usedAt).toBeNull();
    expect(new Date(expired?.expiresAt ?? 0).getTime()).toBeLessThan(REFERENCE.getTime());
    expect(used?.usedAt).not.toBeNull();
  });

  it('es determinista', () => {
    expect(buildDevSeed({ seed: 5, count: 3 }, REFERENCE)).toEqual(
      buildDevSeed({ seed: 5, count: 3 }, REFERENCE),
    );
  });
});
