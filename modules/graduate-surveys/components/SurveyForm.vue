<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useGraduateSurveyService } from '@/composables/useGraduateSurveyService'
import { useSnackbar } from '@/composables/useSnackbar'
import type {
  QuestionType,
  SurveySubmissionRequest,
} from '@/modules/graduate-surveys/types'

interface Props {
  surveyId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  completed: []
  cancel: []
}>()

// Composables
const {
  currentSurvey,
  loadingDetail,
  loadingSubmit,
  fetchSurveyDetail,
  submitSurveyResponses,
} = useGraduateSurveyService()

const { showSnackbar } = useSnackbar()

// Estado del formulario simple
const answers = ref<{ [key: number]: any }>({})
const currentQuestionIndex = ref(0)
const showConfirmDialog = ref(false)

// Estados computados
const survey = computed(() => currentSurvey.value)
const questions = computed(() => survey.value?.questions || [])
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const totalQuestions = computed(() => questions.value.length)

const progress = computed(() => {
  if (totalQuestions.value === 0)
    return 0

  return Math.round(((currentQuestionIndex.value + 1) / totalQuestions.value) * 100)
})

const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)

const allRequiredQuestionsAnswered = computed(() => {
  return questions.value.every(question => {
    if (!question.required)
      return true

    const answer = answers.value[question.question_id]
    if (!answer)
      return false

    switch (question.question_type) {
      case 'TEXT':
      case 'DATE':
      case 'EMAIL':
      case 'PHONE':
        return typeof answer === 'string' && answer.trim() !== ''
      case 'NUMBER':
        return typeof answer === 'number' && !isNaN(answer)
      case 'YES_NO':
      case 'SINGLE_CHOICE':
        return answer !== null && answer !== undefined
      case 'MULTIPLE_CHOICE':
        return Array.isArray(answer) && answer.length > 0
      default:
        return false
    }
  })
})

// Métodos
const initializeForm = () => {
  if (!survey.value)
    return

  // Inicializar respuestas existentes
  survey.value.questions.forEach(question => {
    if (question.answered) {
      switch (question.question_type) {
        case 'TEXT':
        case 'DATE':
        case 'EMAIL':
        case 'PHONE':
          answers.value[question.question_id] = question.text_response || ''
          break
        case 'NUMBER':
          answers.value[question.question_id] = question.number_response || null
          break
        case 'YES_NO':
        case 'SINGLE_CHOICE':
          answers.value[question.question_id] = question.selected_option_ids?.[0] || null
          break
        case 'MULTIPLE_CHOICE':
          answers.value[question.question_id] = question.selected_option_ids || []
          break
      }
    }
  })
}

const loadSurvey = async () => {
  const result = await fetchSurveyDetail(props.surveyId)
  if (!result.success) {
    showSnackbar(result.message, 'error')
    emit('cancel')
  }
  else {
    initializeForm()
  }
}

const validateCurrentQuestion = () => {
  if (!currentQuestion.value)
    return false

  if (!currentQuestion.value.required)
    return true

  const answer = answers.value[currentQuestion.value.question_id]

  switch (currentQuestion.value.question_type) {
    case 'TEXT':
    case 'DATE':
    case 'EMAIL':
    case 'PHONE':
      return typeof answer === 'string' && answer.trim() !== ''
    case 'NUMBER':
      return typeof answer === 'number' && !isNaN(answer)
    case 'YES_NO':
    case 'SINGLE_CHOICE':
      return answer !== null && answer !== undefined
    case 'MULTIPLE_CHOICE':
      return Array.isArray(answer) && answer.length > 0
    default:
      return false
  }
}

const nextQuestion = () => {
  if (!validateCurrentQuestion() && currentQuestion.value?.required) {
    showSnackbar('Por favor responde la pregunta antes de continuar', 'warning')

    return
  }

  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

const handleSubmit = () => {
  if (!allRequiredQuestionsAnswered.value) {
    showSnackbar('Por favor responde todas las preguntas requeridas', 'warning')

    return
  }

  showConfirmDialog.value = true
}

const confirmSubmit = async () => {
  if (!survey.value)
    return

  // Construir respuestas en el formato requerido
  const responses = questions.value.map(question => {
    const answer = answers.value[question.question_id]

    if (!answer)
      return null

    switch (question.question_type) {
      case 'TEXT':
      case 'DATE':
      case 'EMAIL':
      case 'PHONE':
        return {
          question_id: question.question_id,
          text_response: answer,
        }
      case 'NUMBER':
        return {
          question_id: question.question_id,
          number_response: answer,
        }
      case 'YES_NO':
      case 'SINGLE_CHOICE':
        return {
          question_id: question.question_id,
          selected_option_ids: [answer],
        }
      case 'MULTIPLE_CHOICE':
        return {
          question_id: question.question_id,
          selected_option_ids: answer,
        }
      default:
        return null
    }
  }).filter(response => response !== null)

  const submissionData: SurveySubmissionRequest = {
    survey_id: survey.value.survey_id,
    responses,
  }

  const result = await submitSurveyResponses(submissionData)
  if (result.success) {
    showSnackbar(result.message, 'success')
    emit('completed')
  }
  else {
    showSnackbar(result.message, 'error')
  }

  showConfirmDialog.value = false
}

const handleCancel = () => {
  emit('cancel')
}

const formatQuestionType = (type: QuestionType) => {
  const types = {
    YES_NO: 'Sí/No',
    TEXT: 'Texto',
    NUMBER: 'Número',
    DATE: 'Fecha',
    EMAIL: 'Email',
    PHONE: 'Teléfono',
    SINGLE_CHOICE: 'Opción única',
    MULTIPLE_CHOICE: 'Opción múltiple',
  }

  return types[type] || type
}

// Watchers
watch(() => props.surveyId, () => {
  if (props.surveyId)
    loadSurvey()
})

// Cargar al montar
onMounted(() => {
  if (props.surveyId)
    loadSurvey()
})
</script>

<template>
  <div>
    <!-- Encabezado de la encuesta -->
    <VCard v-if="survey && !loadingDetail">
      <VCardItem>
        <VCardTitle class="text-h4">
          {{ survey.survey_title }}
        </VCardTitle>
        <VCardSubtitle>
          {{ survey.survey_description }}
        </VCardSubtitle>
      </VCardItem>

      <!-- Progreso -->
      <VCardText>
        <div class="d-flex align-center mb-4">
          <VProgressLinear
            :model-value="progress"
            height="8"
            color="primary"
            class="flex-grow-1 me-4"
          />
          <span class="text-caption">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
        </div>
      </VCardText>
    </VCard>

    <!-- Formulario de pregunta -->
    <VCard
      v-if="currentQuestion && !loadingDetail"
      class="mt-4"
    >
      <VCardItem>
        <VCardTitle class="text-h5">
          {{ currentQuestion.question_text }}
        </VCardTitle>
        <VCardSubtitle>
          <VChip
            size="small"
            :color="currentQuestion.required ? 'error' : 'success'"
            variant="tonal"
          >
            {{ currentQuestion.required ? 'Requerida' : 'Opcional' }}
          </VChip>
          <VChip
            size="small"
            color="info"
            variant="tonal"
            class="ms-2"
          >
            {{ formatQuestionType(currentQuestion.question_type) }}
          </VChip>
        </VCardSubtitle>
      </VCardItem>

      <VCardText>
        <!-- Respuesta de texto (TEXT, DATE, EMAIL, PHONE) -->
        <div v-if="['TEXT', 'DATE', 'EMAIL', 'PHONE'].includes(currentQuestion.question_type)">
          <VTextField
            v-model="answers[currentQuestion.question_id]"
            :label="currentQuestion.question_type === 'TEXT' ? 'Escribe tu respuesta'
              : currentQuestion.question_type === 'DATE' ? 'Ingresa la fecha'
                : currentQuestion.question_type === 'EMAIL' ? 'Ingresa tu email'
                  : 'Ingresa tu teléfono'"
            :type="currentQuestion.question_type === 'EMAIL' ? 'email'
              : currentQuestion.question_type === 'PHONE' ? 'tel'
                : currentQuestion.question_type === 'DATE' ? 'date'
                  : 'text'"
            :rules="currentQuestion.required ? [v => !!v || 'Este campo es requerido'] : []"
            variant="outlined"
          />
        </div>

        <!-- Respuesta numérica -->
        <div v-else-if="currentQuestion.question_type === 'NUMBER'">
          <VTextField
            v-model.number="answers[currentQuestion.question_id]"
            label="Ingresa un número"
            type="number"
            :rules="currentQuestion.required ? [v => v !== '' && v !== null || 'Este campo es requerido'] : []"
            variant="outlined"
          />
        </div>

        <!-- Respuesta Sí/No -->
        <div v-else-if="currentQuestion.question_type === 'YES_NO'">
          <VRadioGroup
            :model-value="answers[currentQuestion.question_id] || null"
            inline
            @update:model-value="(value) => answers[currentQuestion.question_id] = value"
          >
            <VRadio
              v-for="option in currentQuestion.options"
              :key="`yes_no_${option.id}`"
              :label="option.option_text"
              :value="option.id"
              color="primary"
            />
          </VRadioGroup>
        </div>

        <!-- Respuesta de opción única -->
        <div v-else-if="currentQuestion.question_type === 'SINGLE_CHOICE'">
          <VRadioGroup
            :model-value="answers[currentQuestion.question_id] || null"
            @update:model-value="(value) => answers[currentQuestion.question_id] = value"
          >
            <VRadio
              v-for="option in currentQuestion.options"
              :key="`single_${option.id}`"
              :label="option.option_text"
              :value="option.id"
              color="primary"
            />
          </VRadioGroup>
        </div>

        <!-- Respuesta de opción múltiple -->
        <div v-else-if="currentQuestion.question_type === 'MULTIPLE_CHOICE'">
          <div class="d-flex flex-column gap-2">
            <VCheckbox
              v-for="option in currentQuestion.options"
              :key="option.id"
              :label="option.option_text"
              :value="option.id"
              color="primary"
              @update:model-value="(value) => {
                if (!answers[currentQuestion.question_id]) {
                  answers[currentQuestion.question_id] = []
                }
                if (value) {
                  if (!answers[currentQuestion.question_id].includes(option.id)) {
                    answers[currentQuestion.question_id].push(option.id)
                  }
                }
                else {
                  const idx = answers[currentQuestion.question_id].indexOf(option.id)
                  if (idx > -1) {
                    answers[currentQuestion.question_id].splice(idx, 1)
                  }
                }
              }"
            />
          </div>
        </div>
      </VCardText>

      <!-- Acciones -->
      <VCardActions class="d-flex justify-space-between pa-4">
        <VBtn
          v-if="!isFirstQuestion"
          variant="outlined"
          @click="previousQuestion"
        >
          <VIcon
            icon="tabler-arrow-left"
            class="me-2"
          />
          Anterior
        </VBtn>
        <VSpacer v-else />

        <div class="d-flex gap-2">
          <VBtn
            variant="outlined"
            color="error"
            @click="handleCancel"
          >
            Cancelar
          </VBtn>

          <VBtn
            v-if="!isLastQuestion"
            color="primary"
            @click="nextQuestion"
          >
            Siguiente
            <VIcon
              icon="tabler-arrow-right"
              class="ms-2"
            />
          </VBtn>

          <VBtn
            v-else
            color="success"
            @click="handleSubmit"
          >
            Finalizar Encuesta
            <VIcon
              icon="tabler-check"
              class="ms-2"
            />
          </VBtn>
        </div>
      </VCardActions>
    </VCard>

    <!-- Cargando -->
    <VCard v-if="loadingDetail">
      <VCardText class="text-center py-8">
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
        />
        <div class="mt-4">
          Cargando encuesta...
        </div>
      </VCardText>
    </VCard>

    <!-- Diálogo de confirmación -->
    <VDialog
      v-model="showConfirmDialog"
      max-width="400"
      persistent
    >
      <VCard>
        <VCardTitle>
          <VIcon
            icon="tabler-help-circle"
            class="me-2"
          />
          Confirmar envío
        </VCardTitle>

        <VCardText>
          ¿Estás seguro de que deseas enviar tus respuestas? Una vez enviadas no podrás modificarlas.
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="showConfirmDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="success"
            :loading="loadingSubmit"
            @click="confirmSubmit"
          >
            Confirmar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.question-response {
  min-block-size: 120px;
}

.v-radio-group {
  margin-block-start: 0;
}

.v-checkbox {
  margin-block-end: 8px;
}
</style>
