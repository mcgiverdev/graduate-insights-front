export type Gender = 'M' | 'F'

export interface Employer {
  employerId: number
  userId: number
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  correo: string
  estado: string
  dni: string
  celular: string
  ruc: string
  razonSocial: string
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
  fechaNacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  ruc: string
  razonSocial: string
  contrasena: string
}

export interface EmployerPayload {
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  ruc: string
  razon_social: string
  contrasena: string
}

export interface EmployerApiResponse {
  employer_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: Gender
  correo: string
  estado: string
  dni: string
  celular: string
  ruc: string
  razon_social: string
  contrasena?: string
}
