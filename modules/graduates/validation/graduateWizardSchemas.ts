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

const complementaryTrainingCollectionItemSchema = yup.object({
  nombreCurso: optionalText(150),
  institucion: optionalText(150),
  fechaInicio: yup.string().optional(),
  fechaFin: yup.string().optional().test(
    'is-after-training-item-start',
    'La fecha fin de la formacion debe ser mayor o igual a la fecha de inicio',
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
  'training-item-name-required-when-filled',
  'Ingrese el nombre del curso',
  value => {
    if (!value)
      return true

    const hasAny = Boolean(value.institucion || value.fechaInicio || value.fechaFin)
    if (!hasAny)
      return true

    return Boolean(value.nombreCurso)
  },
)

const workTrajectoryCollectionItemSchema = yup.object({
  empresa: optionalText(150),
  cargo: optionalText(150),
  modalidad: optionalText(80),
  fechaInicio: yup.string().optional(),
  fechaFin: yup.string().optional().test(
    'is-after-work-item-start',
    'La fecha fin de la trayectoria debe ser mayor o igual a la fecha de inicio',
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
  'work-item-required-fields-when-filled',
  'Complete empresa, cargo y fecha de inicio de la trayectoria',
  value => {
    if (!value)
      return true

    const hasAny = Boolean(value.empresa || value.cargo || value.modalidad || value.fechaInicio || value.fechaFin)
    if (!hasAny)
      return true

    return Boolean(value.empresa && value.cargo && value.fechaInicio)
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
  viveEnPeru: yup.boolean().optional(),
  direccionActual: yup.string().trim().max(150, 'La direccion actual no debe superar 150 caracteres').optional(),
  departamento: yup.string().trim().max(80, 'El departamento no debe superar 80 caracteres').optional(),
  provincia: yup.string().trim().max(80, 'La provincia no debe superar 80 caracteres').optional(),
  distrito: yup.string().trim().max(80, 'El distrito no debe superar 80 caracteres').optional(),
  paisResidencia: yup.string().trim().max(80, 'El pais de residencia no debe superar 80 caracteres').optional(),
  linkedin: optionalUrl(255, 'Ingrese una URL valida'),
  anioIngreso: yup
    .string()
    .transform(v => (typeof v === 'string' ? v.trim() : v))
    .nullable()
    .matches(/^\d{4}$|^$/, 'Ingrese un año valido (4 digitos)')
    .optional(),
  anioEgreso: yup
    .string()
    .transform(v => (typeof v === 'string' ? v.trim() : v))
    .nullable()
    .matches(/^\d{4}$|^$/, 'Ingrese un año valido (4 digitos)')
    .optional()
    .test(
      'anio-egreso-after-ingreso',
      'El año de egreso no puede ser anterior al año de ingreso',
      function (value) {
        const { anioIngreso } = this.parent
        if (!value || !anioIngreso) return true

        return parseInt(value) >= parseInt(anioIngreso)
      },
    ),
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

export const graduateWizardStepFiveSchema = yup.object({
  formacionesComplementarias: yup.array().of(complementaryTrainingCollectionItemSchema).optional(),
})

export const graduateWizardStepSixSchema = yup.object({
  trayectoriasLaborales: yup.array().of(workTrajectoryCollectionItemSchema).optional().test(
    'single-active-work-trajectory',
    'Solo se permite una trayectoria laboral activa',
    value => {
      if (!value)
        return true

      const activeItems = value.filter(item => {
        if (!item)
          return false

        const hasAny = Boolean(item.empresa || item.cargo || item.modalidad || item.fechaInicio || item.fechaFin)
        if (!hasAny)
          return false

        return !item.fechaFin
      })

      return activeItems.length <= 1
    },
  ),
})
