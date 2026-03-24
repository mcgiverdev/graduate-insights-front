import * as yup from 'yup'

const dniRegex = /^\d{8}$/
const phoneRegex = /^9\d{8}$/

const optionalUrl = (max: number, invalidMessage: string) => yup
  .string()
  .transform(value => {
    const trimmed = typeof value === 'string' ? value.trim() : value

    return trimmed === '' ? null : trimmed
  })
  .nullable()
  .max(max, `No debe superar ${max} caracteres`)
  .url(invalidMessage)
  .optional()

const optionalText = (max: number) => yup
  .string()
  .transform(value => {
    const trimmed = typeof value === 'string' ? value.trim() : value

    return trimmed === '' ? null : trimmed
  })
  .nullable()
  .max(max, `No debe superar ${max} caracteres`)
  .optional()

const degreeCollectionItemSchema = yup.object({
  tipoGradoId: yup.number().integer().positive().optional(),
  fechaGrado: yup.string().optional(),
  universidadId: yup.number().integer().positive().optional(),
  otroGradoNombre: optionalText(100),
  modalidadTitulacionId: yup.number().integer().positive().optional(),
  modalidadTitulacionOtro: optionalText(100),
})

const languageCollectionItemSchema = yup.object({
  idiomaId: yup.number().integer().positive().optional(),
  nivel: yup.string().oneOf(['', 'Basico', 'Intermedio', 'Avanzado']).optional(),
  aprendizaje: optionalText(100),
  fechaInicio: yup.string().optional(),
  fechaFin: yup.string().optional().test(
    'is-after-language-item-start',
    'La fecha fin del idioma debe ser mayor o igual a la fecha de inicio',
    (value, context) => {
      if (!value)
        return true

      const start = context.parent.fechaInicio
      if (!start)
        return true

      return new Date(value) >= new Date(start)
    },
  ),
}).test(
  'language-item-level-required-when-filled',
  'Seleccione el nivel del idioma',
  value => {
    if (!value)
      return true

    const hasAny = Boolean(value.idiomaId || value.fechaInicio || value.fechaFin || value.aprendizaje)
    if (!hasAny)
      return true

    return Boolean(value.nivel)
  },
)

export const graduateWizardStepOneSchema = yup.object({
  codigoUniversitario: yup
    .string()
    .trim()
    .max(20, 'El codigo universitario no debe superar 20 caracteres')
    .required('El codigo universitario es obligatorio'),
  nombres: yup.string().trim().max(100, 'Los nombres no deben superar 100 caracteres').required('Los nombres son obligatorios'),
  apellidos: yup.string().trim().max(100, 'Los apellidos no deben superar 100 caracteres').required('Los apellidos son obligatorios'),
  dni: yup.string().matches(dniRegex, 'El DNI debe tener 8 digitos').required('El DNI es obligatorio'),
  fechaNacimiento: yup.string().required('La fecha de nacimiento es obligatoria'),
  sexo: yup.mixed().oneOf(['M', 'F', 'Otro']).required('Seleccione el sexo'),
  estadoCivil: yup.string().trim().required('Seleccione el estado civil'),
  nacionalidad: yup
    .string()
    .trim()
    .max(60, 'La nacionalidad no debe superar 60 caracteres')
    .required('La nacionalidad es obligatoria'),
  fotografia: yup.string().trim().max(500, 'La ruta de fotografia no debe superar 500 caracteres').optional(),
})

export const graduateWizardStepTwoSchema = yup.object({
  correoPersonal: yup
    .string()
    .trim()
    .max(100, 'El correo personal no debe superar 100 caracteres')
    .email('Ingrese un correo valido')
    .required('El correo personal es obligatorio'),
  correoInstitucional: yup
    .string()
    .transform(value => {
      const trimmed = typeof value === 'string' ? value.trim() : value

      return trimmed === '' ? null : trimmed
    })
    .nullable()
    .max(100, 'El correo institucional no debe superar 100 caracteres')
    .email('Ingrese un correo institucional valido')
    .optional(),
  celular: yup.string().matches(phoneRegex, 'El celular debe iniciar con 9 y tener 9 digitos').required('El celular es obligatorio'),
  direccionActual: yup
    .string()
    .trim()
    .max(150, 'La direccion actual no debe superar 150 caracteres')
    .required('La direccion actual es obligatoria'),
  ciudad: yup.string().trim().max(80, 'La ciudad no debe superar 80 caracteres').required('La ciudad es obligatoria'),
  departamento: yup
    .string()
    .trim()
    .max(80, 'El departamento no debe superar 80 caracteres')
    .required('El departamento es obligatorio'),
  paisResidencia: yup
    .string()
    .trim()
    .max(80, 'El pais de residencia no debe superar 80 caracteres')
    .required('El pais de residencia es obligatorio'),
  linkedin: optionalUrl(255, 'Ingrese una URL valida'),
  portafolio: optionalUrl(255, 'Ingrese una URL valida'),
})

export const graduateWizardStepThreeSchema = yup.object({
  facultadId: yup.number().integer().positive().required('La facultad es obligatoria'),
  escuelaProfesionalId: yup.number().integer().positive().required('La escuela profesional es obligatoria'),
  fechaIngreso: yup
    .string()
    .required('La fecha de ingreso es obligatoria'),
  fechaEgreso: yup
    .string()
    .required('La fecha de egreso es obligatoria')
    .test('is-after-ingreso', 'La fecha de egreso debe ser mayor o igual a la fecha de ingreso', (value, context) => {
      if (!value)
        return true

      const ingreso = context.parent.fechaIngreso
      if (!ingreso)
        return true

      return new Date(value) >= new Date(ingreso)
    }),
  grados: yup.array().of(degreeCollectionItemSchema).optional(),
  idiomas: yup.array().of(languageCollectionItemSchema).optional(),
})

export const graduateWizardStepFourSchema = yup.object({})
