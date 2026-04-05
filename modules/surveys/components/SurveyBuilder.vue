<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw } from 'vue'
import { useSurveyService } from '../composables/useSurveyService'
import type { SurveyTemplate } from '../utils/surveyTemplates'
import QuestionBuilder from './QuestionBuilder.vue'
import SurveyPreview from './SurveyPreview.vue'
import SurveyTemplateSelector from './SurveyTemplateSelector.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { type CreateSurveyRequest, type Survey, type SurveyQuestion, SurveyStatus, type SurveyTypeOption } from '@/modules/surveys/types'
import { getCurrentDateISO } from '@/utils/dateUtils'

interface Props {
  editingSurvey?: Survey | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [survey: Survey | null]
  cancel: []
}>()

// Composables
const { createSurvey, updateSurvey, loadingSave, fetchSurveyTypes } = useSurveyService()
const { showSnackbar } = useSnackbar()

// Estado del formulario
const surveyForm = ref<CreateSurveyRequest>({
  title: '',
  description: '',
  survey_type_id: 1,
  status: SurveyStatus.DRAFT,
  start_date: getCurrentDateISO(),
  end_date: undefined,
  questions: [],
})

// Estado de la interfaz
const previewMode = ref(false)
const expandedPanel = ref<number | undefined>(undefined)
const showTemplateSelector = ref(false)
const showPublishConfirm = ref(false)

// Estado para los tipos de encuesta
const surveyTypeOptions = ref<Array<{ title: string; value: number }>>([])
const loadingSurveyTypes = ref(false)

// Computed: si estamos editando una encuesta existente
const isEditing = computed(() => !!props.editingSurvey?.id)

// Opciones para el estado de encuesta
const statusOptions = [
  { title: 'Borrador', value: SurveyStatus.DRAFT },
  { title: 'Activa', value: SurveyStatus.ACTIVE },
  { title: 'Pausada', value: SurveyStatus.PAUSED },
  { title: 'Cerrada', value: SurveyStatus.CLOSED },
  { title: 'Completada', value: SurveyStatus.COMPLETED },
]

// Mapa de labels para tipos de pregunta
const questionTypeLabels: Record<string, string> = {
  YES_NO: 'Si/No',
  SCALE: 'Escala',
  SINGLE_CHOICE: 'Opcion unica',
  MULTIPLE_CHOICE: 'Opcion multiple',
  TEXT: 'Texto',
  NUMBER: 'Numero',
  DATE: 'Fecha',
  EMAIL: 'Email',
  PHONE: 'Telefono',
}

// Computed: texto del boton guardar
const saveButtonText = computed(() => {
  if (isEditing.value)
    return 'Guardar cambios'

  return 'Guardar borrador'
})

// Computed: puede publicar (editando y estado DRAFT)
const canPublish = computed(() => {
  return isEditing.value && surveyForm.value.status === SurveyStatus.DRAFT
})

// Cargar tipos de encuesta
async function loadSurveyTypes() {
  loadingSurveyTypes.value = true

  try {
    const result = await fetchSurveyTypes()

    if (result.success) {
      surveyTypeOptions.value = result.data.map((type: SurveyTypeOption) => ({
        title: type.value,
        value: type.key,
      }))
    }
    else {
      showSnackbar('Error al cargar los tipos de encuesta', 'error')
    }
  }
  catch (error) {
    console.error('Error loading survey types:', error)
    showSnackbar('Error al cargar los tipos de encuesta', 'error')
  }
  finally {
    loadingSurveyTypes.value = false
  }
}

// Validaciones
const isValidSurvey = computed(() => {
  return surveyForm.value.title.trim() !== ''
         && surveyForm.value.description.trim() !== ''
         && surveyForm.value.questions.length > 0
})

// Inicializar formulario si esta editando
if (props.editingSurvey) {
  surveyForm.value = {
    title: props.editingSurvey.title,
    description: props.editingSurvey.description,
    survey_type_id: props.editingSurvey.survey_type.id,
    status: props.editingSurvey.status,
    start_date: props.editingSurvey.start_date,
    end_date: props.editingSurvey.end_date,
    questions: props.editingSurvey.questions.map(q => ({
      question_text: q.question_text,
      question_type: q.question_type,
      required: q.required,
      options: q.options.map(opt => ({
        option_text: opt.option_text,
        order_number: opt.order_number,
      })),
    })),
  }
}
else {
  // Modo creacion: mostrar selector de plantillas
  showTemplateSelector.value = true
}

// Cargar tipos de encuesta al montar el componente
onMounted(() => {
  loadSurveyTypes()
})

// Metodo para seleccionar plantilla
function handleTemplateSelect(template: SurveyTemplate | null) {
  showTemplateSelector.value = false

  if (template) {
    surveyForm.value.questions = template.questions.map(q => ({
      question_text: q.question_text,
      question_type: q.question_type as SurveyQuestion['question_type'],
      required: q.required,
      options: q.options.map(opt => ({
        option_text: opt.option_text,
        order_number: opt.order_number,
      })),
    }))

    // Auto-expandir la primera pregunta
    if (surveyForm.value.questions.length > 0)
      expandedPanel.value = 0
  }
}

// Metodos para manejar preguntas
function addQuestion() {
  surveyForm.value.questions.push({
    question_text: '',
    question_type: 'TEXT' as SurveyQuestion['question_type'],
    required: false,
    options: [],
  })

  // Auto-expandir la nueva pregunta
  nextTick(() => {
    expandedPanel.value = surveyForm.value.questions.length - 1
  })
}

function deleteQuestion(index: number) {
  surveyForm.value.questions.splice(index, 1)

  // Si el panel expandido era el eliminado, cerrar
  if (expandedPanel.value === index)
    expandedPanel.value = undefined
  else if (expandedPanel.value !== undefined && expandedPanel.value > index)
    expandedPanel.value = expandedPanel.value - 1
}

function duplicateQuestion(index: number) {
  const original = surveyForm.value.questions[index]
  const copy = JSON.parse(JSON.stringify(toRaw(original)))

  delete copy.id
  copy.question_text = `${copy.question_text} (copia)`
  copy.options = copy.options?.map((opt: any) => ({ ...opt, id: undefined })) || []
  surveyForm.value.questions.splice(index + 1, 0, copy)

  nextTick(() => {
    expandedPanel.value = index + 1
  })
}

function moveQuestion(from: number, to: number) {
  const questions = [...surveyForm.value.questions]
  const [movedQuestion] = questions.splice(from, 1)

  questions.splice(to, 0, movedQuestion)
  surveyForm.value.questions = questions

  // Mover tambien el panel expandido si es necesario
  if (expandedPanel.value === from) {
    expandedPanel.value = to
  }
  else if (expandedPanel.value !== undefined) {
    if (from < expandedPanel.value && to >= expandedPanel.value)
      expandedPanel.value = expandedPanel.value - 1
    else if (from > expandedPanel.value && to <= expandedPanel.value)
      expandedPanel.value = expandedPanel.value + 1
  }
}

// Actualizar pregunta desde QuestionBuilder inline
function handleQuestionUpdate(index: number, question: Omit<SurveyQuestion, 'id'>) {
  surveyForm.value.questions[index] = {
    question_text: question.question_text,
    question_type: question.question_type,
    required: question.required,
    options: question.options,
  }
}

// Truncar texto para el header
function truncateText(text: string, maxLength: number = 80): string {
  if (!text)
    return 'Sin texto'

  if (text.length <= maxLength)
    return text

  return `${text.substring(0, maxLength)}...`
}

// Obtener label del tipo de pregunta
function getQuestionTypeLabel(type: string): string {
  return questionTypeLabels[type] || type
}

// Metodos para manejar la encuesta
async function saveSurvey() {
  if (!isValidSurvey.value) {
    showSnackbar('Por favor completa todos los campos requeridos', 'error')

    return
  }

  try {
    let result
    if (props.editingSurvey?.id)
      result = await updateSurvey(props.editingSurvey.id, surveyForm.value)
    else
      result = await createSurvey(surveyForm.value)
    if (result.success || !result) {
      showSnackbar(result.message, 'success')
      emit('save', result.data ?? null)
    }
    else {
      showSnackbar(result.message, 'error')
    }
  }
  catch (error) {
    showSnackbar('Error al guardar la encuesta', 'error')
  }
}

async function publishSurvey() {
  surveyForm.value.status = SurveyStatus.ACTIVE
  showPublishConfirm.value = false

  if (!isValidSurvey.value) {
    showSnackbar('Por favor completa todos los campos requeridos antes de publicar', 'error')
    surveyForm.value.status = SurveyStatus.DRAFT

    return
  }

  try {
    const result = await updateSurvey(props.editingSurvey!.id!, surveyForm.value)

    if (result.success || !result) {
      showSnackbar('Encuesta publicada exitosamente', 'success')
      emit('save', result.data ?? null)
    }
    else {
      showSnackbar(result.message, 'error')
      surveyForm.value.status = SurveyStatus.DRAFT
    }
  }
  catch (error) {
    showSnackbar('Error al publicar la encuesta', 'error')
    surveyForm.value.status = SurveyStatus.DRAFT
  }
}

function cancelSurvey() {
  emit('cancel')
}

function togglePreview() {
  previewMode.value = !previewMode.value
}
</script>

<template>
  <div class="survey-builder">
    <!-- Selector de plantillas (solo en creacion) -->
    <template v-if="showTemplateSelector">
      <SurveyTemplateSelector @select="handleTemplateSelect" />
    </template>

    <!-- Builder principal -->
    <template v-if="!showTemplateSelector">
      <!-- Barra de acciones superior -->
      <VCard class="mb-6">
        <VCardItem class="pb-4">
          <VCardTitle>{{ isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}</VCardTitle>
        </VCardItem>
        <VDivider />
        <VCardText class="d-flex justify-space-between align-center flex-wrap ga-2">
          <div class="d-flex align-center gap-2">
            <VChip
              v-if="isEditing"
              color="info"
              variant="tonal"
              size="small"
            >
              <VIcon
                start
                icon="tabler-edit"
              />
              Editando
            </VChip>
            <VChip
              v-else
              color="success"
              variant="tonal"
              size="small"
            >
              <VIcon
                start
                icon="tabler-plus"
              />
              Nueva Encuesta
            </VChip>

            <VChip
              v-if="surveyForm.questions.length > 0"
              color="primary"
              variant="outlined"
              size="small"
            >
              {{ surveyForm.questions.length }} preguntas
            </VChip>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <VBtn
              :prepend-icon="previewMode ? 'tabler-edit' : 'tabler-eye'"
              variant="outlined"
              color="secondary"
              @click="togglePreview"
            >
              {{ previewMode ? 'Editar' : 'Previsualizar' }}
            </VBtn>

            <VBtn
              prepend-icon="tabler-x"
              variant="outlined"
              @click="cancelSurvey"
            >
              Cancelar
            </VBtn>

            <VBtn
              v-if="canPublish"
              prepend-icon="tabler-send"
              color="success"
              @click="showPublishConfirm = true"
            >
              Publicar
            </VBtn>

            <VBtn
              :prepend-icon="isEditing ? 'tabler-device-floppy' : 'tabler-check'"
              color="primary"
              :disabled="!isValidSurvey"
              :loading="loadingSave"
              @click="saveSurvey"
            >
              {{ saveButtonText }}
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <VRow>
        <!-- Panel de construccion -->
        <VCol
          :cols="previewMode ? 6 : 12"
          :md="previewMode ? 6 : 12"
        >
          <!-- Configuracion de la encuesta -->
          <VCard>
            <VCardTitle>
              <VIcon start>
                mdi-form-select
              </VIcon>
              Configuracion de la Encuesta
            </VCardTitle>

            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="surveyForm.title"
                    label="Titulo de la encuesta"
                    required
                    placeholder="Ej: Encuesta de Satisfaccion Laboral"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextarea
                    v-model="surveyForm.description"
                    label="Descripcion"
                    required
                    rows="3"
                    placeholder="Describe el proposito de esta encuesta..."
                  />
                </VCol>

                <VCol cols="12">
                  <VSelect
                    v-model="surveyForm.survey_type_id"
                    :items="surveyTypeOptions"
                    label="Tipo de encuesta"
                    required
                  />
                </VCol>

                <VCol
                  v-if="isEditing"
                  cols="12"
                >
                  <VSelect
                    v-model="surveyForm.status"
                    :items="statusOptions"
                    label="Estado de la encuesta"
                    required
                  />
                </VCol>

                <VCol cols="12">
                  <AppDateTimePicker
                    v-model="surveyForm.start_date"
                    label="Fecha de inicio"
                    required
                  />
                </VCol>

                <VCol cols="12">
                  <AppDateTimePicker
                    v-model="surveyForm.end_date"
                    label="Fecha de finalizacion"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Lista de preguntas con expansion panels -->
          <VCard class="mt-4">
            <VCardItem class="pb-4">
              <VCardTitle class="d-flex justify-space-between align-center">
                <div>
                  <VIcon
                    start
                    icon="tabler-help-circle"
                  />
                  Preguntas ({{ surveyForm.questions.length }})
                </div>

                <VBtn
                  prepend-icon="tabler-plus"
                  color="primary"
                  size="small"
                  @click="addQuestion"
                >
                  Agregar Pregunta
                </VBtn>
              </VCardTitle>
            </VCardItem>
            <VDivider />

            <VCardText>
              <!-- Estado vacio -->
              <div
                v-if="surveyForm.questions.length === 0"
                class="text-center py-8"
              >
                <VIcon
                  size="64"
                  color="grey-lighten-2"
                >
                  mdi-help-circle-outline
                </VIcon>
                <p class="text-h6 mt-4 mb-2">
                  No hay preguntas
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  Agrega preguntas para comenzar a construir tu encuesta
                </p>
              </div>

              <!-- Expansion panels para las preguntas -->
              <VExpansionPanels
                v-else
                v-model="expandedPanel"
                class="questions-list"
              >
                <VExpansionPanel
                  v-for="(question, index) in surveyForm.questions"
                  :key="index"
                  :value="index"
                >
                  <VExpansionPanelTitle>
                    <div class="d-flex align-center gap-2 flex-grow-1 me-2 panel-header">
                      <!-- Numero de pregunta -->
                      <VChip
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="flex-shrink-0"
                      >
                        {{ index + 1 }}
                      </VChip>

                      <!-- Texto de la pregunta (truncado) -->
                      <span class="text-body-1 text-truncate question-text">
                        {{ truncateText(question.question_text) }}
                      </span>

                      <!-- Chip de tipo -->
                      <VChip
                        size="small"
                        variant="tonal"
                        color="secondary"
                        class="flex-shrink-0"
                      >
                        {{ getQuestionTypeLabel(question.question_type) }}
                      </VChip>

                      <!-- Chip requerida -->
                      <VChip
                        v-if="question.required"
                        size="small"
                        variant="tonal"
                        color="error"
                        class="flex-shrink-0"
                      >
                        Requerida
                      </VChip>

                      <VSpacer />

                      <!-- Botones de acciones -->
                      <div
                        class="d-flex gap-1 flex-shrink-0 action-buttons"
                        @click.stop
                      >
                        <VBtn
                          size="x-small"
                          color="secondary"
                          icon
                          variant="text"
                          @click.stop="duplicateQuestion(index)"
                        >
                          <VTooltip activator="parent">
                            Duplicar pregunta
                          </VTooltip>
                          <VIcon
                            icon="tabler-copy"
                            size="18"
                          />
                        </VBtn>

                        <VBtn
                          size="x-small"
                          color="info"
                          icon
                          variant="text"
                          :disabled="index === 0"
                          @click.stop="moveQuestion(index, index - 1)"
                        >
                          <VTooltip activator="parent">
                            Mover arriba
                          </VTooltip>
                          <VIcon
                            icon="tabler-arrow-up"
                            size="18"
                          />
                        </VBtn>

                        <VBtn
                          size="x-small"
                          color="info"
                          icon
                          variant="text"
                          :disabled="index === surveyForm.questions.length - 1"
                          @click.stop="moveQuestion(index, index + 1)"
                        >
                          <VTooltip activator="parent">
                            Mover abajo
                          </VTooltip>
                          <VIcon
                            icon="tabler-arrow-down"
                            size="18"
                          />
                        </VBtn>

                        <VBtn
                          size="x-small"
                          color="error"
                          icon
                          variant="text"
                          @click.stop="deleteQuestion(index)"
                        >
                          <VTooltip activator="parent">
                            Eliminar pregunta
                          </VTooltip>
                          <VIcon
                            icon="tabler-trash"
                            size="18"
                          />
                        </VBtn>
                      </div>
                    </div>
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <QuestionBuilder
                      :question="question"
                      inline
                      @update:question="handleQuestionUpdate(index, $event)"
                    />
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Panel de vista previa -->
        <VCol
          v-if="previewMode"
          cols="6"
          md="6"
        >
          <VCard>
            <VCardTitle>
              <VIcon start>
                mdi-eye
              </VIcon>
              Vista Previa
            </VCardTitle>

            <VCardText>
              <SurveyPreview
                :survey="surveyForm"
                :title="surveyForm.title || 'Titulo de la encuesta'"
                :description="surveyForm.description || 'Descripcion de la encuesta'"
              />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <!-- Dialogo de confirmacion para publicar -->
    <VDialog
      v-model="showPublishConfirm"
      max-width="500"
    >
      <VCard>
        <VCardItem class="pb-4">
          <VCardTitle class="d-flex align-center gap-2">
            <VIcon
              icon="tabler-send"
              color="success"
            />
            Publicar encuesta
          </VCardTitle>
        </VCardItem>
        <VDivider />

        <VCardText class="pt-4">
          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Al publicar, la encuesta estara disponible para todos los graduados activos. ¿Deseas continuar?
          </VAlert>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="showPublishConfirm = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="success"
            prepend-icon="tabler-send"
            :loading="loadingSave"
            @click="publishSurvey"
          >
            Publicar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.survey-builder {
  margin-block: 0;
}

.questions-list {
  max-block-size: none;
}

.panel-header {
  min-inline-size: 0;
  overflow: hidden;
}

.question-text {
  min-inline-size: 0;
  flex: 1 1 auto;
}

.action-buttons {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.v-expansion-panel-title:hover .action-buttons {
  opacity: 1;
}
</style>
