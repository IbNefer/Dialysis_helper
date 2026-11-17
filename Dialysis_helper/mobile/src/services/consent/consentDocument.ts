/**
 * Texto del consentimiento informado (MOV-RF-002).
 *
 * BORRADOR: lo debe revisar y aprobar el equipo de salud y quien asesore la parte legal antes de
 * usarse con pacientes reales. Si cambia el texto, sube `version`: a quien aceptó una versión
 * anterior se le vuelve a pedir que acepte.
 */
export type ConsentSection = { title: string; body: string };

export type ConsentDocument = {
  version: string;
  title: string;
  /** Fecha de la versión, ya formateada para mostrar. */
  dateLabel: string;
  sections: ConsentSection[];
};

export const CURRENT_CONSENT: ConsentDocument = {
  version: '1.0',
  title: 'Consentimiento informado',
  dateLabel: '17 de noviembre de 2026',
  sections: [
    {
      title: 'Qué es DP-Hogar',
      body:
        'DP-Hogar es una app para registrar tu diálisis peritoneal en casa: tus intercambios, tu ' +
        'peso, tu presión, lo que tomas y los síntomas que tengas. Esos registros los comparte con ' +
        'tu equipo de salud.',
    },
    {
      title: 'Qué datos vamos a guardar',
      body:
        'Tu nombre, tu correo y tu teléfono. Los datos de cada intercambio (tipo de solución, ' +
        'volumen y aspecto del líquido). Tu peso, presión y temperatura. Los líquidos y comidas ' +
        'que anotes. Los síntomas que marques y las notas que escribas.',
    },
    {
      title: 'Para qué se usan',
      body:
        'Para que tu equipo de salud vea cómo vas entre una consulta y otra, y para avisarte ' +
        'cuando un valor esté fuera de los parámetros que fijó tu doctor. No usamos tus datos para ' +
        'publicidad y no los vendemos.',
    },
    {
      title: 'Quién puede verlos',
      body:
        'Tú, el cuidador que autorices y el equipo de salud que te atiende. Nadie más puede verlos ' +
        'sin tu permiso, salvo que la ley lo exija.',
    },
    {
      title: 'Lo que la app no hace',
      body:
        'DP-Hogar no hace diagnósticos y no sustituye la atención de urgencia. Las alertas solo te ' +
        'avisan que un valor está fuera de lo habitual para que hables con tu equipo de salud. En ' +
        'una emergencia llama al 911.',
    },
    {
      title: 'Cómo cuidamos tus datos',
      body:
        'En tu teléfono, tu sesión se guarda en el almacenamiento seguro del sistema. Tus registros ' +
        'se envían al servidor de la clínica, donde solo los ve quien tiene permiso.',
    },
    {
      title: 'Tus derechos',
      body:
        'Usar la app es voluntario. Puedes pedir ver, corregir o borrar tus datos, y retirar este ' +
        'consentimiento cuando quieras hablando con tu equipo de salud. Si no aceptas, tu atención ' +
        'médica no cambia: solo no podrás usar la app.',
    },
    {
      title: 'Si tienes dudas',
      body:
        'Si algo no está claro, pregúntale a tu doctor o a tu enfermera antes de aceptar. Puedes ' +
        'leer este documento con calma y con alguien de tu confianza.',
    },
  ],
};
