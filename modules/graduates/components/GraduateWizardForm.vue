<script setup lang="ts">
import type { ValidationError } from 'yup'
import { computed, onMounted, ref, watch } from 'vue'
import { departamentoOptions, getDistritos, getProvincias } from '../data/peruGeoData'
import { useRouter } from 'vue-router'
import { useGraduateForm } from '../composables/useGraduateForm'
import { graduateService } from '../services/GraduateService'
import type {
  CatalogOptionItem,
  CivilStatus,
  Gender,
  GraduatePayload,
  GraduateWizardComplementaryTrainingItem,
  GraduateWizardDegreeItem,
  GraduateWizardLanguageItem,
  GraduateWizardValues,
  GraduateWizardWorkTrajectoryItem,
  LanguageLevel,
} from '../types'
import {
  graduateWizardStepOneSchema,
  graduateWizardStepTwoSchema,
} from '../validation/graduateWizardSchemas'
import AppStepper from '@/@core/components/AppStepper.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import AppFileField from '@/@core/components/app-form-elements/AppFileField.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  startStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  startStep: 1,
})

const router = useRouter()
const { saveGraduate, submitting, serverErrors, clearServerErrors } = useGraduateForm()

const currentStep = ref(Math.max(0, Math.min(2, props.startStep - 1)))
const localErrors = ref<Record<string, string>>({})
const transitionLoading = ref(false)
const stepValidationMessage = ref('')
const formMessage = ref('')

const civilStatusOptions: CivilStatus[] = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Conviviente']

const sexOptions: Array<{ title: string; value: Gender }> = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
  { title: 'Otro', value: 'Otro' },
]

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

const languageLevelOptions: LanguageLevel[] = ['Basico', 'Intermedio', 'Avanzado']

const stepItems = [
  { title: 'Datos basicos', icon: 'tabler-user-square-rounded' },
  { title: 'Datos de contacto', icon: 'tabler-address-book' },
  { title: 'Datos academicos', icon: 'tabler-school' },
]

// ── Catalogs ──────────────────────────────────────────────────────────────────
const degreeTypeOptions = ref<CatalogOptionItem[]>([])
const titulationModeOptions = ref<CatalogOptionItem[]>([])
const languageCatalogOptions = ref<CatalogOptionItem[]>([])
const universityOptions = ref<CatalogOptionItem[]>([])
const universitySearch = ref('')
const universityCreating = ref(false)

const addNewUniversity = async () => {
  const nombre = universitySearch.value.trim()
  if (!nombre || universityCreating.value) return
  universityCreating.value = true
  try {
    const created = await graduateService.createUniversity(nombre)
    if (!universityOptions.value.some(u => u.id === created.id))
      universityOptions.value.push(created)
    degreeDraft.value.universidadId = created.id
    universitySearch.value = ''
  }
  catch { /* ignore */ }
  finally { universityCreating.value = false }
}

// ── Dialog state ──────────────────────────────────────────────────────────────
const degreeDialogOpen = ref(false)
const languageDialogOpen = ref(false)
const complementaryTrainingDialogOpen = ref(false)
const workTrajectoryDialogOpen = ref(false)

const editingDegreeIndex = ref<number | null>(null)
const editingLanguageIndex = ref<number | null>(null)
const editingComplementaryTrainingIndex = ref<number | null>(null)
const editingWorkTrajectoryIndex = ref<number | null>(null)

// ── Drafts ────────────────────────────────────────────────────────────────────
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

const degreeDraft = ref<GraduateWizardDegreeItem>(createEmptyDegree())
const languageDraft = ref<GraduateWizardLanguageItem>(createEmptyLanguage())
const complementaryTrainingDraft = ref<GraduateWizardComplementaryTrainingItem>(createEmptyComplementaryTraining())
const workTrajectoryDraft = ref<GraduateWizardWorkTrajectoryItem>(createEmptyWorkTrajectory())

// ── Form values ───────────────────────────────────────────────────────────────
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
  fotoPath: '',

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

  facultadId: undefined,
  escuelaProfesionalId: undefined,
  anioIngreso: '',
  anioEgreso: '',
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

watch(() => values.value.viveEnPeru, (vivePeru) => {
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
  values.value.provincia = ''
  values.value.distrito = ''
})

watch(() => values.value.provincia, () => {
  values.value.distrito = ''
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizeOptionalText = (value?: string) => value?.trim().toLowerCase() || ''

const isTituladoDegreeType = (degreeTypeId?: number) =>
  degreeTypeOptions.value.find(item => item.id === degreeTypeId)?.codigo === 'TITULADO'

const isOtroType = (tipoGradoId?: number) =>
  degreeTypeOptions.value.find(o => o.id === tipoGradoId)?.codigo === 'OTRO'

const isOtroDegreeType = computed(() =>
  degreeTypeOptions.value.find(item => item.id === degreeDraft.value.tipoGradoId)?.codigo === 'OTRO',
)

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

const getYearFromDate = (value?: string) => {
  if (!value) return undefined
  return value.slice(0, 4)
}

// ── Duplicate checks ──────────────────────────────────────────────────────────
function isDegreeDuplicate(draft: GraduateWizardDegreeItem, skipIndex: number | null) {
  return values.value.grados.some((item, index) => {
    if (skipIndex !== null && index === skipIndex) return false
    return (item.tipoGradoId || null) === (draft.tipoGradoId || null)
      && (item.universidadId || null) === (draft.universidadId || null)
      && (item.fechaGrado || '') === (draft.fechaGrado || '')
      && normalizeOptionalText(item.otroGradoNombre) === normalizeOptionalText(draft.otroGradoNombre)
  })
}

function isLanguageDuplicate(draft: GraduateWizardLanguageItem, skipIndex: number | null) {
  return values.value.idiomas.some((item, index) => {
    if (skipIndex !== null && index === skipIndex) return false
    return (item.idiomaId || null) === (draft.idiomaId || null)
      && (item.nivel || '') === (draft.nivel || '')
      && (item.fechaInicio || '') === (draft.fechaInicio || '')
  })
}

function isComplementaryTrainingDuplicate(draft: GraduateWizardComplementaryTrainingItem, skipIndex: number | null) {
  return values.value.formacionesComplementarias.some((item, index) => {
    if (skipIndex !== null && index === skipIndex) return false
    return normalizeOptionalText(item.nombreCurso) === normalizeOptionalText(draft.nombreCurso)
      && normalizeOptionalText(item.institucion) === normalizeOptionalText(draft.institucion)
      && (item.fechaInicio || '') === (draft.fechaInicio || '')
  })
}

function isWorkTrajectoryDuplicate(draft: GraduateWizardWorkTrajectoryItem, skipIndex: number | null) {
  return values.value.trayectoriasLaborales.some((item, index) => {
    if (skipIndex !== null && index === skipIndex) return false
    return normalizeOptionalText(item.empresa) === normalizeOptionalText(draft.empresa)
      && normalizeOptionalText(item.cargo) === normalizeOptionalText(draft.cargo)
      && (item.fechaInicio || '') === (draft.fechaInicio || '')
  })
}

// ── Payload builders ──────────────────────────────────────────────────────────
const buildDegreesPayload = () => values.value.grados
  .filter(item => Boolean(item.fechaGrado || item.otroGradoNombre || item.tipoGradoId || item.universidadId || item.modalidadTitulacionId))
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

// ── Computed rows ─────────────────────────────────────────────────────────────
const degreeRows = computed(() => values.value.grados.map((item, index) => {
  const option = degreeTypeOptions.value.find(o => o.id === item.tipoGradoId)
  const tipoNombre = option?.nombre || '-'
  const isOtro = option?.codigo === 'OTRO'
  const isTitulado = option?.codigo === 'TITULADO'

  const modalidadNombre = titulationModeOptions.value.find(o => o.id === item.modalidadTitulacionId)?.nombre
    || item.modalidadTitulacionOtro?.trim() || ''

  let tipo = tipoNombre
  if (isOtro && item.otroGradoNombre?.trim())
    tipo = `${tipoNombre}: ${item.otroGradoNombre.trim()}`
  else if (isTitulado && modalidadNombre)
    tipo = `${tipoNombre} (${modalidadNombre})`

  return { index, tipo, fechaGrado: formatDate(item.fechaGrado), universidad: universityOptions.value.find(o => o.id === item.universidadId)?.nombre || '-' }
}))

const languageRows = computed(() => values.value.idiomas.map((item, index) => ({
  index,
  idioma: languageCatalogOptions.value.find(o => o.id === item.idiomaId)?.nombre || '-',
  nivel: item.nivel || '-',
  aprendizaje: item.aprendizaje || '-',
  vigencia: formatDateRange(item.fechaInicio, item.fechaFin),
})))

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

// ── Dialog actions ────────────────────────────────────────────────────────────
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
  if (!isOtroDegreeType.value)
    nextValue.otroGradoNombre = ''

  if (isDegreeDuplicate(nextValue, editingDegreeIndex.value)) {
    formMessage.value = 'Este grado ya fue registrado. Evita duplicar tipo, universidad, fecha y nombre de grado.'
    return
  }
  if (editingDegreeIndex.value === null)
    values.value.grados.push(nextValue)
  else
    values.value.grados.splice(editingDegreeIndex.value, 1, nextValue)

  degreeDialogOpen.value = false
}

const removeDegree = (index: number) => { values.value.grados.splice(index, 1) }

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

  languageDialogOpen.value = false
}

const removeLanguage = (index: number) => { values.value.idiomas.splice(index, 1) }

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

  complementaryTrainingDialogOpen.value = false
}

const removeComplementaryTraining = (index: number) => { values.value.formacionesComplementarias.splice(index, 1) }

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

  workTrajectoryDialogOpen.value = false
}

const removeWorkTrajectory = (index: number) => { values.value.trayectoriasLaborales.splice(index, 1) }

// ── Payload ───────────────────────────────────────────────────────────────────
const wizardPayload = computed<GraduatePayload>(() => {
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
    escuela_profesional_id: values.value.escuelaProfesionalId || undefined,
    anio_ingreso: values.value.anioIngreso?.trim() || undefined,
    anio_egreso: values.value.anioEgreso?.trim() || undefined,
    contrasena: values.value.dni.trim(),
    cv_path: values.value.fotografia || undefined,
    foto_path: values.value.fotoPath || undefined,
    grados: buildDegreesPayload(),
    idiomas: buildLanguagesPayload(),
    formaciones_complementarias: buildComplementaryTrainingsPayload(),
    trayectorias_laborales: buildWorkTrajectoriesPayload(),
  }

  return payload
})

// ── Navigation ────────────────────────────────────────────────────────────────
const activeStepLabel = computed(() => stepItems[currentStep.value]?.title || '')
const lastStepIndex = computed(() => stepItems.length - 1)
const canGoBack = computed(() => currentStep.value > 0 && !transitionLoading.value)

const getFieldError = (localField: string, backendField?: string): string | undefined => {
  const localError = localErrors.value[localField]
  if (localError) return localError
  return serverErrors.value[backendField ?? localField]
}

const getSchemaForStep = (stepIndex: number) => {
  if (stepIndex === 0) return graduateWizardStepOneSchema
  if (stepIndex === 1) return graduateWizardStepTwoSchema
  return null
}

const validateCurrentStep = async (): Promise<boolean> => {
  localErrors.value = {}
  stepValidationMessage.value = ''
  clearServerErrors()

  const schema = getSchemaForStep(currentStep.value)
  if (!schema) return true

  try {
    await schema.validate(values.value, { abortEarly: false })
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
    stepValidationMessage.value = validationError.inner.find(issue => issue.message)?.message || 'Revisa los campos obligatorios para continuar.'
    return false
  }
}

const goPrevious = () => {
  if (!canGoBack.value) return
  currentStep.value -= 1
}

const doSave = async () => {
  transitionLoading.value = true
  try {
    const result = await saveGraduate(wizardPayload.value)
    if (!result.success || !result.createdGraduateId) return
    await router.push(`/egresados/${result.createdGraduateId}`)
  }
  finally {
    transitionLoading.value = false
  }
}

// "Siguiente" at step 0, "Registrar y finalizar" at steps 1 and 2
const goNext = async () => {
  if (transitionLoading.value) return
  const isValid = await validateCurrentStep()
  if (!isValid) return

  if (currentStep.value === 0) {
    currentStep.value += 1
    return
  }

  await doSave()
}

// "Registrar y completar datos académicos" — only shown at step 1, no API call
const goToAcademic = async () => {
  if (transitionLoading.value) return
  const isValid = await validateCurrentStep()
  if (!isValid) return
  currentStep.value = 2
}

const handleStepChange = async (nextStep: number) => {
  if (transitionLoading.value) return

  if (nextStep <= currentStep.value) {
    currentStep.value = nextStep
    return
  }

  // Only allow clicking ahead one step at a time (with validation)
  if (nextStep === currentStep.value + 1) {
    const isValid = await validateCurrentStep()
    if (!isValid) return
    currentStep.value = nextStep
  }
}

watch(currentStep, () => {
  stepValidationMessage.value = ''
  formMessage.value = ''
})

watch(() => degreeDraft.value.tipoGradoId, (degreeTypeId) => {
  if (isTituladoDegreeType(degreeTypeId)) return
  degreeDraft.value.modalidadTitulacionId = undefined
  degreeDraft.value.modalidadTitulacionOtro = ''
})

onMounted(async () => {
  // Load step-3 catalogs independently so a failure doesn't block the default school
  try {
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
  catch { /* ignore */ }

  // Set default faculty/school in a separate try so catalog failures above don't affect this
  try {
    const faculties = await graduateService.fetchFaculties()
    const faculty = faculties[0]
    if (!faculty) return

    values.value.facultadId = faculty.id

    const schools = await graduateService.fetchProfessionalSchools(faculty.id)
    const school = schools[0]
    if (school) values.value.escuelaProfesionalId = school.id
  }
  catch { /* ignore */ }
})
</script>

<template>
  <section class="graduate-wizard-page">
    <VCard class="graduate-wizard-card">
      <VCardTitle class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h5">
            Nuevo Graduado
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Paso {{ currentStep + 1 }} de {{ stepItems.length }}: {{ activeStepLabel }}
          </div>
        </div>

        <VBtn
          variant="tonal"
          color="secondary"
          :to="'/egresados'"
        >
          Cancelar
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <AppStepper
          :items="stepItems"
          :current-step="currentStep"
          align="center"
          class="graduate-wizard-stepper mb-6"
          @update:current-step="handleStepChange"
        />

        <VWindow
          v-model="currentStep"
          class="mb-6"
        >
          <!-- ── Step 0: Datos básicos ─────────────────────────────────────── -->
          <VWindowItem :value="0">
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

              <VCol cols="12" md="6">
                <AppFileField
                  v-model="values.fotografia"
                  label="Subir CV (opcional)"
                  accept=".pdf,.doc,.docx"
                  file-type="CV"
                  :error-messages="getFieldError('fotografia')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppFileField
                  v-model="values.fotoPath"
                  label="Subir fotografia (opcional)"
                  accept=".png,.jpg,.jpeg,.webp"
                  file-type="PHOTO"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <!-- ── Step 1: Datos de contacto ────────────────────────────────── -->
          <VWindowItem :value="1">
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

              <VCol cols="12" md="3">
                <AppTextField
                  v-model="values.anioIngreso"
                  label="Año de ingreso"
                  maxlength="4"
                  placeholder="Ej: 2018"
                  :error-messages="getFieldError('anioIngreso')"
                />
              </VCol>

              <VCol cols="12" md="3">
                <AppTextField
                  v-model="values.anioEgreso"
                  label="Año de egreso"
                  maxlength="4"
                  placeholder="Ej: 2023"
                  :error-messages="getFieldError('anioEgreso')"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <!-- ── Step 2: Datos académicos ──────────────────────────────────── -->
          <VWindowItem :value="2">
            <!-- Grados -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Grados
              </div>
              <VBtn
                color="primary"
                size="small"
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
              class="mb-4"
            >
              Sin grados registrados. Puedes agregar ahora o completar después desde el perfil.
            </VAlert>

            <VTable
              v-else
              class="mb-4"
            >
              <thead>
                <tr>
                  <th scope="col">Tipo de grado</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Universidad</th>
                  <th
                    scope="col"
                    class="text-right"
                  >Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in degreeRows"
                  :key="`degree-${row.index}`"
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
                    >Editar</VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeDegree(row.index)"
                    >Eliminar</VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VDivider class="mb-4" />

            <!-- Idiomas -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Idiomas
              </div>
              <VBtn
                color="primary"
                size="small"
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
              class="mb-4"
            >
              Sin idiomas registrados.
            </VAlert>

            <VTable
              v-else
              class="mb-4"
            >
              <thead>
                <tr>
                  <th scope="col">Idioma</th>
                  <th scope="col">Nivel</th>
                  <th scope="col">Aprendizaje</th>
                  <th scope="col">Vigencia</th>
                  <th
                    scope="col"
                    class="text-right"
                  >Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in languageRows"
                  :key="`lang-${row.index}`"
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
                    >Editar</VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeLanguage(row.index)"
                    >Eliminar</VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VDivider class="mb-4" />

            <!-- Formación complementaria -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Formacion complementaria
              </div>
              <VBtn
                color="primary"
                size="small"
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
              class="mb-4"
            >
              Sin formaciones complementarias registradas.
            </VAlert>

            <VTable
              v-else
              class="mb-4"
            >
              <thead>
                <tr>
                  <th scope="col">Curso</th>
                  <th scope="col">Institucion</th>
                  <th scope="col">Vigencia</th>
                  <th
                    scope="col"
                    class="text-right"
                  >Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in complementaryTrainingRows"
                  :key="`training-${row.index}`"
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
                    >Editar</VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeComplementaryTraining(row.index)"
                    >Eliminar</VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <VDivider class="mb-4" />

            <!-- Trayectoria laboral -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Trayectoria laboral
              </div>
              <VBtn
                color="primary"
                size="small"
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
              class="mb-4"
            >
              Sin trayectorias laborales registradas.
            </VAlert>

            <VTable
              v-else
              class="mb-4"
            >
              <thead>
                <tr>
                  <th scope="col">Empresa</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Modalidad</th>
                  <th scope="col">Vigencia</th>
                  <th scope="col">Estado</th>
                  <th
                    scope="col"
                    class="text-right"
                  >Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in workTrajectoryRows"
                  :key="`work-${row.index}`"
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
                    >Editar</VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeWorkTrajectory(row.index)"
                    >Eliminar</VBtn>
                  </td>
                </tr>
              </tbody>
            </VTable>

            <!-- Dialogs -->
            <VDialog
              v-model="degreeDialogOpen"
              max-width="900"
            >
              <VCard>
                <VCardTitle>{{ editingDegreeIndex === null ? 'Agregar grado' : 'Editar grado' }}</VCardTitle>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppSelect
                        v-model="degreeDraft.tipoGradoId"
                        label="Tipo de grado"
                        :items="degreeTypeOptions"
                        item-title="nombre"
                        item-value="id"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppDateTimePicker
                        v-model="degreeDraft.fechaGrado"
                        label="Fecha del grado"
                        :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppAutocomplete
                        v-model="degreeDraft.universidadId"
                        label="Universidad"
                        :items="universityOptions"
                        item-title="nombre"
                        item-value="id"
                        clearable
                        @update:search="val => universitySearch = val ?? ''"
                      >
                        <template v-if="universitySearch.trim()" #append>
                          <VBtn
                            icon="tabler-plus"
                            size="small"
                            variant="tonal"
                            color="primary"
                            :loading="universityCreating"
                            @mousedown.prevent.stop="addNewUniversity"
                          />
                        </template>
                      </AppAutocomplete>
                    </VCol>
                    <VCol
                      v-if="isOtroDegreeType"
                      cols="12"
                      md="6"
                    >
                      <AppTextField
                        v-model="degreeDraft.otroGradoNombre"
                        label="Nombre del grado *"
                        maxlength="100"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
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
                  >Cancelar</VBtn>
                  <VBtn
                    color="primary"
                    @click="saveDegreeDialog"
                  >Guardar</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>

            <VDialog
              v-model="languageDialogOpen"
              max-width="900"
              :retain-focus="false"
            >
              <VCard>
                <VCardTitle>{{ editingLanguageIndex === null ? 'Agregar idioma' : 'Editar idioma' }}</VCardTitle>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppSelect
                        v-model="languageDraft.idiomaId"
                        label="Idioma"
                        :items="languageCatalogOptions"
                        item-title="nombre"
                        item-value="id"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppSelect
                        v-model="languageDraft.nivel"
                        label="Nivel *"
                        :items="languageLevelOptions"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppSelect
                        v-model="languageDraft.aprendizaje"
                        label="Forma de aprendizaje"
                        :items="learningMethodOptions"
                        item-title="title"
                        item-value="value"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppDateTimePicker
                        v-model="languageDraft.fechaInicio"
                        label="Fecha de inicio"
                        :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
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
                  >Cancelar</VBtn>
                  <VBtn
                    color="primary"
                    @click="saveLanguageDialog"
                  >Guardar</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>

            <VDialog
              v-model="complementaryTrainingDialogOpen"
              max-width="900"
              :retain-focus="false"
            >
              <VCard>
                <VCardTitle>{{ editingComplementaryTrainingIndex === null ? 'Agregar formacion complementaria' : 'Editar formacion complementaria' }}</VCardTitle>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppTextField
                        v-model="complementaryTrainingDraft.nombreCurso"
                        label="Nombre del curso"
                        maxlength="150"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppTextField
                        v-model="complementaryTrainingDraft.institucion"
                        label="Institucion"
                        maxlength="150"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppDateTimePicker
                        v-model="complementaryTrainingDraft.fechaInicio"
                        label="Fecha de inicio"
                        :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
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
                  >Cancelar</VBtn>
                  <VBtn
                    color="primary"
                    @click="saveComplementaryTrainingDialog"
                  >Guardar</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>

            <VDialog
              v-model="workTrajectoryDialogOpen"
              max-width="900"
              :retain-focus="false"
            >
              <VCard>
                <VCardTitle>{{ editingWorkTrajectoryIndex === null ? 'Agregar trayectoria laboral' : 'Editar trayectoria laboral' }}</VCardTitle>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppTextField
                        v-model="workTrajectoryDraft.empresa"
                        label="Empresa *"
                        maxlength="150"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppTextField
                        v-model="workTrajectoryDraft.cargo"
                        label="Cargo *"
                        maxlength="150"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <AppSelect
                        v-model="workTrajectoryDraft.modalidad"
                        label="Modalidad"
                        :items="workModalityOptions"
                        item-title="title"
                        item-value="value"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppDateTimePicker
                        v-model="workTrajectoryDraft.fechaInicio"
                        label="Fecha de inicio *"
                        :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
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
                  >Cancelar</VBtn>
                  <VBtn
                    color="primary"
                    @click="saveWorkTrajectoryDialog"
                  >Guardar</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>
          </VWindowItem>
        </VWindow>

        <VAlert
          v-if="stepValidationMessage"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          {{ stepValidationMessage }}
        </VAlert>

        <VAlert
          v-if="formMessage"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          {{ formMessage }}
        </VAlert>

        <div class="d-flex justify-space-between gap-2 flex-wrap">
          <VBtn
            variant="tonal"
            color="secondary"
            :disabled="!canGoBack"
            @click="goPrevious"
          >
            Anterior
          </VBtn>

          <div class="d-flex gap-2 flex-wrap">
            <!-- At step 1: option to go to academic data (no save) -->
            <VBtn
              v-if="currentStep === 1"
              variant="tonal"
              color="primary"
              :loading="transitionLoading"
              :disabled="transitionLoading"
              @click="goToAcademic"
            >
              Completar datos academicos
            </VBtn>

            <!-- At step 0: "Siguiente" | At steps 1 & 2: "Registrar y finalizar" -->
            <VBtn
              color="primary"
              :loading="submitting || transitionLoading"
              :disabled="transitionLoading"
              @click="goNext"
            >
              {{ currentStep === 0 ? 'Siguiente' : 'Registrar y finalizar' }}
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VOverlay
      :model-value="transitionLoading"
      contained
      persistent
      class="align-center justify-center"
    >
      <div class="d-flex flex-column align-center gap-4">
        <VProgressCircular
          indeterminate
          size="58"
          width="6"
          color="primary"
        />
        <div class="text-body-1 font-weight-medium">
          Registrando graduado...
        </div>
      </div>
    </VOverlay>
  </section>
</template>

<style scoped>
.graduate-wizard-page {
  inline-size: 100%;
}

.graduate-wizard-card {
  inline-size: 100%;
  max-inline-size: none;
}

.graduate-wizard-stepper :deep(.v-slide-group__content) {
  inline-size: 100%;
  justify-content: center;
}
</style>
