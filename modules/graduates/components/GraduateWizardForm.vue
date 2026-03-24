<script setup lang="ts">
import type { ValidationError } from 'yup'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGraduateForm } from '../composables/useGraduateForm'
import type {
  CivilStatus,
  Gender,
  GraduatePayload,
  GraduateWizardValues,
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

const currentStep = ref(Math.max(0, Math.min(1, props.startStep - 1)))
const localErrors = ref<Record<string, string>>({})
const transitionLoading = ref(false)
const stepValidationMessage = ref('')

const civilStatusOptions: CivilStatus[] = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Conviviente']

const sexOptions: Array<{ title: string; value: Gender }> = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
  { title: 'Otro', value: 'Otro' },
]

const stepItems = [
  { title: 'Datos basicos', icon: 'tabler-user-square-rounded' },
  { title: 'Datos de contacto', icon: 'tabler-address-book' },
]

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

const getYearFromDate = (value?: string) => {
  if (!value)
    return undefined

  return value.slice(0, 4)
}

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
    grado_obtenido: undefined,
    bachiller_fecha: values.value.bachillerFecha || undefined,
    bachiller_universidad: values.value.bachillerUniversidad?.trim() || undefined,
    titulo_profesional_fecha: values.value.tituloProfesionalFecha || undefined,
    titulo_profesional_universidad: values.value.tituloProfesionalUniversidad?.trim() || undefined,
    maestria_fecha: values.value.maestriaFecha || undefined,
    maestria_universidad: values.value.maestriaUniversidad?.trim() || undefined,
    doctorado_fecha: values.value.doctoradoFecha || undefined,
    doctorado_universidad: values.value.doctoradoUniversidad?.trim() || undefined,
    otro_grado_nombre: undefined,
    otro_grado_fecha: undefined,
    otro_grado_universidad: undefined,
    modalidad_titulacion: undefined,
    modalidad_titulacion_otro: undefined,
    idioma_nombre: undefined,
    idioma_nivel: undefined,
    idioma_fecha_inicio: undefined,
    idioma_fecha_fin: undefined,
    idioma_aprendizaje: undefined,
    contrasena: values.value.dni.trim(),
    cv_path: values.value.fotografia || undefined,
  }

  return payload
})

const activeStepLabel = computed(() => stepItems[currentStep.value]?.title || '')

const actionLabel = computed(() => {
  if (currentStep.value === stepItems.length - 1)
    return 'Registrar y finalizar'

  return 'Siguiente'
})

const canGoBack = computed(() => currentStep.value > 0 && !transitionLoading.value)

const lastStepIndex = computed(() => stepItems.length - 1)

const getFieldError = (localField: string, backendField?: string): string | undefined => {
  const localError = localErrors.value[localField]
  if (localError)
    return localError

  return serverErrors.value[backendField ?? localField]
}

const getSchemaForStep = (stepIndex: number) => {
  if (stepIndex === 0)
    return graduateWizardStepOneSchema
  if (stepIndex === 1)
    return graduateWizardStepTwoSchema

  return graduateWizardStepTwoSchema
}

const validateCurrentStep = async (): Promise<boolean> => {
  localErrors.value = {}
  stepValidationMessage.value = ''
  clearServerErrors()

  try {
    await getSchemaForStep(currentStep.value).validate(values.value, { abortEarly: false })

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
    const firstErrorMessage = validationError.inner.find(issue => issue.message)?.message || 'Revisa los campos obligatorios para continuar.'

    stepValidationMessage.value = firstErrorMessage

    return false
  }
}

const goPrevious = () => {
  if (!canGoBack.value)
    return

  currentStep.value -= 1
}

const advanceOneStep = async () => {
  if (transitionLoading.value)
    return

  const isValid = await validateCurrentStep()
  if (!isValid)
    return

  if (currentStep.value < lastStepIndex.value) {
    currentStep.value += 1
    return
  }

  transitionLoading.value = true

  try {
    const result = await saveGraduate(wizardPayload.value)

    if (!result.success || !result.createdGraduateId)
      return

    await router.push(`/graduates/${result.createdGraduateId}`)
  }
  finally {
    transitionLoading.value = false
  }
}

const handleStepChange = async (nextStep: number) => {
  if (transitionLoading.value)
    return

  if (nextStep <= currentStep.value) {
    currentStep.value = nextStep

    return
  }

  while (currentStep.value < nextStep) {
    const previousStep = currentStep.value
    await advanceOneStep()
    if (currentStep.value === previousStep)
      return
  }
}

const goNext = async () => {
  await advanceOneStep()
}

watch(currentStep, () => {
  stepValidationMessage.value = ''
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
          :to="'/graduates'"
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
          <VWindowItem :value="0">
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

          <VWindowItem :value="1">
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

        </VWindow>

        <VAlert
          v-if="stepValidationMessage"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          {{ stepValidationMessage }}
        </VAlert>

        <div class="d-flex justify-space-between gap-2">
          <VBtn
            variant="tonal"
            color="secondary"
            :disabled="!canGoBack"
            @click="goPrevious"
          >
            Anterior
          </VBtn>

          <VBtn
            color="primary"
            :loading="submitting || transitionLoading"
            :disabled="transitionLoading"
            @click="goNext"
          >
            {{ actionLabel }}
          </VBtn>
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
