<script setup lang="ts">
/* eslint-disable import/no-unresolved, indent, padding-line-between-statements, arrow-parens, vue/max-attributes-per-line, vue/singleline-html-element-content-newline */
import type { ValidationError } from 'yup'
import { computed, onMounted, ref, watch } from 'vue'
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
  GraduateWizardDegreeItem,
  GraduateWizardLanguageItem,
  GraduateWizardValues,
  LanguageLevel,
  ProfessionalSchoolCatalogItem,
} from '../types'
import {
  graduateWizardStepFourSchema,
  graduateWizardStepOneSchema,
  graduateWizardStepThreeSchema,
  graduateWizardStepTwoSchema,
} from '../validation/graduateWizardSchemas'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import AppFileField from '@/@core/components/app-form-elements/AppFileField.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  graduateId: number
}

const props = defineProps<Props>()

const router = useRouter()
const { saveGraduate, submitting, serverErrors, clearServerErrors } = useGraduateForm()

const activeTab = ref('datos-basicos')
const localErrors = ref<Record<string, string>>({})
const loadingData = ref(false)
const saving = ref(false)
const formMessage = ref('')
const degreeDialogOpen = ref(false)
const languageDialogOpen = ref(false)
const degreesTouched = ref(false)
const languagesTouched = ref(false)
const editingDegreeIndex = ref<number | null>(null)
const editingLanguageIndex = ref<number | null>(null)
const facultyOptions = ref<FacultyCatalogItem[]>([])
const professionalSchoolOptions = ref<ProfessionalSchoolCatalogItem[]>([])
const degreeTypeOptions = ref<CatalogOptionItem[]>([])
const titulationModeOptions = ref<CatalogOptionItem[]>([])
const languageCatalogOptions = ref<CatalogOptionItem[]>([])
const universityOptions = ref<CatalogOptionItem[]>([])

const tabItems = [
  { value: 'datos-basicos', title: 'Datos basicos' },
  { value: 'datos-contacto', title: 'Datos de contacto' },
  { value: 'resumen-academico', title: 'Resumen academico' },
  { value: 'grados', title: 'Grados' },
  { value: 'idiomas', title: 'Idiomas' },
]

const civilStatusOptions: CivilStatus[] = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Conviviente']

const sexOptions: Array<{ title: string; value: Gender }> = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
  { title: 'Otro', value: 'Otro' },
]

const languageLevelOptions: LanguageLevel[] = ['Basico', 'Intermedio', 'Avanzado']

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

const normalizeOptionalText = (value?: string) => value?.trim().toLowerCase() || ''

const isTituladoDegreeType = (degreeTypeId?: number) => degreeTypeOptions.value
  .find(item => item.id === degreeTypeId)?.codigo === 'TITULADO'

const degreeDraft = ref<GraduateWizardDegreeItem>(createEmptyDegree())
const languageDraft = ref<GraduateWizardLanguageItem>(createEmptyLanguage())

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
  direccionActual: '',
  ciudad: '',
  departamento: '',
  paisResidencia: '',
  linkedin: '',
  portafolio: '',

  facultad: '',
  escuelaProfesional: '',
  facultadId: undefined,
  escuelaProfesionalId: undefined,
  fechaIngreso: '',
  fechaEgreso: '',
  bachillerFecha: '',
  bachillerUniversidad: '',
  tituloProfesionalFecha: '',
  tituloProfesionalUniversidad: '',
  maestriaFecha: '',
  maestriaUniversidad: '',
  doctoradoFecha: '',
  doctoradoUniversidad: '',
  otroGradoNombre: '',
  otroGradoFecha: '',
  otroGradoUniversidad: '',
  modalidadTitulacion: '',
  modalidadTitulacionOtro: '',
  idiomaNombre: '',
  idiomaNivel: '',
  idiomaFechaInicio: '',
  idiomaFechaFin: '',
  idiomaAprendizaje: '',
  grados: [],
  idiomas: [],
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

const deriveLegacyAcademicFieldsFromCollections = () => {
  const firstDegree = values.value.grados.find(item =>
    Boolean(item.fechaGrado || item.universidadId || item.otroGradoNombre || item.modalidadTitulacionId || item.modalidadTitulacionOtro),
  )

  const firstUniversity = universityOptions.value.find(item => item.id === firstDegree?.universidadId)
  const firstMode = titulationModeOptions.value.find(item => item.id === firstDegree?.modalidadTitulacionId)

  const firstLanguage = values.value.idiomas.find(item =>
    Boolean(item.idiomaId || item.nivel || item.fechaInicio || item.fechaFin || item.aprendizaje),
  )

  const firstLanguageCatalog = languageCatalogOptions.value.find(item => item.id === firstLanguage?.idiomaId)

  return {
    otroGradoNombre: firstDegree?.otroGradoNombre || '',
    otroGradoFecha: firstDegree?.fechaGrado || '',
    otroGradoUniversidad: firstUniversity?.nombre || '',
    modalidadTitulacion: (firstMode?.nombre as any) || '',
    modalidadTitulacionOtro: firstDegree?.modalidadTitulacionOtro || '',
    idiomaNombre: firstLanguageCatalog?.nombre || '',
    idiomaNivel: firstLanguage?.nivel || '',
    idiomaFechaInicio: firstLanguage?.fechaInicio || '',
    idiomaFechaFin: firstLanguage?.fechaFin || '',
    idiomaAprendizaje: firstLanguage?.aprendizaje || '',
  }
}

const buildDegreesPayload = () => values.value.grados
  .filter(item => Boolean(item.fechaGrado || item.otroGradoNombre || item.modalidadTitulacionOtro || item.tipoGradoId || item.universidadId || item.modalidadTitulacionId))
  .map(item => ({
    tipo_grado_id: item.tipoGradoId || undefined,
    universidad_id: item.universidadId || undefined,
    fecha_grado: item.fechaGrado || undefined,
    otro_grado_nombre: item.otroGradoNombre?.trim() || undefined,
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
  const legacyAcademic = deriveLegacyAcademicFieldsFromCollections()
  const degreesPayload = buildDegreesPayload()
  const languagesPayload = buildLanguagesPayload()
  const firstDegree = values.value.grados.find(item => Boolean(item.tipoGradoId || item.otroGradoNombre))
  const firstDegreeType = degreeTypeOptions.value.find(item => item.id === firstDegree?.tipoGradoId)
  const gradoObtenido = firstDegreeType?.nombre || firstDegree?.otroGradoNombre?.trim() || undefined

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
    direccion_actual: values.value.direccionActual.trim() || undefined,
    ciudad: values.value.ciudad.trim() || undefined,
    departamento: values.value.departamento.trim() || undefined,
    pais_residencia: values.value.paisResidencia.trim() || undefined,
    linkedin: values.value.linkedin?.trim() || undefined,
    portafolio: values.value.portafolio?.trim() || undefined,
    facultad: values.value.facultad.trim() || undefined,
    escuela_profesional: values.value.escuelaProfesional.trim() || undefined,
    escuela_profesional_id: values.value.escuelaProfesionalId || undefined,
    anio_ingreso: getYearFromDate(values.value.fechaIngreso),
    anio_egreso: getYearFromDate(values.value.fechaEgreso),
    grado_obtenido: gradoObtenido,
    bachiller_fecha: values.value.bachillerFecha || undefined,
    bachiller_universidad: values.value.bachillerUniversidad?.trim() || undefined,
    titulo_profesional_fecha: values.value.tituloProfesionalFecha || undefined,
    titulo_profesional_universidad: values.value.tituloProfesionalUniversidad?.trim() || undefined,
    maestria_fecha: values.value.maestriaFecha || undefined,
    maestria_universidad: values.value.maestriaUniversidad?.trim() || undefined,
    doctorado_fecha: values.value.doctoradoFecha || undefined,
    doctorado_universidad: values.value.doctoradoUniversidad?.trim() || undefined,
    otro_grado_nombre: legacyAcademic.otroGradoNombre?.trim() || undefined,
    otro_grado_fecha: legacyAcademic.otroGradoFecha || undefined,
    otro_grado_universidad: legacyAcademic.otroGradoUniversidad?.trim() || undefined,
    modalidad_titulacion: legacyAcademic.modalidadTitulacion || undefined,
    modalidad_titulacion_otro: legacyAcademic.modalidadTitulacionOtro?.trim() || undefined,
    idioma_nombre: legacyAcademic.idiomaNombre?.trim() || undefined,
    idioma_nivel: (legacyAcademic.idiomaNivel as LanguageLevel) || undefined,
    idioma_fecha_inicio: legacyAcademic.idiomaFechaInicio || undefined,
    idioma_fecha_fin: legacyAcademic.idiomaFechaFin || undefined,
    idioma_aprendizaje: legacyAcademic.idiomaAprendizaje?.trim() || undefined,
    contrasena: values.value.dni.trim(),
    cv_path: values.value.fotografia || undefined,
  }

  if (degreesTouched.value)
    payload.grados = degreesPayload

  if (languagesTouched.value)
    payload.idiomas = languagesPayload

  return payload
})

const getFieldError = (localField: string, backendField?: string): string | undefined => {
  const localError = localErrors.value[localField]
  if (localError)
    return localError

  return serverErrors.value[backendField ?? localField]
}

const hydrateFromGraduate = (graduate: Graduate) => {
  degreesTouched.value = false
  languagesTouched.value = false

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
  values.value.direccionActual = graduate.direccionActual || ''
  values.value.ciudad = graduate.ciudad || ''
  values.value.departamento = graduate.departamento || ''
  values.value.paisResidencia = graduate.paisResidencia || ''
  values.value.linkedin = graduate.linkedin || ''
  values.value.portafolio = graduate.portafolio || ''
  values.value.facultad = graduate.facultad || ''
  values.value.escuelaProfesional = graduate.escuelaProfesional || ''
  values.value.escuelaProfesionalId = graduate.escuelaProfesionalId || undefined
  values.value.fechaIngreso = normalizeDateValue(graduate.anioIngreso)
  values.value.fechaEgreso = normalizeDateValue(graduate.anioEgreso)
  values.value.bachillerFecha = graduate.bachillerFecha ? graduate.bachillerFecha.split('T')[0] : ''
  values.value.bachillerUniversidad = graduate.bachillerUniversidad || ''
  values.value.tituloProfesionalFecha = graduate.tituloProfesionalFecha ? graduate.tituloProfesionalFecha.split('T')[0] : ''
  values.value.tituloProfesionalUniversidad = graduate.tituloProfesionalUniversidad || ''
  values.value.maestriaFecha = graduate.maestriaFecha ? graduate.maestriaFecha.split('T')[0] : ''
  values.value.maestriaUniversidad = graduate.maestriaUniversidad || ''
  values.value.doctoradoFecha = graduate.doctoradoFecha ? graduate.doctoradoFecha.split('T')[0] : ''
  values.value.doctoradoUniversidad = graduate.doctoradoUniversidad || ''
  values.value.otroGradoNombre = graduate.otroGradoNombre || ''
  values.value.otroGradoFecha = graduate.otroGradoFecha ? graduate.otroGradoFecha.split('T')[0] : ''
  values.value.otroGradoUniversidad = graduate.otroGradoUniversidad || ''
  values.value.modalidadTitulacion = graduate.modalidadTitulacion || ''
  values.value.modalidadTitulacionOtro = graduate.modalidadTitulacionOtro || ''
  values.value.idiomaNombre = graduate.idiomaNombre || ''
  values.value.idiomaNivel = graduate.idiomaNivel || ''
  values.value.idiomaFechaInicio = graduate.idiomaFechaInicio ? graduate.idiomaFechaInicio.split('T')[0] : ''
  values.value.idiomaFechaFin = graduate.idiomaFechaFin ? graduate.idiomaFechaFin.split('T')[0] : ''
  values.value.idiomaAprendizaje = graduate.idiomaAprendizaje || ''
  values.value.fotografia = graduate.cvPath || ''

  values.value.grados = (graduate.grados || [])
    .map(item => ({
      tipoGradoId: item.tipo_grado_id || undefined,
      universidadId: item.universidad_id || undefined,
      fechaGrado: item.fecha_grado ? item.fecha_grado.split('T')[0] : '',
      otroGradoNombre: item.otro_grado_nombre || '',
      modalidadTitulacionId: item.titulacion?.modalidad_titulacion_id || undefined,
      modalidadTitulacionOtro: item.titulacion?.modalidad_otro || '',
    }))

  if (!values.value.grados.length) {
    const legacyDegree = createEmptyDegree()
    legacyDegree.fechaGrado = values.value.otroGradoFecha || ''
    legacyDegree.otroGradoNombre = values.value.otroGradoNombre || ''
    legacyDegree.modalidadTitulacionOtro = values.value.modalidadTitulacionOtro || ''
    legacyDegree.universidadId = universityOptions.value.find(item => item.nombre === values.value.otroGradoUniversidad)?.id
    legacyDegree.modalidadTitulacionId = titulationModeOptions.value.find(item => item.nombre === values.value.modalidadTitulacion)?.id

    if (legacyDegree.fechaGrado || legacyDegree.otroGradoNombre || legacyDegree.modalidadTitulacionOtro || legacyDegree.universidadId || legacyDegree.modalidadTitulacionId)
      values.value.grados = [legacyDegree]
  }

  values.value.idiomas = (graduate.idiomas || [])
    .map(item => ({
      idiomaId: item.idioma_id || undefined,
      nivel: (item.nivel as LanguageLevel) || '',
      fechaInicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
      fechaFin: item.fecha_fin ? item.fecha_fin.split('T')[0] : '',
      aprendizaje: item.aprendizaje || '',
    }))

  if (!values.value.idiomas.length) {
    const legacyLanguage = createEmptyLanguage()
    legacyLanguage.idiomaId = languageCatalogOptions.value.find(item => item.nombre === values.value.idiomaNombre)?.id
    legacyLanguage.nivel = values.value.idiomaNivel || ''
    legacyLanguage.fechaInicio = values.value.idiomaFechaInicio || ''
    legacyLanguage.fechaFin = values.value.idiomaFechaFin || ''
    legacyLanguage.aprendizaje = values.value.idiomaAprendizaje || ''

    if (legacyLanguage.idiomaId || legacyLanguage.nivel || legacyLanguage.fechaInicio || legacyLanguage.fechaFin || legacyLanguage.aprendizaje)
      values.value.idiomas = [legacyLanguage]
  }
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

const showDegreeTitulationFields = computed(() => isTituladoDegreeType(degreeDraft.value.tipoGradoId))

const degreeRows = computed(() => values.value.grados.map((item, index) => {
  const tipo = degreeTypeOptions.value.find(option => option.id === item.tipoGradoId)?.nombre || '-'
  const universidad = universityOptions.value.find(option => option.id === item.universidadId)?.nombre || '-'
  const modalidad = titulationModeOptions.value.find(option => option.id === item.modalidadTitulacionId)?.nombre || '-'

  return {
    index,
    tipo,
    fechaGrado: item.fechaGrado || '-',
    universidad,
    modalidad,
  }
}))

const languageRows = computed(() => values.value.idiomas.map((item, index) => {
  const idioma = languageCatalogOptions.value.find(option => option.id === item.idiomaId)?.nombre || '-'

  return {
    index,
    idioma,
    nivel: item.nivel || '-',
    aprendizaje: item.aprendizaje || '-',
    vigencia: item.fechaInicio && item.fechaFin ? `${item.fechaInicio} - ${item.fechaFin}` : '-',
  }
}))

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

  values.value.escuelaProfesional = school.nombre
  values.value.facultadId = resolveSchoolFacultyId(school)

  const faculty = facultyOptions.value.find(item => item.id === resolveSchoolFacultyId(school))
  if (faculty)
    values.value.facultad = faculty.nombre
}

const schemaByTab = [
  graduateWizardStepOneSchema,
  graduateWizardStepTwoSchema,
  graduateWizardStepThreeSchema,
  graduateWizardStepFourSchema,
  graduateWizardStepFourSchema,
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
  for (let tabIndex = 0; tabIndex <= 2; tabIndex += 1) {
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
    const result = await saveGraduate(wizardPayload.value, props.graduateId)
    if (!result.success)

      return

    await router.push(`/graduates/${props.graduateId}`)
  }
  finally {
    saving.value = false
  }
}

const loadGraduateForEdit = async () => {
  loadingData.value = true

  try {
    const graduate = await graduateService.getById(props.graduateId)

    if (!graduate) {
      await router.push('/graduates')

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
    values.value.escuelaProfesional = ''
    values.value.facultad = ''

    return
  }

  const selectedFaculty = facultyOptions.value.find(item => item.id === facultyId)
  values.value.facultad = selectedFaculty?.nombre || ''

  await loadProfessionalSchools(facultyId)

  if (!professionalSchoolOptions.value.some(item => item.id === values.value.escuelaProfesionalId)) {
    values.value.escuelaProfesionalId = undefined
    values.value.escuelaProfesional = ''
  }
})

watch(() => values.value.escuelaProfesionalId, schoolId => {
  const selected = professionalSchoolOptions.value.find(item => item.id === schoolId)

  if (!selected) {
    values.value.escuelaProfesional = ''
    values.value.facultadId = undefined
    values.value.facultad = ''

    return
  }

  values.value.escuelaProfesional = selected.nombre
  values.value.facultadId = resolveSchoolFacultyId(selected)

  const selectedFaculty = facultyOptions.value.find(item => item.id === resolveSchoolFacultyId(selected))
  values.value.facultad = selectedFaculty?.nombre || ''
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
            Editar Graduado
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Gestiona informacion personal, contacto y trayectoria academica desde un solo panel.
          </div>
        </div>

        <div class="d-flex gap-2">
          <VBtn
            variant="tonal"
            color="secondary"
            :to="`/graduates/${graduateId}`"
          >
            Volver al detalle
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
                  label="Codigo de egresado / universitario"
                  maxlength="20"
                  :error-messages="getFieldError('codigoUniversitario')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.dni"
                  label="DNI o documento de identidad"
                  maxlength="8"
                  :error-messages="getFieldError('dni')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.nombres"
                  label="Nombres"
                  maxlength="100"
                  :error-messages="getFieldError('nombres')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.apellidos"
                  label="Apellidos"
                  maxlength="100"
                  :error-messages="getFieldError('apellidos')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppDateTimePicker
                  v-model="values.fechaNacimiento"
                  label="Fecha de nacimiento"
                  :config="{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y', allowInput: true }"
                  :error-messages="getFieldError('fechaNacimiento', 'fechaNacimiento')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="values.sexo"
                  label="Sexo"
                  :items="sexOptions"
                  item-title="title"
                  item-value="value"
                  :error-messages="getFieldError('sexo', 'genero')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppSelect
                  v-model="values.estadoCivil"
                  label="Estado civil"
                  :items="civilStatusOptions"
                  :error-messages="getFieldError('estadoCivil')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.nacionalidad"
                  label="Nacionalidad"
                  maxlength="60"
                  :error-messages="getFieldError('nacionalidad')"
                />
              </VCol>

              <VCol cols="12">
                <AppFileField
                  v-model="values.fotografia"
                  label="Fotografia (opcional)"
                  accept=".png,.jpg,.jpeg,.webp"
                  :error-messages="getFieldError('fotografia')"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <VWindowItem value="datos-contacto">
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.correoPersonal"
                  label="Correo electronico personal"
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
                  label="Numero de celular"
                  maxlength="9"
                  :error-messages="getFieldError('celular')"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="values.direccionActual"
                  label="Direccion actual"
                  maxlength="150"
                  :error-messages="getFieldError('direccionActual')"
                />
              </VCol>

              <VCol cols="12" md="4">
                <AppTextField
                  v-model="values.ciudad"
                  label="Ciudad"
                  maxlength="80"
                  :error-messages="getFieldError('ciudad')"
                />
              </VCol>

              <VCol cols="12" md="4">
                <AppTextField
                  v-model="values.departamento"
                  label="Departamento"
                  maxlength="80"
                  :error-messages="getFieldError('departamento')"
                />
              </VCol>

              <VCol cols="12" md="4">
                <AppTextField
                  v-model="values.paisResidencia"
                  label="Pais de residencia"
                  maxlength="80"
                  :error-messages="getFieldError('paisResidencia')"
                />
              </VCol>

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
                  <th scope="col">Tipo</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Universidad</th>
                  <th scope="col">Modalidad</th>
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
                  <td>{{ row.modalidad }}</td>
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
                    label="Tipo de grado"
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
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="degreeDraft.otroGradoNombre"
                    label="Nombre del grado"
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
                    label="Nivel"
                    :items="languageLevelOptions"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="languageDraft.aprendizaje"
                    label="Forma de aprendizaje"
                    maxlength="100"
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
