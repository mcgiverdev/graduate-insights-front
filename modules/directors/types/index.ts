export type Gender = 'M' | 'F'

export interface Director {
  directorId: number
  userId: number
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  correo: string
  estado: string
  dni: string
  celular: string
  cargo: string
  contrasena?: string
}

export interface DirectorFilters {
  page?: number
  size?: number
  search?: string
}

export interface DirectorFormValues {
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  cargo: string
  contrasena: string
}

export interface DirectorPayload {
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  cargo: string
  contrasena: string
}

export interface DirectorApiResponse {
  director_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: Gender
  correo: string
  estado: string
  dni: string
  celular: string
  cargo: string
  contrasena?: string
}
