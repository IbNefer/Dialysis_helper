/** Módulos funcionales de la app móvil que ya tienen ruta. Su lógica llega en tarjetas propias. */
export const modules = {
  M1: 'Acceso y cuenta',
  M2: 'Sesión de diálisis',
  M3: 'Signos vitales y peso',
  M4: 'Líquidos y comidas',
  M6: 'Síntomas',
  M7: 'Inicio y resumen',
  M8: 'Alertas',
  M9: 'Contactos y emergencia',
  M12: 'Perfil y ajustes',
} as const;

export type ModuleCode = keyof typeof modules;
