/**
 * Validación de los formularios de acceso (MOV-RF-001 y MOV-RF-003).
 * Los mensajes van en español sencillo y dicen qué hacer, no solo qué está mal.
 */

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function hasErrors(errors: FieldErrors<string>): boolean {
  return Object.values(errors).some(Boolean);
}

// ---------------------------------------------------------------------------------------------
// Correo
// ---------------------------------------------------------------------------------------------

/** Formato básico: algo@dominio.ext, sin espacios. La verificación real la hace el backend. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string): string | undefined {
  const email = normalizeEmail(value);
  if (email === '') return 'Escribe tu correo electrónico.';
  if (!EMAIL_PATTERN.test(email)) {
    return 'Revisa tu correo. Debe tener la forma nombre@ejemplo.com.';
  }
  return undefined;
}

// ---------------------------------------------------------------------------------------------
// Login (MOV-RF-003)
// ---------------------------------------------------------------------------------------------

export type LoginForm = { email: string; password: string };

export function validateLoginForm({ email, password }: LoginForm): FieldErrors<keyof LoginForm> {
  const errors: FieldErrors<keyof LoginForm> = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (password.trim() === '') errors.password = 'Escribe tu contraseña.';
  return errors;
}

// ---------------------------------------------------------------------------------------------
// Contraseña nueva (MOV-RF-001)
// ---------------------------------------------------------------------------------------------

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleKey = 'length' | 'letter' | 'number';

export type PasswordRule = { key: PasswordRuleKey; label: string; met: boolean };

/** Requisitos visibles de la contraseña, en el orden en que se muestran. */
export function checkPasswordRules(password: string): PasswordRule[] {
  return [
    {
      key: 'length',
      label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    { key: 'letter', label: 'Al menos una letra', met: /\p{L}/u.test(password) },
    { key: 'number', label: 'Al menos un número', met: /\d/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return checkPasswordRules(password).every((rule) => rule.met);
}

// ---------------------------------------------------------------------------------------------
// Activación de cuenta (MOV-RF-001)
// ---------------------------------------------------------------------------------------------

export type ActivationForm = {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const NAME_MAX_LENGTH = 60;

/** Deja solo los dígitos: "809-555-0100" → "8095550100". */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateActivationForm(form: ActivationForm): FieldErrors<keyof ActivationForm> {
  const errors: FieldErrors<keyof ActivationForm> = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();

  if (firstName === '') errors.firstName = 'Escribe tu nombre.';
  else if (firstName.length > NAME_MAX_LENGTH) errors.firstName = 'El nombre es demasiado largo.';

  if (lastName === '') errors.lastName = 'Escribe tus apellidos.';
  else if (lastName.length > NAME_MAX_LENGTH)
    errors.lastName = 'Los apellidos son demasiado largos.';

  // Teléfono opcional. Si lo escribe, 10 dígitos (formato de República Dominicana).
  if (form.phone.trim() !== '' && digitsOnly(form.phone).length !== 10) {
    errors.phone = 'Escribe un teléfono de 10 dígitos, por ejemplo 809-555-0100.';
  }

  if (form.password === '') errors.password = 'Crea una contraseña.';
  else if (!isPasswordValid(form.password)) {
    errors.password = 'La contraseña todavía no cumple los requisitos de abajo.';
  }

  if (form.confirmPassword === '') errors.confirmPassword = 'Escribe la contraseña otra vez.';
  else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

// ---------------------------------------------------------------------------------------------
// Código de invitación (MOV-RF-001)
// ---------------------------------------------------------------------------------------------

/** Los códigos tienen 8 letras o números y se muestran como XXXX-XXXX. */
const CODE_LENGTH = 8;

/**
 * Normaliza lo que escribe la persona: mayúsculas, sin espacios ni guiones, y con el guion en el
 * medio cuando tiene 8 caracteres ("demo 2026" → "DEMO-2026").
 */
export function normalizeInvitationCode(value: string): string {
  const compact = value.toUpperCase().replace(/[\s-]/g, '');
  if (compact.length === CODE_LENGTH) return `${compact.slice(0, 4)}-${compact.slice(4)}`;
  return compact;
}

export function validateInvitationCode(value: string): string | undefined {
  const compact = value.toUpperCase().replace(/[\s-]/g, '');
  if (compact === '') return 'Escribe el código de invitación.';
  if (!/^[A-Z0-9]+$/.test(compact) || compact.length !== CODE_LENGTH) {
    return 'El código tiene 8 letras o números, por ejemplo ABCD-2345.';
  }
  return undefined;
}
