import {
  checkPasswordRules,
  digitsOnly,
  hasErrors,
  isPasswordValid,
  normalizeEmail,
  normalizeInvitationCode,
  validateActivationForm,
  validateEmail,
  validateInvitationCode,
  validateLoginForm,
  type ActivationForm,
} from '../validation';

describe('correo', () => {
  it('normaliza espacios y mayúsculas', () => {
    expect(normalizeEmail('  Maria@Ejemplo.COM ')).toBe('maria@ejemplo.com');
  });

  it.each(['maria@ejemplo.com', 'jose.nunez+dp@clinica.com.do', ' MARIA@EJEMPLO.COM '])(
    'acepta %s',
    (email) => {
      expect(validateEmail(email)).toBeUndefined();
    },
  );

  it('pide el correo si está vacío', () => {
    expect(validateEmail('   ')).toBe('Escribe tu correo electrónico.');
  });

  it.each([
    'maria',
    'maria@',
    'maria@ejemplo',
    '@ejemplo.com',
    'maria @ejemplo.com',
    'maria@ejemplo.c',
  ])('rechaza %s con un mensaje que dice el formato', (email) => {
    expect(validateEmail(email)).toMatch(/nombre@ejemplo\.com/);
  });
});

describe('validateLoginForm (MOV-RF-003)', () => {
  it('sin errores con correo válido y contraseña', () => {
    const errors = validateLoginForm({ email: 'maria@ejemplo.com', password: 'demo1234' });
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it('la contraseña no puede estar vacía ni ser solo espacios', () => {
    expect(validateLoginForm({ email: 'maria@ejemplo.com', password: '' }).password).toBe(
      'Escribe tu contraseña.',
    );
    expect(validateLoginForm({ email: 'maria@ejemplo.com', password: '   ' }).password).toBe(
      'Escribe tu contraseña.',
    );
  });

  it('marca los dos campos a la vez', () => {
    const errors = validateLoginForm({ email: 'maria', password: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'password']);
    expect(hasErrors(errors)).toBe(true);
  });
});

describe('requisitos de la contraseña (MOV-RF-001)', () => {
  it('lista los tres requisitos en orden y los marca', () => {
    expect(checkPasswordRules('abc')).toEqual([
      { key: 'length', label: 'Al menos 8 caracteres', met: false },
      { key: 'letter', label: 'Al menos una letra', met: true },
      { key: 'number', label: 'Al menos un número', met: false },
    ]);
  });

  it('acepta letras con tilde o ñ', () => {
    expect(isPasswordValid('añoñuevo1')).toBe(true);
  });

  it.each([
    ['12345678', false],
    ['abcdefgh', false],
    ['abc1234', false],
    ['demo1234', true],
  ])('%s → %s', (password, valid) => {
    expect(isPasswordValid(password)).toBe(valid);
  });
});

describe('validateActivationForm (MOV-RF-001)', () => {
  const valid: ActivationForm = {
    firstName: 'Rosa',
    lastName: 'Almonte',
    phone: '',
    password: 'clave2026',
    confirmPassword: 'clave2026',
  };

  it('sin errores con datos completos (teléfono opcional)', () => {
    expect(validateActivationForm(valid)).toEqual({});
    expect(validateActivationForm({ ...valid, phone: '809-555-0100' })).toEqual({});
  });

  it('pide nombre y apellidos', () => {
    const errors = validateActivationForm({ ...valid, firstName: ' ', lastName: '' });
    expect(errors.firstName).toBe('Escribe tu nombre.');
    expect(errors.lastName).toBe('Escribe tus apellidos.');
  });

  it('el teléfono, si se escribe, tiene 10 dígitos', () => {
    expect(validateActivationForm({ ...valid, phone: '555-0100' }).phone).toMatch(/10 dígitos/);
  });

  it('la contraseña debe cumplir los requisitos', () => {
    const errors = validateActivationForm({
      ...valid,
      password: 'corta',
      confirmPassword: 'corta',
    });
    expect(errors.password).toMatch(/requisitos/);
  });

  it('la confirmación debe coincidir', () => {
    expect(validateActivationForm({ ...valid, confirmPassword: 'clave2027' }).confirmPassword).toBe(
      'Las contraseñas no coinciden.',
    );
    expect(validateActivationForm({ ...valid, confirmPassword: '' }).confirmPassword).toBe(
      'Escribe la contraseña otra vez.',
    );
  });

  it('digitsOnly deja solo números', () => {
    expect(digitsOnly('(809) 555-0100')).toBe('8095550100');
  });
});

describe('código de invitación (MOV-RF-001)', () => {
  it.each([
    ['demo-2026', 'DEMO-2026'],
    ['demo2026', 'DEMO-2026'],
    [' de mo 20 26 ', 'DEMO-2026'],
    ['abc', 'ABC'],
  ])('normaliza %j → %s', (raw, expected) => {
    expect(normalizeInvitationCode(raw)).toBe(expected);
  });

  it('valida longitud y caracteres', () => {
    expect(validateInvitationCode('')).toBe('Escribe el código de invitación.');
    expect(validateInvitationCode('ABC-12')).toMatch(/8 letras o números/);
    expect(validateInvitationCode('ABCD-12$4')).toMatch(/8 letras o números/);
    expect(validateInvitationCode('abcd 2345')).toBeUndefined();
  });
});
