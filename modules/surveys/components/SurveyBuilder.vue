<script setup lang="ts">
import { computed, ref } from 'vue'
import QuestionBuilder from './QuestionBuilder.vue'
import SurveyPreview from './SurveyPreview.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyService } from '@/composables/useSurveyService'
import { type CreateSurveyRequest, type Survey, type SurveyQuestion, SurveyType } from '@/modules/surveys/types'

interface Props {
  editingSurvey?: Survey | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [survey: Survey]
  cancel: []
}>()

// Composables
const { createSurvey, updateSurvey, loadingSave } = useSurveyService()
const { showSnackbar } = useSnackbar()

// Estado del formulario
const surveyForm = ref<CreateSurveyRequest>({
  title: '',
  description: '',
  survey_type: SurveyType.CUSTOM,
  questions: [],
})

// Estado de la interfaz
const previewMode = ref(false)
const showQuestionBuilder = ref(false)
const editingQuestionIndex = ref<number | null>(null)

// Opciones para el tipo de encuesta
const surveyTypeOptions = [
  { title: 'Estado Laboral', value: SurveyType.EMPLOYMENT_STATUS },
  { title: 'Satisfacción', value: SurveyType.SATISFACTION },
  { title: 'Retroalimentación', value: SurveyType.FEEDBACK },
  { title: 'Evaluación', value: SurveyType.EVALUATION },
  { title: 'Personalizada', value: SurveyType.CUSTOM },
]

// Validaciones
const isValidSurvey = computed(() => {
  return surveyForm.value.title.trim() !== ''
         && surveyForm.value.description.trim() !== ''
         && surveyForm.value.questions.length > 0
})

// Inicializar formulario si está editando
if (props.editingSurvey) {
  surveyForm.value = {
    title: props.editingSurvey.title,
    description: props.editingSurvey.description,
    survey_type: props.editingSurvey.survey_type,
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

// Métodos para manejar preguntas
function addQuestion() {
  editingQuestionIndex.value = null
  showQuestionBuilder.value = true
}

function editQuestion(index: number) {
  editingQuestionIndex.value = index
  showQuestionBuilder.value = true
}

function saveQuestion(question: Omit<SurveyQuestion, 'id'>) {
  if (editingQuestionIndex.value !== null) {
    // Editando pregunta existente
    surveyForm.value.questions[editingQuestionIndex.value] = question
  }
  else {
    // Agregando nueva pregunta
    surveyForm.value.questions.push(question)
  }

  showQuestionBuilder.value = false
  editingQuestionIndex.value = null
}

function deleteQuestion(index: number) {
  surveyForm.value.questions.splice(index, 1)
}

function moveQuestion(from: number, to: number) {
  const questions = [...surveyForm.value.questions]
  const [movedQuestion] = questions.splice(from, 1)

  questions.splice(to, 0, movedQuestion)
  surveyForm.value.questions = questions
}

function cancelQuestionBuilder() {
  showQuestionBuilder.value = false
  editingQuestionIndex.value = null
}

// Métodos para manejar la encuesta
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

    if (result.success) {
      showSnackbar(result.message, 'success')
      emit('save', result.data)
    }
    else {
      showSnackbar(result.message, 'error')
    }
  }
  catch (error) {
    showSnackbar('Error al guardar la encuesta', 'error')
  }
}

function cancelSurvey() {
  emit('cancel')
}

function togglePreview() {
  previewMode.value = !previewMode.value
}

// Obtener la pregunta que se está editando
const currentEditingQuestion = computed(() => {
  if (editingQuestionIndex.value !== null)
    return surveyForm.value.questions[editingQuestionIndex.value]

  return null
})
</script>

<template>
  <div class="survey-builder">
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>{{ editingSurvey ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}</VCardTitle>
      </VCardItem>
      <VDivider />
      <VCardText class="d-flex justify-space-between align-center">
        <div class="d-flex align-center gap-2">
          <VChip
            v-if="editingSurvey"
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

        <div class="d-flex gap-2">
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
            :prepend-icon="editingSurvey ? 'tabler-device-floppy' : 'tabler-check'"
            color="primary"
            :disabled="!isValidSurvey"
            :loading="loadingSave"
            @click="saveSurvey"
          >
            {{ editingSurvey ? 'Actualizar' : 'Guardar' }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <VRow>
      <!-- Panel de construcción -->
      <VCol
        :cols="previewMode ? 6 : 12"
        :md="previewMode ? 6 : 12"
      >
        <VCard>
          <VCardTitle>
            <VIcon start>
              mdi-form-select
            </VIcon>
            Configuración de la Encuesta
          </VCardTitle>

          <VCardText>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="surveyForm.title"
                  label="Título de la encuesta"
                  required
                  placeholder="Ej: Encuesta de Satisfacción Laboral"
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="surveyForm.description"
                  label="Descripción"
                  required
                  rows="3"
                  placeholder="Describe el propósito de esta encuesta..."
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="surveyForm.survey_type"
                  :items="surveyTypeOptions"
                  label="Tipo de encuesta"
                  required
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Lista de preguntas -->
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

            <div
              v-else
              class="questions-list"
            >
              <VCard
                v-for="(question, index) in surveyForm.questions"
                :key="index"
                variant="outlined"
                class="mb-3"
              >
                <VCardText>
                  <div class="d-flex justify-space-between align-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-center gap-2 mb-2">
                        <VChip
                          size="small"
                          variant="tonal"
                          color="primary"
                        >
                          {{ index + 1 }}
                        </VChip>

                        <VChip
                          size="small"
                          variant="outlined"
                          :color="question.required ? 'error' : 'success'"
                        >
                          {{ question.required ? 'Requerida' : 'Opcional' }}
                        </VChip>

                        <VChip
                          size="small"
                          variant="tonal"
                          color="secondary"
                        >
                          {{ question.question_type }}
                        </VChip>
                      </div>

                      <p class="text-body-1 mb-2">
                        {{ question.question_text }}
                      </p>

                      <div
                        v-if="question.options.length > 0"
                        class="ml-4"
                      >
                        <p class="text-body-2 text-medium-emphasis mb-1">
                          Opciones:
                        </p>
                        <ul class="text-body-2">
                          <li
                            v-for="option in question.options"
                            :key="option.order_number"
                          >
                            {{ option.option_text }}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div class="d-flex flex-column gap-1">
                      <VBtn
                        size="small"
                        color="primary"
                        icon
                        @click="editQuestion(index)"
                      >
                        <VTooltip activator="parent">
                          Editar pregunta
                        </VTooltip>
                        <VIcon icon="tabler-edit" />
                      </VBtn>

                      <VBtn
                        size="small"
                        color="info"
                        icon
                        :disabled="index === 0"
                        @click="moveQuestion(index, index - 1)"
                      >
                        <VTooltip activator="parent">
                          Mover arriba
                        </VTooltip>
                        <VIcon icon="tabler-arrow-up" />
                      </VBtn>

                      <VBtn
                        size="small"
                        color="info"
                        icon
                        :disabled="index === surveyForm.questions.length - 1"
                        @click="moveQuestion(index, index + 1)"
                      >
                        <VTooltip activator="parent">
                          Mover abajo
                        </VTooltip>
                        <VIcon icon="tabler-arrow-down" />
                      </VBtn>

                      <VBtn
                        size="small"
                        color="error"
                        icon
                        @click="deleteQuestion(index)"
                      >
                        <VTooltip activator="parent">
                          Eliminar pregunta
                        </VTooltip>
                        <VIcon icon="tabler-trash" />
                      </VBtn>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
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
              :title="surveyForm.title || 'Título de la encuesta'"
              :description="surveyForm.description || 'Descripción de la encuesta'"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Diálogo para construir preguntas -->
    <VDialog
      v-model="showQuestionBuilder"
      max-width="800"
      persistent
    >
      <QuestionBuilder
        :question="currentEditingQuestion"
        @save="saveQuestion"
        @cancel="cancelQuestionBuilder"
      />
    </VDialog>
  </div>
</template>

<style scoped>
.survey-builder {
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 1200px;
}

.questions-list {
  max-block-size: 600px;
  overflow-y: auto;
}
</style>
