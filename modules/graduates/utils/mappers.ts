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
  codigoUniversitario: graduate.codigo_universitario ?? '',
  nombres: graduate.nombres,
  apellidos: graduate.apellidos,
  fechaNacimiento: graduate.fecha_nacimiento ?? '',
  genero: graduate.genero,
  estadoCivil: graduate.estado_civil ?? '',
  nacionalidad: graduate.nacionalidad ?? '',
  correo: graduate.correo,
  correoInstitucional: graduate.correo_institucional ?? '',
  estado: graduate.estado,
  dni: graduate.dni,
  celular: graduate.celular,
  direccionActual: graduate.direccion_actual ?? undefined,
  ciudad: graduate.ciudad ?? undefined,
  departamento: graduate.departamento ?? undefined,
  provincia: graduate.provincia ?? undefined,
  distrito: graduate.distrito ?? undefined,
  paisResidencia: graduate.pais_residencia ?? undefined,
  viveEnPeru: graduate.vive_en_peru ?? true,
  linkedin: graduate.linkedin ?? '',
  portafolio: graduate.portafolio ?? '',
  escuelaProfesionalId: graduate.escuela_profesional_id ?? undefined,
  anioIngreso: graduate.anio_ingreso ?? '',
  anioEgreso: graduate.anio_egreso ?? '',
  grados: graduate.grados ?? [],
  idiomas: graduate.idiomas ?? [],
  formacionesComplementarias: graduate.formaciones_complementarias ?? [],
  trayectoriasLaborales: graduate.trayectorias_laborales ?? [],
  cvPath: graduate.cv_path ?? null,
  fotoPath: graduate.foto_path ?? null,
  contrasena: graduate.contrasena ?? undefined,
  validated: Boolean(graduate.validated ?? true),
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
  cvPath: graduate?.cvPath ?? '',
})

export const toPayload = (values: GraduateFormValues): GraduatePayload => {
  const normalizedDni = values.dni.trim()

  const payload: GraduatePayload = {
    nombres: values.nombres.trim(),
    apellidos: values.apellidos.trim(),
    fecha_nacimiento: values.fechaNacimiento,
    genero: values.genero,
    correo: values.correo.trim(),
    dni: normalizedDni,
    celular: values.celular.trim(),
    contrasena: values.contrasena?.trim() || normalizedDni,
  }

  if (values.cvPath)
    payload.cv_path = values.cvPath

  return payload
}
