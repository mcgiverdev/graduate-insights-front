export type Gender = 'M' | 'F' | 'Otro'
export type CivilStatus = 'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)' | 'Conviviente'
export type LanguageLevel = 'Basico' | 'Intermedio' | 'Avanzado'
export type DegreeMode = 'Examen de suficiencia' | 'Tesis' | 'Otros'

export interface FacultyCatalogItem {
  id: number
  nombre: string
}

export interface ProfessionalSchoolCatalogItem {
  id: number
  facultadId: number
  nombre: string
}

export interface CatalogOptionItem {
  id: number
  codigo?: string
  nombre: string
}

export interface GraduateTitulationPayload {
  modalidad_titulacion_id?: number
  modalidad_otro?: string
}

export interface GraduateAcademicDegreePayload {
  tipo_grado_id?: number
  universidad_id?: number
  fecha_grado?: string
  otro_grado_nombre?: string
  titulacion?: GraduateTitulationPayload
}

export interface GraduateLanguagePayload {
  idioma_id?: number
  nivel?: string
  fecha_inicio?: string
  fecha_fin?: string
  aprendizaje?: string
}

export interface Graduate {
  graduateId: number
  userId: number
  codigoUniversitario: string
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  estadoCivil: CivilStatus | ''
  nacionalidad: string
  correo: string
  correoInstitucional: string
  estado: string
  dni: string
  celular: string
  direccionActual: string
  ciudad: string
  departamento: string
  paisResidencia: string
  linkedin: string
  portafolio: string
  facultad: string
  escuelaProfesional: string
  escuelaProfesionalId?: number
  anioIngreso: string
  anioEgreso: string
  gradoObtenido: string
  bachillerFecha: string
  bachillerUniversidad: string
  tituloProfesionalFecha: string
  tituloProfesionalUniversidad: string
  maestriaFecha: string
  maestriaUniversidad: string
  doctoradoFecha: string
  doctoradoUniversidad: string
  otroGradoNombre: string
  otroGradoFecha: string
  otroGradoUniversidad: string
  modalidadTitulacion: DegreeMode | ''
  modalidadTitulacionOtro: string
  idiomaNombre: string
  idiomaNivel: LanguageLevel | ''
  idiomaFechaInicio: string
  idiomaFechaFin: string
  idiomaAprendizaje: string
  grados?: GraduateAcademicDegreePayload[]
  idiomas?: GraduateLanguagePayload[]
  fechaInicio: string
  fechaFin: string
  cv?: string
  cvPath?: string | null
  contrasena?: string
  validated: boolean
}

export interface GraduateApiResponse {
  graduate_id: number
  user_id: number
  codigo_universitario?: string | null
  nombres: string
  apellidos: string
  fecha_nacimiento: string | null
  genero: Gender
  estado_civil?: CivilStatus | null
  nacionalidad?: string | null
  correo: string
  correo_institucional?: string | null
  estado: string
  dni: string
  celular: string
  direccion_actual?: string | null
  ciudad?: string | null
  departamento?: string | null
  pais_residencia?: string | null
  linkedin?: string | null
  portafolio?: string | null
  facultad?: string | null
  escuela_profesional?: string | null
  escuela_profesional_id?: number | null
  anio_ingreso?: string | null
  anio_egreso?: string | null
  grado_obtenido?: string | null
  bachiller_fecha?: string | null
  bachiller_universidad?: string | null
  titulo_profesional_fecha?: string | null
  titulo_profesional_universidad?: string | null
  maestria_fecha?: string | null
  maestria_universidad?: string | null
  doctorado_fecha?: string | null
  doctorado_universidad?: string | null
  otro_grado_nombre?: string | null
  otro_grado_fecha?: string | null
  otro_grado_universidad?: string | null
  modalidad_titulacion?: DegreeMode | null
  modalidad_titulacion_otro?: string | null
  idioma_nombre?: string | null
  idioma_nivel?: LanguageLevel | null
  idioma_fecha_inicio?: string | null
  idioma_fecha_fin?: string | null
  idioma_aprendizaje?: string | null
  grados?: GraduateAcademicDegreePayload[] | null
  idiomas?: GraduateLanguagePayload[] | null
  fecha_inicio: string | null
  fecha_fin: string | null
  cv?: string | null
  cv_path?: string | null
  contrasena?: string | null
  validated?: boolean | null
}

export interface GraduateCreateResponse {
  graduateId?: number
  graduate_id?: number
}

export interface GraduateFilters {
  page?: number
  size?: number
  search?: string
  validated?: boolean
}

export interface GraduateFormValues {
  nombres: string
  apellidos: string
  fechaNacimiento: string
  genero: Gender
  correo: string
  dni: string
  celular: string
  contrasena?: string
  fechaInicio?: string
  fechaFin?: string
  cvPath?: string
}

export interface GraduatePayload {
  codigo_universitario?: string
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: Gender
  estado_civil?: CivilStatus
  nacionalidad?: string
  correo: string
  correo_institucional?: string
  dni: string
  celular: string
  direccion_actual?: string
  ciudad?: string
  departamento?: string
  pais_residencia?: string
  linkedin?: string
  portafolio?: string
  facultad?: string
  escuela_profesional?: string
  escuela_profesional_id?: number
  anio_ingreso?: string
  anio_egreso?: string
  grado_obtenido?: string
  bachiller_fecha?: string
  bachiller_universidad?: string
  titulo_profesional_fecha?: string
  titulo_profesional_universidad?: string
  maestria_fecha?: string
  maestria_universidad?: string
  doctorado_fecha?: string
  doctorado_universidad?: string
  otro_grado_nombre?: string
  otro_grado_fecha?: string
  otro_grado_universidad?: string
  modalidad_titulacion?: DegreeMode
  modalidad_titulacion_otro?: string
  idioma_nombre?: string
  idioma_nivel?: LanguageLevel
  idioma_fecha_inicio?: string
  idioma_fecha_fin?: string
  idioma_aprendizaje?: string
  grados?: GraduateAcademicDegreePayload[]
  idiomas?: GraduateLanguagePayload[]
  contrasena: string
  fecha_inicio?: string
  fecha_fin?: string
  cv_path?: string
}

export interface GraduateWizardValues {
  codigoUniversitario: string
  nombres: string
  apellidos: string
  dni: string
  fechaNacimiento: string
  sexo: Gender
  estadoCivil: CivilStatus | ''
  nacionalidad: string
  fotografia?: string

  correoPersonal: string
  correoInstitucional?: string
  celular: string
  direccionActual: string
  ciudad: string
  departamento: string
  paisResidencia: string
  linkedin?: string
  portafolio?: string

  facultad: string
  escuelaProfesional: string
  facultadId?: number
  escuelaProfesionalId?: number
  fechaIngreso?: string
  fechaEgreso?: string
  bachillerFecha?: string
  bachillerUniversidad?: string
  tituloProfesionalFecha?: string
  tituloProfesionalUniversidad?: string
  maestriaFecha?: string
  maestriaUniversidad?: string
  doctoradoFecha?: string
  doctoradoUniversidad?: string
  otroGradoNombre?: string
  otroGradoFecha?: string
  otroGradoUniversidad?: string
  modalidadTitulacion: DegreeMode | ''
  modalidadTitulacionOtro?: string
  idiomaNombre?: string
  idiomaNivel: LanguageLevel | ''
  idiomaFechaInicio?: string
  idiomaFechaFin?: string
  idiomaAprendizaje?: string
  grados: GraduateWizardDegreeItem[]
  idiomas: GraduateWizardLanguageItem[]
}

export interface GraduateWizardDegreeItem {
  tipoGradoId?: number
  universidadId?: number
  fechaGrado?: string
  otroGradoNombre?: string
  modalidadTitulacionId?: number
  modalidadTitulacionOtro?: string
}

export interface GraduateWizardLanguageItem {
  idiomaId?: number
  nivel?: LanguageLevel | ''
  fechaInicio?: string
  fechaFin?: string
  aprendizaje?: string
}
