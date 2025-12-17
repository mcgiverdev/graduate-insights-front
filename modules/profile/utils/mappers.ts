import type { Profile, ProfileApiResponse, ProfileFormValues, ProfilePayload } from '../types'

const normalizeDateInput = (value?: string | null) => {
  if (!value)
    return ''

  const [datePart] = value.split('T')
  return datePart ?? ''
}

export const toProfile = (payload: ProfileApiResponse): Profile => ({
  userId: payload.user_id,
  nombres: payload.nombres,
  apellidos: payload.apellidos,
  fechaNacimiento: payload.fecha_nacimiento,
  genero: payload.genero,
  correo: payload.correo,
  estado: payload.estado,
  dni: payload.dni,
  celular: payload.celular,
  contrasena: payload.contrasena,
})

export const toFormValues = (profile?: Profile | null): ProfileFormValues => ({
  nombres: profile?.nombres ?? '',
  apellidos: profile?.apellidos ?? '',
  correo: profile?.correo ?? '',
  dni: profile?.dni ?? '',
  celular: profile?.celular ?? '',
  genero: profile?.genero ?? 'M',
  fechaNacimiento: normalizeDateInput(profile?.fechaNacimiento),
})

export const toPayload = (values: ProfileFormValues, password: string): ProfilePayload => ({
  nombres: values.nombres.trim(),
  apellidos: values.apellidos.trim(),
  correo: values.correo.trim(),
  dni: values.dni.trim(),
  celular: values.celular.trim(),
  genero: values.genero,
  fecha_nacimiento: values.fechaNacimiento ? values.fechaNacimiento : null,
  contrasena: password,
})
