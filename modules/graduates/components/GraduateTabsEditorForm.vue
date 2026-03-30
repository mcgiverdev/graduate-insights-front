<script setup lang="ts">
/* eslint-disable import/no-unresolved, indent, padding-line-between-statements, arrow-parens, vue/max-attributes-per-line, vue/singleline-html-element-content-newline */
import type { ValidationError } from 'yup'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { departamentoOptions, getDistritos, getProvincias } from '../data/peruGeoData'
import { useRouter } from 'vue-router'
import { useGraduateForm } from '../composables/useGraduateForm'
import { graduateService } from '../services/GraduateService'
import type {
  CatalogOptionItem,
  CivilStatus,
  FacultyCatalogItem,
  Gender,
  Graduate,
  GraduatePayload,
  GraduateWizardComplementaryTrainingItem,
  GraduateWizardDegreeItem,
  GraduateWizardLanguageItem,
  GraduateWizardWorkTrajectoryItem,
  GraduateWizardValues,
  LanguageLevel,
  ProfessionalSchoolCatalogItem,
} from '../types'
import {
  graduateWizardStepFourSchema,
  graduateWizardStepFiveSchema,
  graduateWizardStepOneSchema,
  graduateWizardStepSixSchema,
  graduateWizardStepThreeSchema,
  graduateWizardStepTwoSchema,
} from '../validation/graduateWizardSchemas'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import AppFileField from '@/@core/components/app-form-elements/AppFileField.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  graduateId: number
  fetchFn?: (id: number) => Promise<Graduate | null>
  saveFn?: (payload: GraduatePayload, id: number) => Promise<{ success: boolean; message?: string }>
  backRoute?: string
  pageTitle?: string
  pageSubtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  fetchFn: undefined,
  saveFn: undefined,
  backRoute: undefined,
  pageTitle: 'Editar Graduado',
  pageSubtitle: 'Gestiona informacion personal, contacto y trayectoria academica desde un solo panel.',
})

const router = useRouter()
const { saveGraduate, submitting, serverErrors, clearServerErrors } = useGraduateForm()

const activeTab = ref('datos-basicos')
const localErrors = ref<Record<string, string>>({})
const loadingData = ref(false)
const saving = ref(false)
const formMessage = ref('')
const degreeDialogOpen = ref(false)
const languageDialogOpen = ref(false)
const complementaryTrainingDialogOpen = ref(false)
const workTrajectoryDialogOpen = ref(false)
const degreesTouched = ref(false)
const languagesTouched = ref(false)
const complementaryTrainingsTouched = ref(false)
const workTrajectoriesTouched = ref(false)
const editingDegreeIndex = ref<number | null>(null)
const editingLanguageIndex = ref<number | null>(null)
const editingComplementaryTrainingIndex = ref<number | null>(null)
const editingWorkTrajectoryIndex = ref<number | null>(null)
const facultyOptions = ref<FacultyCatalogItem[]>([])
const professionalSchoolOptions = ref<ProfessionalSchoolCatalogItem[]>([])
const degreeTypeOptions = ref<CatalogOptionItem[]>([])
const titulationModeOptions = ref<CatalogOptionItem[]>([])
const languageCatalogOptions = ref<CatalogOptionItem[]>([])
const universityOptions = ref<CatalogOptionItem[]>([])

const tabItems = [
  { value: 'datos-basicos', title: 'Datos basicos' },
  { value: 'datos-contacto', title: 'Datos de contacto' },
  { value: 'resumen-academico', title: 'Datos academico' },
  { value: 'grados', title: 'Grados' },
  { value: 'idiomas', title: 'Idiomas' },
  { value: 'formacion-complementaria', title: 'Formacion complementaria' },
  { value: 'trayectoria-laboral', title: 'Trayectoria laboral' },
]

const civilStatusOptions: CivilStatus[] = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Conviviente']

const sexOptions: Array<{ title: string; value: Gender }> = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
  { title: 'Otro', value: 'Otro' },
]

const languageLevelOptions: LanguageLevel[] = ['Basico', 'Intermedio', 'Avanzado']

const workModalityOptions = [
  { title: 'Presencial', value: 'Presencial' },
  { title: 'Remoto', value: 'Remoto' },
  { title: 'Híbrido', value: 'Híbrido' },
]

const learningMethodOptions = [
  { title: 'Académico', value: 'Académico' },
  { title: 'Autodidacta', value: 'Autodidacta' },
  { title: 'Inmersión', value: 'Inmersión' },
  { title: 'Nativo', value: 'Nativo' },
]

const createEmptyDegree = (): GraduateWizardDegreeItem => ({
  tipoGradoId: undefined,
  universidadId: undefined,
  fechaGrado: '',
  otroGradoNombre: '',
  modalidadTitulacionId: undefined,
  modalidadTitulacionOtro: '',
})

const createEmptyLanguage = (): GraduateWizardLanguageItem => ({
  idiomaId: undefined,
  nivel: '',
  fechaInicio: '',
  fechaFin: '',
  aprendizaje: '',
})

const createEmptyComplementaryTraining = (): GraduateWizardComplementaryTrainingItem => ({
  nombreCurso: '',
  institucion: '',
  fechaInicio: '',
  fechaFin: '',
})

const createEmptyWorkTrajectory = (): GraduateWizardWorkTrajectoryItem => ({
  empresa: '',
  cargo: '',
  modalidad: '',
  fechaInicio: '',
  fechaFin: '',
})

const normalizeOptionalText = (value?: string) => value?.trim().toLowerCase() || ''

const isTituladoDegreeType = (degreeTypeId?: number) => degreeTypeOptions.value
  .find(item => item.id === degreeTypeId)?.codigo === 'TITULADO'

const isOtroType = (tipoGradoId?: number) =>
  degreeTypeOptions.value.find(o => o.id === tipoGradoId)?.codigo === 'OTRO'

const isOtroDegreeType = computed(() =>
  degreeTypeOptions.value.find(item => item.id === degreeDraft.value.tipoGradoId)?.codigo === 'OTRO',
)

const degreeDraft = ref<GraduateWizardDegreeItem>(createEmptyDegree())
const languageDraft = ref<GraduateWizardLanguageItem>(createEmptyLanguage())
const complementaryTrainingDraft = ref<GraduateWizardComplementaryTrainingItem>(createEmptyComplementaryTraining())
const workTrajectoryDraft = ref<GraduateWizardWorkTrajectoryItem>(createEmptyWorkTrajectory())

const values = ref<GraduateWizardValues>({
  codigoUniversitario: '',
  nombres: '',
  apellidos: '',
  dni: '',
  fechaNacimiento: '',
  sexo: 'M',
  estadoCivil: '',
  nacionalidad: '',
  fotografia: '',

  correoPersonal: '',
  correoInstitucional: '',
  celular: '',
  viveEnPeru: true,
  direccionActual: '',
  departamento: '',
  provincia: '',
  distrito: '',
  paisResidencia: '',
  linkedin: '',
  portafolio: '',

  facultadId: undefined,
  escuelaProfesionalId: undefined,
  fechaIngreso: '',
  fechaEgreso: '',
  grados: [],
  idiomas: [],
  formacionesComplementarias: [],
  trayectoriasLaborales: [],
})

// ── Geo cascada ───────────────────────────────────────────────────────────────
const provinciaOptions = computed(() => getProvincias(values.value.departamento ?? ''))
const distritoOptions = computed(() => getDistritos(values.value.departamento ?? '', values.value.provincia ?? ''))

const skipGeoReset = ref(false)

watch(() => values.value.viveEnPeru, (vivePeru) => {
  if (skipGeoReset.value) return
  if (!vivePeru) {
    values.value.departamento = ''
    values.value.provincia = ''
    values.value.distrito = ''
  }
  else {
    values.value.paisResidencia = ''
  }
})

watch(() => values.value.departamento, () => {
  if (skipGeoReset.value) return
  values.value.provincia = ''
  values.value.distrito = ''
})

watch(() => values.value.provincia, () => {
  if (skipGeoReset.value) return
  values.value.distrito = ''
})

function isDegreeDuplicate(draft: GraduateWizardDegreeItem, skipIndex: number | null) {
  return values.value.grados.some((item, index) => {
    if (skipIndex !== null && index === skipIndex)
      return false

    return (item.tipoGradoId || null) === (draft.tipoGradoId || null)
      && (item.universidadId || null) === (draft.universidadId || null)
      && (item.fechaGrado || '') === (draft.fechaGrado || '')
      && normalizeOptionalText(item.otroGradoNombre) === normalizeOptionalText(draft.otroGradoNombre)
  })
}

function isLanguageDuplicate(draft: GraduateWizardLanguageItem, skipIndex: number | null) {
  return values.value.idiomas.some((item, index) => {
    if (skipIndex !== null && index === skipIndex)
      return false

    return (item.idiomaId || null) === (draft.idiomaId || null)
      && (item.nivel || '') === (draft.nivel || '')
      && (item.fechaInicio || '') === (draft.fechaInicio || '')
  })
}

function isComplementaryTrainingDuplicate(
  draft: GraduateWizardComplementaryTrainingItem,
  skipIndex: number | null,
) {
  return values.value.formacionesComplementarias.some((item, index) => {
    if (skipIndex !== null && index === skipIndex)
      return false

    return normalizeOptionalText(item.nombreCurso) === normalizeOptionalText(draft.nombreCurso)
      && normalizeOptionalText(item.institucion) === normalizeOptionalText(draft.institucion)
      && (item.fechaInicio || '') === (draft.fechaInicio || '')
  })
}

function isWorkTrajectoryDuplicate(draft: GraduateWizardWorkTrajectoryItem, skipIndex: number | null) {
  return values.value.trayectoriasLaborales.some((item, index) => {
    if (skipIndex !== null && index === skipIndex)
      return false

    return normalizeOptionalText(item.empresa) === normalizeOptionalText(draft.empresa)
      && normalizeOptionalText(item.cargo) === normalizeOptionalText(draft.cargo)
      && (item.fechaInicio || '') === (draft.fechaInicio || '')
  })
}

const buildDegreesPayload = () => values.value.grados
  .filter(item => Boolean(item.fechaGrado || item.otroGradoNombre || item.modalidadTitulacionOtro || item.tipoGradoId || item.universidadId || item.modalidadTitulacionId))
  .map(item => ({
    tipo_grado_id: item.tipoGradoId || undefined,
    universidad_id: item.universidadId || undefined,
    fecha_grado: item.fechaGrado || undefined,
    otro_grado_nombre: isOtroType(item.tipoGradoId) ? item.otroGradoNombre?.trim() || undefined : undefined,
    titulacion: isTituladoDegreeType(item.tipoGradoId) && (item.modalidadTitulacionId || item.modalidadTitulacionOtro?.trim())
      ? {
          modalidad_titulacion_id: item.modalidadTitulacionId || undefined,
          modalidad_otro: item.modalidadTitulacionOtro?.trim() || undefined,
        }
      : undefined,
  }))

const buildLanguagesPayload = () => values.value.idiomas
  .filter(item => Boolean(item.nivel || item.fechaInicio || item.fechaFin || item.aprendizaje || item.idiomaId))
  .map(item => ({
    idioma_id: item.idiomaId || undefined,
    nivel: item.nivel || undefined,
    fecha_inicio: item.fechaInicio || undefined,
    fecha_fin: item.fechaFin || undefined,
    aprendizaje: item.aprendizaje?.trim() || undefined,
  }))

const buildComplementaryTrainingsPayload = () => values.value.formacionesComplementarias
  .filter(item => Boolean(item.nombreCurso || item.institucion || item.fechaInicio || item.fechaFin))
  .map(item => ({
    nombre_curso: item.nombreCurso?.trim() || undefined,
    institucion: item.institucion?.trim() || undefined,
    fecha_inicio: item.fechaInicio || undefined,
    fecha_fin: item.fechaFin || undefined,
  }))

const buildWorkTrajectoriesPayload = () => values.value.trayectoriasLaborales
  .filter(item => Boolean(item.empresa || item.cargo || item.modalidad || item.fechaInicio || item.fechaFin))
  .map(item => ({
    empresa: item.empresa?.trim() || undefined,
    cargo: item.cargo?.trim() || undefined,
    modalidad: item.modalidad?.trim() || undefined,
    fecha_inicio: item.fechaInicio || undefined,
    fecha_fin: item.fechaFin || undefined,
  }))

const normalizeDateValue = (value?: string | null) => {
  if (!value)
    return ''

  if (/^\d{4}$/.test(value))
    return `${value}-01-01`

  return value.split('T')[0]
}

const getYearFromDate = (value?: string) => {
  if (!value)
    return undefined

  return value.slice(0, 4)
}

const wizardPayload = computed<GraduatePayload>(() => {
  const degreesPayload = buildDegreesPayload()
  const languagesPayload = buildLanguagesPayload()
  const complementaryTrainingsPayload = buildComplementaryTrainingsPayload()
  const workTrajectoriesPayload = buildWorkTrajectoriesPayload()

  const payload: GraduatePayload = {
    codigo_universitario: values.value.codigoUniversitario.trim(),
    nombres: values.value.nombres.trim(),
    apellidos: values.value.apellidos.trim(),
    fecha_nacimiento: values.value.fechaNacimiento,
    genero: values.value.sexo,
    estado_civil: values.value.estadoCivil || undefined,
    nacionalidad: values.value.nacionalidad.trim() || undefined,
    correo: values.value.correoPersonal.trim(),
    correo_institucional: values.value.correoInstitucional?.trim() || undefined,
    dni: values.value.dni.trim(),
    celular: values.value.celular.trim(),
    vive_en_peru: values.value.viveEnPeru,
    direccion_actual: values.value.direccionActual?.trim() || undefined,
    departamento: values.value.departamento?.trim() || undefined,
    provincia: values.value.provincia?.trim() || undefined,
    distrito: values.value.distrito?.trim() || undefined,
    pais_residencia: values.value.paisResidencia?.trim() || undefined,
    linkedin: values.value.linkedin?.trim() || undefined,
    portafolio: values.value.portafolio?.trim() || undefined,
    escuela_profesional_id: values.value.escuelaProfesionalId || undefined,
    anio_ingreso: getYearFromDate(values.value.fechaIngreso),
    anio_egreso: getYearFromDate(values.value.fechaEgreso),
    contrasena: values.value.dni.trim(),
    foto_path: values.value.fotografia || undefined,
  }

  if (degreesTouched.value)
    payload.grados = degreesPayload

  if (languagesTouched.value)
    payload.idiomas = languagesPayload

  if (complementaryTrainingsTouched.value)
    payload.formaciones_complementarias = complementaryTrainingsPayload

  if (workTrajectoriesTouched.value)
    payload.trayectorias_laborales = workTrajectoriesPayload

  return payload
})

const getFieldError = (localField: string, backendField?: string): string | undefined => {
  const localError = localErrors.value[localField]
  if (localError)
    return localError

  return serverErrors.value[backendField ?? localField]
}

const hydrateFromGraduate = (graduate: Graduate) => {
  skipGeoReset.value = true
  degreesTouched.value = false
  languagesTouched.value = false
  complementaryTrainingsTouched.value = false
  workTrajectoriesTouched.value = false

  values.value.codigoUniversitario = graduate.codigoUniversitario || ''
  values.value.nombres = graduate.nombres || ''
  values.value.apellidos = graduate.apellidos || ''
  values.value.dni = graduate.dni || ''
  values.value.fechaNacimiento = graduate.fechaNacimiento ? graduate.fechaNacimiento.split('T')[0] : ''
  values.value.sexo = graduate.genero || 'M'
  values.value.estadoCivil = graduate.estadoCivil || ''
  values.value.nacionalidad = graduate.nacionalidad || ''
  values.value.correoPersonal = graduate.correo || ''
  values.value.correoInstitucional = graduate.correoInstitucional || ''
  values.value.celular = graduate.celular || ''
  values.value.viveEnPeru = graduate.viveEnPeru ?? true
  values.value.direccionActual = graduate.direccionActual || ''
  values.value.departamento = graduate.departamento || ''
  values.value.provincia = graduate.provincia || ''
  values.value.distrito = graduate.distrito || ''
  values.value.paisResidencia = graduate.paisResidencia || ''
  values.value.linkedin = graduate.linkedin || ''
  values.value.portafolio = graduate.portafolio || ''
  values.value.escuelaProfesionalId = graduate.escuelaProfesionalId || undefined
  values.value.fechaIngreso = normalizeDateValue(graduate.anioIngreso)
  values.value.fechaEgreso = normalizeDateValue(graduate.anioEgreso)
  values.value.fotografia = graduate.fotoPath || ''

  values.value.grados = (graduate.grados || [])
    .map(item => ({
      tipoGradoId: item.tipo_grado_id || undefined,
      universidadId: item.universidad_id || undefined,
      fechaGrado: item.fecha_grado ? item.fecha_grado.split('T')[0] : '',
      otroGradoNombre: item.otro_grado_nombre || '',
      modalidadTitulacionId: item.titulacion?.modalidad_titulacion_id || undefined,
      modalidadTitulacionOtro: item.titulacion?.modalidad_otro || '',
    }))

  values.value.idiomas = (graduate.idiomas || [])
    .map(item => ({
      idiomaId: item.idioma_id || undefined,
      nivel: (item.nivel as LanguageLevel) || '',
      fechaInicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fechaFin: item.fecha_fin ? item.fecha_fin.split('T')[0] : '',
      aprendizaje: item.aprendizaje || '',
    }))

  values.value.formacionesComplementarias = (graduate.formacionesComplementarias || [])
    .map(item => ({
      nombreCurso: item.nombre_curso || '',
      institucion: item.institucion || '',
      fechaInicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fechaFin: item.fecha_fin ? item.fecha_fin.split('T')[0] : '',
    }))

  values.value.trayectoriasLaborales = (graduate.trayectoriasLaborales || [])
    .map(item => ({
      empresa: item.empresa || '',
      cargo: item.cargo || '',
      modalidad: item.modalidad || '',
      fechaInicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fechaFin: item.fecha_fin ? item.fecha_fin.split('T')[0] : '',
    }))

  nextTick(() => { skipGeoReset.value = false })
}

const openCreateDegreeDialog = () => {
  editingDegreeIndex.value = null
  degreeDraft.value = createEmptyDegree()
  degreeDialogOpen.value = true
}

const openEditDegreeDialog = (index: number) => {
  editingDegreeIndex.value = index
  degreeDraft.value = { ...values.value.grados[index] }
  degreeDialogOpen.value = true
}

const saveDegreeDialog = () => {
  const nextValue = { ...degreeDraft.value }

  if (!isTituladoDegreeType(nextValue.tipoGradoId)) {
    nextValue.modalidadTitulacionId = undefined
    nextValue.modalidadTitulacionOtro = ''
  }

  if (!isOtroDegreeType.value) {
    nextValue.otroGradoNombre = ''
  }

  if (isDegreeDuplicate(nextValue, editingDegreeIndex.value)) {
    formMessage.value = 'Este grado ya fue registrado. Evita duplicar tipo, universidad, fecha y nombre de grado.'

    return
  }

  if (editingDegreeIndex.value === null)
    values.value.grados.push(nextValue)
  else
    values.value.grados.splice(editingDegreeIndex.value, 1, nextValue)

  degreesTouched.value = true
  degreeDialogOpen.value = false
}

const removeDegree = (index: number) => {
  values.value.grados.splice(index, 1)
  degreesTouched.value = true
}

const openCreateLanguageDialog = () => {
  editingLanguageIndex.value = null
  languageDraft.value = createEmptyLanguage()
  languageDialogOpen.value = true
}

const openEditLanguageDialog = (index: number) => {
  editingLanguageIndex.value = index
  languageDraft.value = { ...values.value.idiomas[index] }
  languageDialogOpen.value = true
}

const saveLanguageDialog = () => {
  const nextValue = { ...languageDraft.value }

  if (isLanguageDuplicate(nextValue, editingLanguageIndex.value)) {
    formMessage.value = 'Este idioma ya fue registrado con el mismo nivel y fecha de inicio.'

    return
  }

  if (editingLanguageIndex.value === null)
    values.value.idiomas.push(nextValue)
  else
    values.value.idiomas.splice(editingLanguageIndex.value, 1, nextValue)

  languagesTouched.value = true
  languageDialogOpen.value = false
}

const removeLanguage = (index: number) => {
  values.value.idiomas.splice(index, 1)
  languagesTouched.value = true
}

const openCreateComplementaryTrainingDialog = () => {
  editingComplementaryTrainingIndex.value = null
  complementaryTrainingDraft.value = createEmptyComplementaryTraining()
  complementaryTrainingDialogOpen.value = true
}

const openEditComplementaryTrainingDialog = (index: number) => {
  editingComplementaryTrainingIndex.value = index
  complementaryTrainingDraft.value = { ...values.value.formacionesComplementarias[index] }
  complementaryTrainingDialogOpen.value = true
}

const saveComplementaryTrainingDialog = () => {
  const nextValue = { ...complementaryTrainingDraft.value }

  if (isComplementaryTrainingDuplicate(nextValue, editingComplementaryTrainingIndex.value)) {
    formMessage.value = 'Esta formacion ya fue registrada con el mismo curso, institucion y fecha de inicio.'

    return
  }

  if (editingComplementaryTrainingIndex.value === null)
    values.value.formacionesComplementarias.push(nextValue)
  else
    values.value.formacionesComplementarias.splice(editingComplementaryTrainingIndex.value, 1, nextValue)

  complementaryTrainingsTouched.value = true
  complementaryTrainingDialogOpen.value = false
}

const removeComplementaryTraining = (index: number) => {
  values.value.formacionesComplementarias.splice(index, 1)
  complementaryTrainingsTouched.value = true
}

const openCreateWorkTrajectoryDialog = () => {
  editingWorkTrajectoryIndex.value = null
  workTrajectoryDraft.value = createEmptyWorkTrajectory()
  workTrajectoryDialogOpen.value = true
}

const openEditWorkTrajectoryDialog = (index: number) => {
  editingWorkTrajectoryIndex.value = index
  workTrajectoryDraft.value = { ...values.value.trayectoriasLaborales[index] }
  workTrajectoryDialogOpen.value = true
}

const saveWorkTrajectoryDialog = () => {
  const nextValue = { ...workTrajectoryDraft.value }

  if (isWorkTrajectoryDuplicate(nextValue, editingWorkTrajectoryIndex.value)) {
    formMessage.value = 'Esta trayectoria ya fue registrada con la misma empresa, cargo y fecha de inicio.'

    return
  }

  if (editingWorkTrajectoryIndex.value === null)
    values.value.trayectoriasLaborales.push(nextValue)
  else
    values.value.trayectoriasLaborales.splice(editingWorkTrajectoryIndex.value, 1, nextValue)

  workTrajectoriesTouched.value = true
  workTrajectoryDialogOpen.value = false
}

const removeWorkTrajectory = (index: number) => {
  values.value.trayectoriasLaborales.splice(index, 1)
  workTrajectoriesTouched.value = true
}

const showDegreeTitulationFields = computed(() => isTituladoDegreeType(degreeDraft.value.tipoGradoId))

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const datePart = value.trim().split(/[T ]/)[0]
  if (!datePart) return '-'
  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day) return datePart
  return `${day}/${month}/${year}`
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  const s = formatDate(start)
  const e = formatDate(end)
  if (s === '-' && e === '-') return '-'
  if (e === '-') return s
  return `${s} — ${e}`
}

const degreeRows = computed(() => values.value.grados.map((item, index) => {
  const option = degreeTypeOptions.value.find(o => o.id === item.tipoGradoId)
  const tipoNombre = option?.nombre || '-'
  const isOtro = option?.codigo === 'OTRO'
  const isTitulado = option?.codigo === 'TITULADO'

  const modalidadNombre = titulationModeOptions.value.find(o => o.id === item.modalidadTitulacionId)?.nombre
    || item.modalidadTitulacionOtro?.trim()
    || ''

  let tipo = tipoNombre
  if (isOtro && item.otroGradoNombre?.trim()) {
    tipo = `${tipoNombre}: ${item.otroGradoNombre.trim()}`
  }
  else if (isTitulado && modalidadNombre) {
    tipo = `${tipoNombre} (${modalidadNombre})`
  }

  const universidad = universityOptions.value.find(o => o.id === item.universidadId)?.nombre || '-'

  return {
    index,
    tipo,
    fechaGrado: formatDate(item.fechaGrado),
    universidad,
  }
}))

const languageRows = computed(() => values.value.idiomas.map((item, index) => {
  const idioma = languageCatalogOptions.value.find(option => option.id === item.idiomaId)?.nombre || '-'

  return {
    index,
    idioma,
    nivel: item.nivel || '-',
    aprendizaje: item.aprendizaje || '-',
    vigencia: formatDateRange(item.fechaInicio, item.fechaFin),
  }
}))

const complementaryTrainingRows = computed(() => values.value.formacionesComplementarias.map((item, index) => ({
  index,
  nombreCurso: item.nombreCurso || '-',
  institucion: item.institucion || '-',
  vigencia: formatDateRange(item.fechaInicio, item.fechaFin),
})))

const workTrajectoryRows = computed(() => values.value.trayectoriasLaborales.map((item, index) => ({
  index,
  empresa: item.empresa || '-',
  cargo: item.cargo || '-',
  modalidad: item.modalidad || '-',
  vigencia: formatDateRange(item.fechaInicio, item.fechaFin),
  estado: item.fechaFin ? 'Finalizado' : 'En curso',
})))

const loadFaculties = async () => {
  facultyOptions.value = await graduateService.fetchFaculties()
}

const loadProfessionalSchools = async (facultyId?: number) => {
  professionalSchoolOptions.value = await graduateService.fetchProfessionalSchools(facultyId)
}

const loadAcademicCatalogs = async () => {
  const [degreeTypes, titulationModes, languages, universities] = await Promise.all([
    graduateService.fetchDegreeTypes(),
    graduateService.fetchTitulationModes(),
    graduateService.fetchLanguagesCatalog(),
    graduateService.fetchUniversities(),
  ])

  degreeTypeOptions.value = degreeTypes
  titulationModeOptions.value = titulationModes
  languageCatalogOptions.value = languages
  universityOptions.value = universities
}

const resolveSchoolFacultyId = (school?: Partial<ProfessionalSchoolCatalogItem> & { facultad_id?: number }) =>
  school?.facultadId ?? school?.facultad_id

const syncSelectedSchoolLabels = () => {
  const school = professionalSchoolOptions.value.find(item => item.id === values.value.escuelaProfesionalId)
  if (!school)
    return

  values.value.facultadId = resolveSchoolFacultyId(school)
}

const schemaByTab = [
  graduateWizardStepOneSchema,
  graduateWizardStepTwoSchema,
  graduateWizardStepThreeSchema,
  graduateWizardStepFourSchema,
  graduateWizardStepFourSchema,
  graduateWizardStepFiveSchema,
  graduateWizardStepSixSchema,
]

const validateTab = async (tabIndex: number) => {
  localErrors.value = {}
  formMessage.value = ''
  clearServerErrors()

  try {
    await schemaByTab[tabIndex].validate(values.value, { abortEarly: false })

    return true
  }
  catch (error) {
    const validationError = error as ValidationError
    const fieldErrors: Record<string, string> = {}

    validationError.inner.forEach(issue => {
      if (issue.path && !fieldErrors[issue.path])
        fieldErrors[issue.path] = issue.message
    })

    localErrors.value = fieldErrors
    formMessage.value = validationError.inner.find(issue => issue.message)?.message || 'Revisa los campos obligatorios para continuar.'

    return false
  }
}

const validateAllBeforeSave = async () => {
  for (let tabIndex = 0; tabIndex < tabItems.length; tabIndex += 1) {
    const isValid = await validateTab(tabIndex)
    if (!isValid) {
      activeTab.value = tabItems[tabIndex].value

      return false
    }
  }

  return true
}

const submit = async () => {
  if (loadingData.value || saving.value)
    return

  const valid = await validateAllBeforeSave()
  if (!valid)
    return

  saving.value = true

  try {
    const result = props.saveFn
      ? await props.saveFn(wizardPayload.value, props.graduateId)
      : await saveGraduate(wizardPayload.value, props.graduateId)

    if (!result.success)
      return

    await router.push(props.backRoute ?? `/egresados/${props.graduateId}`)
  }
  finally {
    saving.value = false
  }
}

const loadGraduateForEdit = async () => {
  loadingData.value = true

  try {
    const fetchFn = props.fetchFn ?? graduateService.getById.bind(graduateService)
    const graduate = await fetchFn(props.graduateId)

    if (!graduate) {
      await router.push(props.backRoute ?? '/egresados')

      return
    }

    hydrateFromGraduate(graduate)
    syncSelectedSchoolLabels()
  }
  finally {
    loadingData.value = false
  }
}

onMounted(async () => {
  await loadFaculties()
  await loadProfessionalSchools()
  await loadAcademicCatalogs()
  await loadGraduateForEdit()
})

watch(() => values.value.facultadId, async (facultyId) => {
  if (!facultyId) {
    await loadProfessionalSchools()
    values.value.escuelaProfesionalId = undefined

    return
  }

  await loadProfessionalSchools(facultyId)

  if (!professionalSchoolOptions.value.some(item => item.id === values.value.escuelaProfesionalId))
    values.value.escuelaProfesionalId = undefined
})

watch(() => values.value.escuelaProfesionalId, schoolId => {
  const selected = professionalSchoolOptions.value.find(item => item.id === schoolId)

  if (!selected) {
    values.value.facultadId = undefined

    return
  }

  values.value.facultadId = resolveSchoolFacultyId(selected)
})

watch(() => degreeDraft.value.tipoGradoId, (degreeTypeId) => {
  if (isTituladoDegreeType(degreeTypeId))
    return

  degreeDraft.value.modalidadTitulacionId = undefined
  degreeDraft.value.modalidadTitulacionOtro = ''
})

watch(
  () => values.value.grados.map(item => item.modalidadTitulacionId),
  () => {
    values.value.grados.forEach((item) => {
      const selectedMode = titulationModeOptions.value.find(mode => mode.id === item.modalidadTitulacionId)
      if (selectedMode?.codigo !== 'OTROS')
        item.modalidadTitulacionOtro = ''
    })
  },
  { deep: true },
)

watch(activeTab, () => {
  formMessage.value = ''
})
</script>

<template>
  <section class="graduate-editor-page">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center flex-wrap gap-3">
        <div>
          <div class="text-h5">
            {{ pageTitle }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ pageSubtitle }}
          </div>
        </div>

        <div class="d-flex gap-2">
          <VBtn
            variant="tonal"
            color="secondary"
            :to="backRoute ?? `/egresados/${graduateId}`"
          >
            {{ backRoute ? 'Volver al inicio' : 'Volver al detalle' }}
          </VBtn>
          <VBtn
            color="primary"
            :loading="submitting || saving"
            :disabled="loadingData || saving"
            @click="submit"
          >
            Guardar cambios
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VProgressLinear
          v-if="loadingData"
          indeterminate
          color="primary"
          class="mb-6"
        />

        <VTabs
          v-model="activeTab"
          color="primary"
          class="mb-6"
        >
          <VTab
            v-for="tab in tabItems"
            :key="tab.value"
            :value="tab.value"
          >
            {{ tab.title }}
          </VTab>
        </VTabs>

        <VWindow v-model="activeTab">
          <VWindowItem value="datos-basicos">
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.codigoUniversitario"
                  label="Codigo de egresado / universitario *"
                  maxlength="20"
                  :error-messages="getFieldError('codigoUniversitario')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.dni"
                  label="DNI o documento de identidad *"
                  maxlength="8"
                  :error-messages="getFieldError('dni')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.nombres"
                  label="Nombres *"
                  maxlength="100"
                  :error-messages="getFieldError('nombres')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.apellidos"
                  label="Apellidos *"
                  maxlength="100"
                  :error-messages="getFieldError('apellidos')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppDateTimePicker
                  v-model="values.fechaNacimiento"
                  label="Fecha de nacimiento *"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  :error-messages="getFieldError('fechaNacimiento', 'fechaNacimiento')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="values.sexo"
                  label="Sexo *"
                  :items="sexOptions"
                  item-title="title"
                  item-value="value"
                  :error-messages="getFieldError('sexo', 'genero')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="values.estadoCivil"
                  label="Estado civil *"
                  :items="civilStatusOptions"
                  :error-messages="getFieldError('estadoCivil')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.nacionalidad"
                  label="Nacionalidad *"
                  maxlength="60"
                  :error-messages="getFieldError('nacionalidad')"
                />
              </VCol>

            </VRow>
          </VWindowItem>

          <VWindowItem value="datos-contacto">
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.correoPersonal"
                  label="Correo electronico personal *"
                  type="email"
                  maxlength="100"
                  :error-messages="getFieldError('correoPersonal', 'correo')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.correoInstitucional"
                  label="Correo institucional"
                  type="email"
                  maxlength="100"
                  :error-messages="getFieldError('correoInstitucional')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.celular"
                  label="Numero de celular *"
                  maxlength="9"
                  :error-messages="getFieldError('celular')"
                />
              </VCol>

              <VCol cols="12">
                <VSwitch
                  v-model="values.viveEnPeru"
                  label="¿Vive actualmente en Perú?"
                  color="primary"
                  hide-details
                />
              </VCol>

              <template v-if="values.viveEnPeru">
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="values.direccionActual"
                    label="Dirección actual"
                    maxlength="150"
                    :error-messages="getFieldError('direccionActual')"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="values.departamento"
                    label="Departamento"
                    :items="departamentoOptions"
                    :error-messages="getFieldError('departamento')"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="values.provincia"
                    label="Provincia"
                    :items="provinciaOptions"
                    :disabled="!values.departamento"
                    :error-messages="getFieldError('provincia')"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppSelect
                    v-model="values.distrito"
                    label="Distrito"
                    :items="distritoOptions"
                    :disabled="!values.provincia"
                    :error-messages="getFieldError('distrito')"
                  />
                </VCol>
              </template>

              <template v-else>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="values.direccionActual"
                    label="Dirección actual"
                    maxlength="150"
                    :error-messages="getFieldError('direccionActual')"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="values.paisResidencia"
                    label="País de residencia"
                    maxlength="80"
                    :error-messages="getFieldError('paisResidencia')"
                  />
                </VCol>
              </template>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.linkedin"
                  label="LinkedIn"
                  maxlength="255"
                  :error-messages="getFieldError('linkedin')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.portafolio"
                  label="Portafolio"
                  maxlength="255"
                  :error-messages="getFieldError('portafolio')"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem value="resumen-academico">
            <VRow>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="values.facultadId"
                  label="Facultad"
                  :items="facultyOptions"
                  item-title="nombre"
                  item-value="id"
                  :error-messages="getFieldError('facultadId', 'facultad')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="values.escuelaProfesionalId"
                  label="Escuela profesional"
                  :items="professionalSchoolOptions"
                  item-title="nombre"
                  item-value="id"
                  :error-messages="getFieldError('escuelaProfesionalId', 'escuelaProfesional')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppDateTimePicker
                  v-model="values.fechaIngreso"
                  label="Fecha de ingreso"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  :error-messages="getFieldError('fechaIngreso', 'anioIngreso')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppDateTimePicker
                  v-model="values.fechaEgreso"
                  label="Fecha de egreso"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true, minDate: values.fechaIngreso || undefined }"
                  :error-messages="getFieldError('fechaEgreso', 'anioEgreso')"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem value="grados">
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Grados registrados
              </div>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openCreateDegreeDialog"
              >
                Agregar grado
              </VBtn>
            </div>

            <VAlert
              v-if="degreeRows.length === 0"
              type="info"
              variant="tonal"
            >
              Aun no registras grados. Usa "Agregar grado" para crear el primero.
            </VAlert>

            <VTable v-else>
              <thead>
                <tr>
                  <th scope="col">Tipo de grado</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Universidad</th>
                  <th scope="col" class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in degreeRows"
                  :key="`degree-row-${row.index}`"
                >
                  <td>{{ row.tipo }}</td>
                  <td>{{ row.fechaGrado }}</td>
                  <td>{{ row.universidad }}</td>
                  <td class="text-right">
                    <VBtn
                      size="small"
                      variant="text"
                      color="primary"
                      @click="openEditDegreeDialog(row.index)"
                    >
                      Editar
                    </VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeDegree(row.index)"
                    >
                      Eliminar
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VWindowItem>

          <VWindowItem value="idiomas">
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Idiomas registrados
              </div>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openCreateLanguageDialog"
              >
                Agregar idioma
              </VBtn>
            </div>

            <VAlert
              v-if="languageRows.length === 0"
              type="info"
              variant="tonal"
            >
              Aun no registras idiomas. Usa "Agregar idioma" para crear el primero.
            </VAlert>

            <VTable v-else>
              <thead>
                <tr>
                  <th scope="col">Idioma</th>
                  <th scope="col">Nivel</th>
                  <th scope="col">Aprendizaje</th>
                  <th scope="col">Vigencia</th>
                  <th scope="col" class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in languageRows"
                  :key="`language-row-${row.index}`"
                >
                  <td>{{ row.idioma }}</td>
                  <td>{{ row.nivel }}</td>
                  <td>{{ row.aprendizaje }}</td>
                  <td>{{ row.vigencia }}</td>
                  <td class="text-right">
                    <VBtn
                      size="small"
                      variant="text"
                      color="primary"
                      @click="openEditLanguageDialog(row.index)"
                    >
                      Editar
                    </VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeLanguage(row.index)"
                    >
                      Eliminar
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VWindowItem>

          <VWindowItem value="formacion-complementaria">
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Formacion complementaria
              </div>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openCreateComplementaryTrainingDialog"
              >
                Agregar formacion
              </VBtn>
            </div>

            <VAlert
              v-if="complementaryTrainingRows.length === 0"
              type="info"
              variant="tonal"
            >
              Aun no registras formacion complementaria.
            </VAlert>

            <VTable v-else>
              <thead>
                <tr>
                  <th scope="col">Curso</th>
                  <th scope="col">Institucion</th>
                  <th scope="col">Vigencia</th>
                  <th scope="col" class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in complementaryTrainingRows"
                  :key="`training-row-${row.index}`"
                >
                  <td>{{ row.nombreCurso }}</td>
                  <td>{{ row.institucion }}</td>
                  <td>{{ row.vigencia }}</td>
                  <td class="text-right">
                    <VBtn
                      size="small"
                      variant="text"
                      color="primary"
                      @click="openEditComplementaryTrainingDialog(row.index)"
                    >
                      Editar
                    </VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeComplementaryTraining(row.index)"
                    >
                      Eliminar
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VWindowItem>

          <VWindowItem value="trayectoria-laboral">
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Trayectoria laboral
              </div>
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="openCreateWorkTrajectoryDialog"
              >
                Agregar trayectoria
              </VBtn>
            </div>

            <VAlert
              v-if="workTrajectoryRows.length === 0"
              type="info"
              variant="tonal"
            >
              Aun no registras trayectoria laboral.
            </VAlert>

            <VTable v-else>
              <thead>
                <tr>
                  <th scope="col">Empresa</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Modalidad</th>
                  <th scope="col">Vigencia</th>
                  <th scope="col">Estado</th>
                  <th scope="col" class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in workTrajectoryRows"
                  :key="`work-row-${row.index}`"
                >
                  <td>{{ row.empresa }}</td>
                  <td>{{ row.cargo }}</td>
                  <td>{{ row.modalidad }}</td>
                  <td>{{ row.vigencia }}</td>
                  <td>{{ row.estado }}</td>
                  <td class="text-right">
                    <VBtn
                      size="small"
                      variant="text"
                      color="primary"
                      @click="openEditWorkTrajectoryDialog(row.index)"
                    >
                      Editar
                    </VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeWorkTrajectory(row.index)"
                    >
                      Eliminar
                    </VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VWindowItem>
        </VWindow>

        <VDialog
          v-model="degreeDialogOpen"
          max-width="900"
        >
          <VCard>
            <VCardTitle>
              {{ editingDegreeIndex === null ? 'Agregar grado' : 'Editar grado' }}
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="degreeDraft.tipoGradoId"
                    label="Tipo de grado *"
                    :items="degreeTypeOptions"
                    item-title="nombre"
                    item-value="id"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppDateTimePicker
                    v-model="degreeDraft.fechaGrado"
                    label="Fecha del grado"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="degreeDraft.universidadId"
                    label="Universidad"
                    :items="universityOptions"
                    item-title="nombre"
                    item-value="id"
                  />
                </VCol>
                <VCol v-if="isOtroDegreeType" cols="12" md="6">
                  <AppTextField
                    v-model="degreeDraft.otroGradoNombre"
                    label="Nombre del grado *"
                    maxlength="100"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppSelect
                    v-if="showDegreeTitulationFields"
                    v-model="degreeDraft.modalidadTitulacionId"
                    label="Modalidad de titulacion"
                    :items="titulationModeOptions"
                    item-title="nombre"
                    item-value="id"
                  />
                </VCol>
                <VCol
                  v-if="showDegreeTitulationFields && titulationModeOptions.find(item => item.id === degreeDraft.modalidadTitulacionId)?.codigo === 'OTROS'"
                  cols="12"
                >
                  <AppTextField
                    v-model="degreeDraft.modalidadTitulacionOtro"
                    label="Modalidad (especificar)"
                    maxlength="100"
                  />
                </VCol>
              </VRow>
            </VCardText>
            <VCardActions class="justify-end">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="degreeDialogOpen = false"
              >
                Cancelar
              </VBtn>
              <VBtn
                color="primary"
                @click="saveDegreeDialog"
              >
                Guardar
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <VDialog
          v-model="languageDialogOpen"
          max-width="900"
          :retain-focus="false"
        >
          <VCard>
            <VCardTitle>
              {{ editingLanguageIndex === null ? 'Agregar idioma' : 'Editar idioma' }}
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="languageDraft.idiomaId"
                    label="Idioma"
                    :items="languageCatalogOptions"
                    item-title="nombre"
                    item-value="id"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="languageDraft.nivel"
                    label="Nivel *"
                    :items="languageLevelOptions"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="languageDraft.aprendizaje"
                    label="Forma de aprendizaje"
                    :items="learningMethodOptions"
                    item-title="title"
                    item-value="value"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="languageDraft.fechaInicio"
                    label="Fecha de inicio"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="languageDraft.fechaFin"
                    label="Fecha de fin"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true, minDate: languageDraft.fechaInicio || undefined }"
                  />
                </VCol>
              </VRow>
            </VCardText>
            <VCardActions class="justify-end">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="languageDialogOpen = false"
              >
                Cancelar
              </VBtn>
              <VBtn
                color="primary"
                @click="saveLanguageDialog"
              >
                Guardar
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <VDialog
          v-model="complementaryTrainingDialogOpen"
          max-width="900"
          :retain-focus="false"
        >
          <VCard>
            <VCardTitle>
              {{ editingComplementaryTrainingIndex === null ? 'Agregar formacion complementaria' : 'Editar formacion complementaria' }}
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="complementaryTrainingDraft.nombreCurso"
                    label="Nombre del curso"
                    maxlength="150"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="complementaryTrainingDraft.institucion"
                    label="Institucion"
                    maxlength="150"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="complementaryTrainingDraft.fechaInicio"
                    label="Fecha de inicio"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="complementaryTrainingDraft.fechaFin"
                    label="Fecha de fin"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true, minDate: complementaryTrainingDraft.fechaInicio || undefined }"
                  />
                </VCol>
              </VRow>
            </VCardText>
            <VCardActions class="justify-end">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="complementaryTrainingDialogOpen = false"
              >
                Cancelar
              </VBtn>
              <VBtn
                color="primary"
                @click="saveComplementaryTrainingDialog"
              >
                Guardar
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <VDialog
          v-model="workTrajectoryDialogOpen"
          max-width="900"
          :retain-focus="false"
        >
          <VCard>
            <VCardTitle>
              {{ editingWorkTrajectoryIndex === null ? 'Agregar trayectoria laboral' : 'Editar trayectoria laboral' }}
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="workTrajectoryDraft.empresa"
                    label="Empresa *"
                    maxlength="150"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="workTrajectoryDraft.cargo"
                    label="Cargo *"
                    maxlength="150"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="workTrajectoryDraft.modalidad"
                    label="Modalidad"
                    :items="workModalityOptions"
                    item-title="title"
                    item-value="value"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="workTrajectoryDraft.fechaInicio"
                    label="Fecha de inicio *"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="workTrajectoryDraft.fechaFin"
                    label="Fecha de fin"
                    :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true, minDate: workTrajectoryDraft.fechaInicio || undefined }"
                  />
                </VCol>
              </VRow>
            </VCardText>
            <VCardActions class="justify-end">
              <VBtn
                variant="tonal"
                color="secondary"
                @click="workTrajectoryDialogOpen = false"
              >
                Cancelar
              </VBtn>
              <VBtn
                color="primary"
                @click="saveWorkTrajectoryDialog"
              >
                Guardar
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>

        <VAlert
          v-if="formMessage"
          type="warning"
          variant="tonal"
          class="mt-4"
        >
          {{ formMessage }}
        </VAlert>
      </VCardText>
    </VCard>
  </section>
</template>

<style scoped>
.graduate-editor-page {
  inline-size: 100%;
}
</style>
