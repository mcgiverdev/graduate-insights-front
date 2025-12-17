export type Gender = 'M' | 'F' | 'Otro'

export interface Graduate {
  graduateId: number
  userId: number
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  correo: string
  estado: string
  dni: string
  celular: string
  fechaInicio: string
  fechaFin: string
  cv?: string
  cvPath?: string | null
  contrasena?: string
}

export interface GraduateApiResponse {
  graduate_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string | null
  genero: Gender
  correo: string
  estado: string
  dni: string
  celular: string
  fecha_inicio: string | null
  fecha_fin: string | null
  cv?: string | null
  cv_path?: string | null
  contrasena?: string | null
}

export interface GraduateFilters {
  page?: number
  size?: number
  search?: string
}

export interface GraduateFormValues {
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  contrasena: string
  fechaInicio: string
  fechaFin: string
  cvPath: string
}

export interface GraduatePayload {
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  contrasena: string
  fecha_inicio: string
  fecha_fin: string
  cv_path: string
}
