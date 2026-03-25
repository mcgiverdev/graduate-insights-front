export interface Employer {
  employerId: number
  userId: number
  nombres: string
  apellidos: string
  correo: string
  estado: string
  celular: string
  ruc: string
  razonSocial: string
  direccion: string
  resumenEmpresa: string
  contrasena?: string
}

export interface EmployerFilters {
  page?: number
  size?: number
  search?: string
}

export interface EmployerFormValues {
  nombres: string
  apellidos: string
  correo: string
  celular: string
  ruc: string
  razonSocial: string
  direccion: string
  resumenEmpresa: string
  contrasena: string
}

export interface EmployerPayload {
  nombres: string
  apellidos: string
  correo: string
  celular: string
  ruc: string
  razon_social: string
  direccion: string
  resumen_empresa: string
  contrasena: string
}

export interface EmployerApiResponse {
  employer_id: number
  user_id: number
  nombres: string
  apellidos: string
  correo: string
  estado: string
  celular: string
  ruc: string
  razon_social: string
  direccion: string
  resumen_empresa: string
  contrasena?: string
}
