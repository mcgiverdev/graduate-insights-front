export type Gender = 'M' | 'F' | 'Otro'

export interface ProfileApiResponse {
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string | null
  genero: Gender
  correo: string
  estado?: string
  dni: string
  celular: string
  contrasena?: string | null
}

export interface Profile {
  userId: number
  nombres: string
  apellidos: string
  fechaNacimiento: string | null
  genero: Gender
  correo: string
  estado?: string
  dni: string
  celular: string
  contrasena?: string | null
}

export interface ProfileFormValues {
  nombres: string
  apellidos: string
  correo: string
  dni: string
  celular: string
  genero: Gender
  fechaNacimiento: string
}

export interface ProfilePayload {
  nombres: string
  apellidos: string
  correo: string
  dni: string
  celular: string
  genero: Gender
  fecha_nacimiento: string | null
}
