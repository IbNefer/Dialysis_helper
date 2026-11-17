import { demoDashboard } from '@/constants/demoPatient';
import { emptyDashboard } from '@/services/patients/types';

import { homeViewModel } from '../homeViewModel';

describe('homeViewModel', () => {
  it('reproduce los textos del prototipo para María', () => {
    const vm = homeViewModel(demoDashboard);
    expect(vm).toMatchObject({
      exchangesDone: 3,
      exchangesTotal: 4,
      percent: 75,
      nextExchange: '8:00\u00A0p.\u00A0m.',
      hasUnreadAlerts: true,
    });
    expect(vm.weight).toMatchObject({
      value: '68,4',
      unit: 'kg',
      change: '−0,3 vs. ayer',
      tone: 'positive',
    });
    expect(vm.pressure).toMatchObject({ value: '128/82', change: 'mmHg · 8:10\u00A0a.\u00A0m.' });
    expect(vm.balance).toMatchObject({ value: '+450', unit: 'ml', change: '3 intercambios' });
    expect(vm.balance.spoken).toBe('Balance, más 450 mililitros, 3 intercambios');
    expect(vm.fluids).toMatchObject({
      value: '600',
      unit: '/ 1000 ml',
      change: 'Límite de tu doctor',
      tone: 'doctorNote',
    });
  });

  it('avisa la subida de peso, el balance negativo y el límite de líquidos', () => {
    const vm = homeViewModel({
      ...demoDashboard,
      exchanges: { ...demoDashboard.exchanges, done: 4 },
      weight: { todayKg: 70.1, yesterdayKg: 69.2 },
      balanceMl: -120,
      fluids: { intakeMl: 1000, limitMl: 1000 },
    });
    expect(vm.nextExchange).toBe('Completado por hoy');
    expect(vm.weight).toMatchObject({ change: '+0,9 vs. ayer', tone: 'attention' });
    expect(vm.balance.value).toBe('−120');
    expect(vm.balance.spoken).toMatch(/menos 120 mililitros/);
    expect(vm.fluids).toMatchObject({ change: 'Llegaste a tu límite', tone: 'attention' });
  });

  it('un paciente sin registros muestra guiones, no ceros inventados', () => {
    const vm = homeViewModel(emptyDashboard());
    expect(vm.weight.value).toBe('—');
    expect(vm.pressure.value).toBe('—');
    expect(vm.percent).toBe(0);
    expect(vm.balance.change).toBe('0 intercambios');
    expect(vm.hasUnreadAlerts).toBe(false);
  });
});
