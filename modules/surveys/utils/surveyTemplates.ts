export interface SurveyTemplate {
  key: string
  title: string
  description: string
  icon: string
  color: string
  questions: Array<{
    question_text: string
    question_type: string
    required: boolean
    options: Array<{ option_text: string; order_number: number }>
  }>
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    key: 'employment',
    title: 'Seguimiento Laboral',
    description: 'Evalua la situacion laboral actual de los graduados',
    icon: 'tabler-briefcase',
    color: 'primary',
    questions: [
      { question_text: '¿Actualmente se encuentra trabajando?', question_type: 'YES_NO', required: true, options: [{ option_text: 'Si', order_number: 1 }, { option_text: 'No', order_number: 2 }] },
      { question_text: '¿En que empresa trabaja actualmente?', question_type: 'TEXT', required: false, options: [] },
      { question_text: '¿Cual es su cargo actual?', question_type: 'TEXT', required: false, options: [] },
      { question_text: '¿Su trabajo esta relacionado con su carrera profesional?', question_type: 'SINGLE_CHOICE', required: true, options: [{ option_text: 'Directamente relacionado', order_number: 1 }, { option_text: 'Indirectamente relacionado', order_number: 2 }, { option_text: 'No tiene relacion', order_number: 3 }] },
      { question_text: '¿Cuanto tiempo le tomo conseguir su primer empleo despues de egresar?', question_type: 'SINGLE_CHOICE', required: true, options: [{ option_text: 'Antes de egresar', order_number: 1 }, { option_text: 'Menos de 3 meses', order_number: 2 }, { option_text: '3 a 6 meses', order_number: 3 }, { option_text: '6 a 12 meses', order_number: 4 }, { option_text: 'Mas de 1 ano', order_number: 5 }] },
      { question_text: '¿Cual es su rango salarial mensual aproximado?', question_type: 'SINGLE_CHOICE', required: false, options: [{ option_text: 'Menos de S/ 1,000', order_number: 1 }, { option_text: 'S/ 1,000 - S/ 2,000', order_number: 2 }, { option_text: 'S/ 2,000 - S/ 3,500', order_number: 3 }, { option_text: 'S/ 3,500 - S/ 5,000', order_number: 4 }, { option_text: 'Mas de S/ 5,000', order_number: 5 }] },
      { question_text: '¿Que tan satisfecho esta con su situacion laboral actual?', question_type: 'SCALE', required: true, options: [{ option_text: '1 - Muy insatisfecho', order_number: 1 }, { option_text: '2 - Insatisfecho', order_number: 2 }, { option_text: '3 - Neutral', order_number: 3 }, { option_text: '4 - Satisfecho', order_number: 4 }, { option_text: '5 - Muy satisfecho', order_number: 5 }] },
      { question_text: '¿Que competencias adquiridas durante su formacion le han sido mas utiles en su trabajo?', question_type: 'TEXT', required: false, options: [] },
    ],
  },
  {
    key: 'academic',
    title: 'Satisfaccion Academica',
    description: 'Evalua la experiencia academica y calidad educativa',
    icon: 'tabler-school',
    color: 'success',
    questions: [
      { question_text: '¿Como califica la calidad de ensenanza recibida?', question_type: 'SCALE', required: true, options: [{ option_text: '1 - Muy deficiente', order_number: 1 }, { option_text: '2 - Deficiente', order_number: 2 }, { option_text: '3 - Regular', order_number: 3 }, { option_text: '4 - Buena', order_number: 4 }, { option_text: '5 - Excelente', order_number: 5 }] },
      { question_text: '¿La infraestructura y recursos de la universidad fueron adecuados?', question_type: 'SCALE', required: true, options: [{ option_text: '1 - Muy deficiente', order_number: 1 }, { option_text: '2 - Deficiente', order_number: 2 }, { option_text: '3 - Regular', order_number: 3 }, { option_text: '4 - Buena', order_number: 4 }, { option_text: '5 - Excelente', order_number: 5 }] },
      { question_text: '¿Recomendaria la carrera a futuros estudiantes?', question_type: 'YES_NO', required: true, options: [{ option_text: 'Si', order_number: 1 }, { option_text: 'No', order_number: 2 }] },
      { question_text: '¿Que aspectos de la formacion academica mejoraria?', question_type: 'MULTIPLE_CHOICE', required: false, options: [{ option_text: 'Plan de estudios', order_number: 1 }, { option_text: 'Metodologia de ensenanza', order_number: 2 }, { option_text: 'Practicas profesionales', order_number: 3 }, { option_text: 'Investigacion', order_number: 4 }, { option_text: 'Infraestructura', order_number: 5 }, { option_text: 'Atencion al estudiante', order_number: 6 }] },
      { question_text: '¿Que sugerencia daria para mejorar la carrera?', question_type: 'TEXT', required: false, options: [] },
    ],
  },
  {
    key: 'entrepreneurship',
    title: 'Emprendimiento',
    description: 'Identifica actividades emprendedoras de los graduados',
    icon: 'tabler-rocket',
    color: 'warning',
    questions: [
      { question_text: '¿Ha iniciado algun emprendimiento o negocio propio?', question_type: 'YES_NO', required: true, options: [{ option_text: 'Si', order_number: 1 }, { option_text: 'No', order_number: 2 }] },
      { question_text: '¿En que sector se encuentra su emprendimiento?', question_type: 'SINGLE_CHOICE', required: false, options: [{ option_text: 'Tecnologia', order_number: 1 }, { option_text: 'Comercio', order_number: 2 }, { option_text: 'Servicios', order_number: 3 }, { option_text: 'Educacion', order_number: 4 }, { option_text: 'Salud', order_number: 5 }, { option_text: 'Otro', order_number: 6 }] },
      { question_text: '¿Cuantos empleados tiene su emprendimiento?', question_type: 'SINGLE_CHOICE', required: false, options: [{ option_text: 'Solo yo', order_number: 1 }, { option_text: '2 a 5', order_number: 2 }, { option_text: '6 a 20', order_number: 3 }, { option_text: 'Mas de 20', order_number: 4 }] },
      { question_text: '¿Que obstaculos ha enfrentado al emprender?', question_type: 'MULTIPLE_CHOICE', required: false, options: [{ option_text: 'Financiamiento', order_number: 1 }, { option_text: 'Conocimiento del mercado', order_number: 2 }, { option_text: 'Competencia', order_number: 3 }, { option_text: 'Tramites legales', order_number: 4 }, { option_text: 'Falta de mentores', order_number: 5 }] },
      { question_text: '¿La universidad le brindo herramientas utiles para emprender?', question_type: 'SCALE', required: true, options: [{ option_text: '1 - Nada utiles', order_number: 1 }, { option_text: '2 - Poco utiles', order_number: 2 }, { option_text: '3 - Moderadamente utiles', order_number: 3 }, { option_text: '4 - Utiles', order_number: 4 }, { option_text: '5 - Muy utiles', order_number: 5 }] },
    ],
  },
]
