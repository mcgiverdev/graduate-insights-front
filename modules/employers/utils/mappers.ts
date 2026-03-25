import type {
  Employer,
  EmployerApiResponse,
  EmployerFormValues,
  EmployerPayload,
} from '../types'

export const toEmployer = (employer: EmployerApiResponse): Employer => ({
  employerId: employer.employer_id,
  userId: employer.user_id,
  nombres: employer.nombres,
  apellidos: employer.apellidos,
  correo: employer.correo,
  estado: employer.estado,
  celular: employer.celular,
  ruc: employer.ruc,
  razonSocial: employer.razon_social,
  direccion: employer.direccion ?? '',
  resumenEmpresa: employer.resumen_empresa ?? '',
  contrasena: employer.contrasena,
})

export const toFormValues = (employer?: Employer | null): EmployerFormValues => ({
  nombres: employer?.nombres ?? '',
  apellidos: employer?.apellidos ?? '',
  correo: employer?.correo ?? '',
  celular: employer?.celular ?? '',
  ruc: employer?.ruc ?? '',
  razonSocial: employer?.razonSocial ?? '',
  direccion: employer?.direccion ?? '',
  resumenEmpresa: employer?.resumenEmpresa ?? '',
  contrasena: '',
})

export const toPayload = (values: EmployerFormValues): EmployerPayload => ({
  nombres: values.nombres.trim(),
  apellidos: values.apellidos.trim(),
  correo: values.correo.trim(),
  celular: values.celular.trim(),
  ruc: values.ruc.trim(),
  razon_social: values.razonSocial.trim(),
  direccion: values.direccion.trim(),
  resumen_empresa: values.resumenEmpresa.trim(),
  contrasena: values.contrasena,
})
