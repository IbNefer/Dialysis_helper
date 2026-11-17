/**
 * Catálogo para armar personas FICTICIAS. Las combinaciones son aleatorias y no corresponden a
 * nadie real. Los correos usan el dominio reservado de ejemplo y los teléfonos la serie 555.
 */
export const FEMALE_NAMES = [
  'Ana',
  'Carmen',
  'Rosa',
  'Juana',
  'Altagracia',
  'Mercedes',
  'Luz',
  'Margarita',
  'Teresa',
  'Yolanda',
  'Ramona',
  'Milagros',
] as const;

export const MALE_NAMES = [
  'José',
  'Juan',
  'Luis',
  'Rafael',
  'Pedro',
  'Ramón',
  'Manuel',
  'Francisco',
  'Héctor',
  'Julio',
  'Andrés',
  'Félix',
] as const;

export const LAST_NAMES = [
  'Pérez',
  'Martínez',
  'Gómez',
  'Santos',
  'Reyes',
  'Díaz',
  'Ramírez',
  'Peña',
  'Castillo',
  'Jiménez',
  'Núñez',
  'Guzmán',
  'Vásquez',
  'Batista',
  'Almonte',
  'Rosario',
  'Mejía',
  'Polanco',
] as const;

export const DOCTORS = [
  'Dra. Carmen Ortiz',
  'Dr. Alberto Fermín',
  'Dra. Laura Cabrera',
  'Dr. Miguel Tavárez',
] as const;

export const CLINICS = ['Unidad Renal Ejemplo', 'Centro de Diálisis Demo'] as const;

export const PRESSURE_TIMES = ['7:30 a. m.', '8:10 a. m.', '9:05 a. m.', '10:20 a. m.'] as const;

export const PENDING_ITEMS = [
  'Pendiente hoy: tu peso de la noche',
  'Pendiente hoy: tu presión de la tarde',
  'Pendiente hoy: tus líquidos de la cena',
] as const;

/** Horario típico de diálisis peritoneal continua ambulatoria (DPCA) según cuántos intercambios. */
export const EXCHANGE_SCHEDULES: Record<3 | 4, string[]> = {
  3: ['8:00 a. m.', '2:00 p. m.', '9:00 p. m.'],
  4: ['8:00 a. m.', '12:00 p. m.', '4:00 p. m.', '8:00 p. m.'],
};

export const FLUID_LIMITS_ML = [800, 1000, 1200, 1500] as const;

/** Abreviaturas de los días, empezando en domingo (Date.getDay()). */
export const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
