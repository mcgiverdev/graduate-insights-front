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
  direccionActual: graduate.direccion_actual ?? '',
  ciudad: graduate.ciudad ?? '',
  departamento: graduate.departamento ?? '',
  paisResidencia: graduate.pais_residencia ?? '',
  linkedin: graduate.linkedin ?? '',
  portafolio: graduate.portafolio ?? '',
  facultad: graduate.facultad ?? '',
  escuelaProfesional: graduate.escuela_profesional ?? '',
  escuelaProfesionalId: graduate.escuela_profesional_id ?? undefined,
  anioIngreso: graduate.anio_ingreso ?? '',
  anioEgreso: graduate.anio_egreso ?? '',
  gradoObtenido: graduate.grado_obtenido ?? '',
  bachillerFecha: graduate.bachiller_fecha ?? '',
  bachillerUniversidad: graduate.bachiller_universidad ?? '',
  tituloProfesionalFecha: graduate.titulo_profesional_fecha ?? '',
  tituloProfesionalUniversidad: graduate.titulo_profesional_universidad ?? '',
  maestriaFecha: graduate.maestria_fecha ?? '',
  maestriaUniversidad: graduate.maestria_universidad ?? '',
  doctoradoFecha: graduate.doctorado_fecha ?? '',
  doctoradoUniversidad: graduate.doctorado_universidad ?? '',
  otroGradoNombre: graduate.otro_grado_nombre ?? '',
  otroGradoFecha: graduate.otro_grado_fecha ?? '',
  otroGradoUniversidad: graduate.otro_grado_universidad ?? '',
  modalidadTitulacion: graduate.modalidad_titulacion ?? '',
  modalidadTitulacionOtro: graduate.modalidad_titulacion_otro ?? '',
  idiomaNombre: graduate.idioma_nombre ?? '',
  idiomaNivel: graduate.idioma_nivel ?? '',
  idiomaFechaInicio: graduate.idioma_fecha_inicio ?? '',
  idiomaFechaFin: graduate.idioma_fecha_fin ?? '',
  idiomaAprendizaje: graduate.idioma_aprendizaje ?? '',
  grados: graduate.grados ?? [],
  idiomas: graduate.idiomas ?? [],
  fechaInicio: graduate.fecha_inicio ?? '',
  fechaFin: graduate.fecha_fin ?? '',
  cv: graduate.cv ?? undefined,
  cvPath: graduate.cv_path ?? null,
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
  fechaInicio: formatDate(graduate?.fechaInicio),
  fechaFin: formatDate(graduate?.fechaFin),
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

  if (values.fechaInicio)
    payload.fecha_inicio = values.fechaInicio

  if (values.fechaFin)
    payload.fecha_fin = values.fechaFin

  if (values.cvPath)
    payload.cv_path = values.cvPath

  return payload
}
