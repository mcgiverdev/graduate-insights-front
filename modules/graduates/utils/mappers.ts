import type {
  Graduate,
  GraduateApiResponse,
  GraduateFormValues,
  GraduatePayload,
} from '../types'

const formatDate = (value?: string | null) => {
  if (!value)
    return ''

  return value.split('T')[0]
}

export const toGraduate = (graduate: GraduateApiResponse): Graduate => ({
  graduateId: Number(graduate.graduate_id),
  userId: Number(graduate.user_id),
  nombres: graduate.nombres,
  apellidos: graduate.apellidos,
  fechaNacimiento: graduate.fecha_nacimiento ?? '',
  genero: graduate.genero,
  correo: graduate.correo,
  estado: graduate.estado,
  dni: graduate.dni,
  celular: graduate.celular,
  fechaInicio: graduate.fecha_inicio ?? '',
  fechaFin: graduate.fecha_fin ?? '',
  cv: graduate.cv ?? undefined,
  cvPath: graduate.cv_path ?? null,
  contrasena: graduate.contrasena ?? undefined,
})

export const toFormValues = (graduate?: Graduate | null): GraduateFormValues => ({
  nombres: graduate?.nombres ?? '',
  apellidos: graduate?.apellidos ?? '',
  fechaNacimiento: formatDate(graduate?.fechaNacimiento),
  genero: graduate?.genero ?? 'M',
  correo: graduate?.correo ?? '',
  dni: graduate?.dni ?? '',
  celular: graduate?.celular ?? '',
  contrasena: graduate?.contrasena ?? '',
  fechaInicio: formatDate(graduate?.fechaInicio),
  fechaFin: formatDate(graduate?.fechaFin),
  cvPath: graduate?.cvPath ?? '',
})

export const toPayload = (values: GraduateFormValues): GraduatePayload => ({
  nombres: values.nombres.trim(),
  apellidos: values.apellidos.trim(),
  fecha_nacimiento: values.fechaNacimiento,
  genero: values.genero,
  correo: values.correo.trim(),
  dni: values.dni.trim(),
  celular: values.celular.trim(),
  contrasena: values.contrasena,
  fecha_inicio: values.fechaInicio,
  fecha_fin: values.fechaFin,
  cv_path: values.cvPath,
})
