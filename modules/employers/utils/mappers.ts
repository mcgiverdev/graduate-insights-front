import type {
  Employer,
  EmployerApiResponse,
  EmployerFormValues,
  EmployerPayload,
} from '../types'

const normalizeDate = (value?: string | null) => {
  if (!value)
    return ''

  return value.split('T')[0]
}

export const toEmployer = (employer: EmployerApiResponse): Employer => ({
  employerId: employer.employer_id,
  userId: employer.user_id,
  nombres: employer.nombres,
  apellidos: employer.apellidos,
  fechaNacimiento: employer.fecha_nacimiento ?? '',
  genero: employer.genero,
  correo: employer.correo,
  estado: employer.estado,
  dni: employer.dni,
  celular: employer.celular,
  ruc: employer.ruc,
  razonSocial: employer.razon_social,
  contrasena: employer.contrasena,
})

export const toFormValues = (employer?: Employer | null): EmployerFormValues => ({
  nombres: employer?.nombres ?? '',
  apellidos: employer?.apellidos ?? '',
  fechaNacimiento: normalizeDate(employer?.fechaNacimiento),
  genero: employer?.genero ?? 'M',
  correo: employer?.correo ?? '',
  dni: employer?.dni ?? '',
  celular: employer?.celular ?? '',
  ruc: employer?.ruc ?? '',
  razonSocial: employer?.razonSocial ?? '',
  contrasena: employer?.contrasena ?? '',
})

export const toPayload = (values: EmployerFormValues): EmployerPayload => ({
  nombres: values.nombres.trim(),
  apellidos: values.apellidos.trim(),
  fecha_nacimiento: values.fechaNacimiento,
  genero: values.genero,
  correo: values.correo.trim(),
  dni: values.dni.trim(),
  celular: values.celular.trim(),
  ruc: values.ruc.trim(),
  razon_social: values.razonSocial.trim(),
  contrasena: values.contrasena,
})
