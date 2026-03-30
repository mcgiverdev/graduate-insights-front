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

export interface GraduateComplementaryTrainingPayload {
  nombre_curso?: string
  institucion?: string
  fecha_inicio?: string
  fecha_fin?: string
}

export interface GraduateWorkTrajectoryPayload {
  empresa?: string
  cargo?: string
  modalidad?: string
  fecha_inicio?: string
  fecha_fin?: string
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
  direccionActual?: string
  ciudad?: string
  departamento?: string
  provincia?: string
  distrito?: string
  paisResidencia?: string
  viveEnPeru?: boolean
  linkedin: string
  portafolio: string
  escuelaProfesionalId?: number
  anioIngreso: string
  anioEgreso: string
  grados?: GraduateAcademicDegreePayload[]
  idiomas?: GraduateLanguagePayload[]
  formacionesComplementarias?: GraduateComplementaryTrainingPayload[]
  trayectoriasLaborales?: GraduateWorkTrajectoryPayload[]
  cvPath?: string | null
  fotoPath?: string | null
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
  provincia?: string | null
  distrito?: string | null
  pais_residencia?: string | null
  vive_en_peru?: boolean | null
  linkedin?: string | null
  portafolio?: string | null
  escuela_profesional_id?: number | null
  anio_ingreso?: string | null
  anio_egreso?: string | null
  grados?: GraduateAcademicDegreePayload[] | null
  idiomas?: GraduateLanguagePayload[] | null
  formaciones_complementarias?: GraduateComplementaryTrainingPayload[] | null
  trayectorias_laborales?: GraduateWorkTrajectoryPayload[] | null
  cv_path?: string | null
  foto_path?: string | null
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
  provincia?: string
  distrito?: string
  pais_residencia?: string
  vive_en_peru?: boolean
  linkedin?: string
  portafolio?: string
  escuela_profesional_id?: number
  anio_ingreso?: string
  anio_egreso?: string
  grados?: GraduateAcademicDegreePayload[]
  idiomas?: GraduateLanguagePayload[]
  formaciones_complementarias?: GraduateComplementaryTrainingPayload[]
  trayectorias_laborales?: GraduateWorkTrajectoryPayload[]
  contrasena: string
  cv_path?: string
  foto_path?: string
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
  fotoPath?: string

  correoPersonal: string
  correoInstitucional?: string
  celular: string
  viveEnPeru: boolean
  direccionActual?: string
  departamento?: string
  provincia?: string
  distrito?: string
  paisResidencia?: string
  linkedin?: string

  facultadId?: number
  escuelaProfesionalId?: number
  anioIngreso?: string
  anioEgreso?: string
  fechaIngreso?: string
  fechaEgreso?: string
  grados: GraduateWizardDegreeItem[]
  idiomas: GraduateWizardLanguageItem[]
  formacionesComplementarias: GraduateWizardComplementaryTrainingItem[]
  trayectoriasLaborales: GraduateWizardWorkTrajectoryItem[]
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

export interface GraduateWizardComplementaryTrainingItem {
  nombreCurso?: string
  institucion?: string
  fechaInicio?: string
  fechaFin?: string
}

export interface GraduateWizardWorkTrajectoryItem {
  empresa?: string
  cargo?: string
  modalidad?: string
  fechaInicio?: string
  fechaFin?: string
}
