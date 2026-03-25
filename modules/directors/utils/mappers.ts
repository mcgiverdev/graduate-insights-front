import type {
  Director,
  DirectorApiResponse,
  DirectorFormValues,
  DirectorPayload,
} from '../types'

const normalizeDate = (value?: string | null) => {
  if (!value)
    return ''

  return value.split('T')[0]
}

export const toDirector = (director: DirectorApiResponse): Director => ({
  directorId: director.director_id,
  userId: director.user_id,
  nombres: director.nombres,
  apellidos: director.apellidos,
  fechaNacimiento: director.fecha_nacimiento ?? '',
  genero: director.genero,
  correo: director.correo,
  estado: director.estado,
  dni: director.dni,
  celular: director.celular,
  cargo: director.cargo ?? '',
  contrasena: director.contrasena,
})

export const toFormValues = (director?: Director | null): DirectorFormValues => ({
  nombres: director?.nombres ?? '',
  apellidos: director?.apellidos ?? '',
  fechaNacimiento: normalizeDate(director?.fechaNacimiento),
  genero: director?.genero ?? 'M',
  correo: director?.correo ?? '',
  dni: director?.dni ?? '',
  celular: director?.celular ?? '',
  cargo: director?.cargo ?? '',
  contrasena: '',
})

export const toPayload = (values: DirectorFormValues): DirectorPayload => ({
  nombres: values.nombres.trim(),
  apellidos: values.apellidos.trim(),
  fecha_nacimiento: values.fechaNacimiento,
  genero: values.genero,
  correo: values.correo.trim(),
  dni: values.dni.trim(),
  celular: values.celular.trim(),
  cargo: values.cargo,
  contrasena: values.contrasena,
})
