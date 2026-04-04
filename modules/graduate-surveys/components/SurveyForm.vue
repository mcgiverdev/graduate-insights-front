<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useDebounceFn, useNow } from '@vueuse/core'
import { useGraduateSurveyService } from '../composables/useGraduateSurveyService'
import type {
  GraduateSurveyQuestion,
  SurveySubmissionRequest,
} from '@/modules/graduate-surveys/types'
import { useSnackbar } from '@/composables/useSnackbar'

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
  buildResponsesFromAnswers,
  saveDraft,
} = useGraduateSurveyService()

const { showSnackbar } = useSnackbar()

// State
const answers = reactive<Record<number, any>>({})
const reviewMode = ref(false)
const lastSavedAt = ref<Date | null>(null)
const submitting = ref(false)
const showConfirmDialog = ref(false)

// Reactive now for timeAgo computation
const now = useNow({ interval: 10000 })

// Computed
const survey = computed(() => currentSurvey.value)
const questions = computed(() => survey.value?.questions || [])
const totalQuestions = computed(() => questions.value.length)

// Methods (defined before computed that use them)
const isAnswered = (questionId: number) => {
  const answer = answers[questionId]
  if (answer === undefined || answer === null || answer === '')
    return false
  if (Array.isArray(answer))
    return answer.length > 0

  return true
}

const answeredCount = computed(() =>
  Object.keys(answers).filter(k => isAnswered(Number(k))).length,
)

const progressPercent = computed(() =>
  totalQuestions.value > 0
    ? (answeredCount.value / totalQuestions.value) * 100
    : 0,
)

const missingRequired = computed(() =>
  questions.value.filter(q => q.required && !isAnswered(q.question_id)),
)

const canSubmit = computed(() => answeredCount.value > 0)

const timeAgo = computed(() => {
  if (!lastSavedAt.value)
    return ''

  const seconds = Math.floor((now.value.getTime() - lastSavedAt.value.getTime()) / 1000)

  if (seconds < 60)
    return 'hace unos segundos'

  const minutes = Math.floor(seconds / 60)

  return `hace ${minutes} min`
})

const isRequiredUnanswered = (question: GraduateSurveyQuestion) =>
  question.required && !isAnswered(question.question_id)

const getQuestionStatusIcon = (q: GraduateSurveyQuestion) => {
  if (isAnswered(q.question_id))
    return 'tabler-circle-check-filled'
  if (q.required)
    return 'tabler-circle-x'

  return 'tabler-circle'
}

const getQuestionStatusColor = (q: GraduateSurveyQuestion) => {
  if (isAnswered(q.question_id))
    return 'success'
  if (q.required)
    return 'error'

  return 'grey'
}

const scrollToQuestion = (questionId: number) => {
  reviewMode.value = false
  nextTick(() => {
    document.getElementById(`question-${questionId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.substring(0, max)}...` : text

const enterReviewMode = () => {
  reviewMode.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getAnswerDisplay = (question: GraduateSurveyQuestion) => {
  const answer = answers[question.question_id]

  if (answer === undefined || answer === null || answer === '')
    return null

  if (question.question_type === 'YES_NO')
    return answer === 'SI' ? 'Sí' : answer === 'NO' ? 'No' : String(answer)

  if (['SINGLE_CHOICE', 'SCALE'].includes(question.question_type)) {
    if (question.options && question.options.length > 0) {
      const option = question.options.find(o => o.id === answer)

      return option?.option_text ?? String(answer)
    }

    return String(answer)
  }

  if (question.question_type === 'MULTIPLE_CHOICE') {
    if (!Array.isArray(answer) || answer.length === 0)
      return null

    const selectedTexts = answer
      .map((id: number) => question.options.find(o => o.id === id)?.option_text)
      .filter(Boolean)

    return selectedTexts.join(', ')
  }

  return String(answer)
}

const getInputLabel = (type: string) => {
  const labels: Record<string, string> = {
    TEXT: 'Escribe tu respuesta',
    DATE: 'Ingresa la fecha',
    EMAIL: 'Ingresa tu email',
    PHONE: 'Ingresa tu telefono',
    NUMBER: 'Ingresa un numero',
  }

  return labels[type] || 'Escribe tu respuesta'
}

const getInputType = (type: string) => {
  const inputTypes: Record<string, string> = {
    EMAIL: 'email',
    PHONE: 'tel',
    DATE: 'date',
    NUMBER: 'number',
    TEXT: 'text',
  }

  return inputTypes[type] || 'text'
}

const SCALE_FALLBACK = [
  { id: '1', option_text: '1 - Muy malo' },
  { id: '2', option_text: '2 - Malo' },
  { id: '3', option_text: '3 - Regular' },
  { id: '4', option_text: '4 - Bueno' },
  { id: '5', option_text: '5 - Muy bueno' },
]

const getScaleOptions = (question: GraduateSurveyQuestion) =>
  (question.options && question.options.length > 0)
    ? question.options.map(o => ({ id: o.id as string | number, option_text: o.option_text }))
    : SCALE_FALLBACK

const isCheckboxChecked = (questionId: number, optionId: number) => {
  const current = answers[questionId]

  if (!Array.isArray(current))
    return false

  return current.includes(optionId)
}

const toggleCheckbox = (questionId: number, optionId: number, checked: boolean) => {
  if (!Array.isArray(answers[questionId]))
    answers[questionId] = []

  if (checked) {
    if (!answers[questionId].includes(optionId))
      answers[questionId].push(optionId)
  }
  else {
    const idx = answers[questionId].indexOf(optionId)

    if (idx > -1)
      answers[questionId].splice(idx, 1)
  }
}

// Initialize form from existing answers (draft or partial)
const initializeForm = () => {
  if (!survey.value)
    return

  survey.value.questions.forEach(question => {
    if (question.answered) {
      switch (question.question_type) {
        case 'TEXT':
        case 'DATE':
        case 'EMAIL':
        case 'PHONE':
          answers[question.question_id] = question.text_response || ''
          break
        case 'NUMBER':
          answers[question.question_id] = question.number_response ?? null
          break
        case 'YES_NO':
          answers[question.question_id] = question.text_response || null
          break
        case 'SCALE':
          answers[question.question_id] = (question.options && question.options.length > 0)
            ? (question.selected_option_ids?.[0] ?? null)
            : (question.text_response || null)
          break
        case 'SINGLE_CHOICE':
          answers[question.question_id] = question.selected_option_ids?.[0] ?? null
          break
        case 'MULTIPLE_CHOICE':
          answers[question.question_id] = question.selected_option_ids || []
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

// Auto-save draft
const draftSave = useDebounceFn(async () => {
  if (!survey.value)
    return
  if (Object.keys(answers).length === 0)
    return

  try {
    await saveDraft(survey.value.survey_id, answers, survey.value.questions)
    lastSavedAt.value = new Date()
  }
  catch (e) {
    console.error('Auto-save failed:', e)
  }
}, 30000)

watch(answers, () => {
  draftSave()
}, { deep: true })

// Submit flow
const handleFinalSubmit = async () => {
  if (!survey.value)
    return

  submitting.value = true

  const responses = buildResponsesFromAnswers(answers, survey.value.questions)

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

  submitting.value = false
  showConfirmDialog.value = false
}

const handleCancel = () => {
  emit('cancel')
}

// Watchers
watch(() => props.surveyId, () => {
  if (props.surveyId)
    loadSurvey()
})

// Load on mount
onMounted(() => {
  if (props.surveyId)
    loadSurvey()
})
</script>

<template>
  <div>
    <!-- Loading -->
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

    <template v-if="survey && !loadingDetail">
      <!-- Sticky header -->
      <VCard class="mb-4">
        <VCardText>
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div>
              <div class="text-h5">
                {{ survey.survey_title }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ survey.survey_description }}
              </div>
            </div>
            <div class="d-flex align-center gap-2">
              <VChip
                v-if="lastSavedAt"
                color="success"
                variant="tonal"
                size="small"
                prepend-icon="tabler-check"
              >
                Guardado {{ timeAgo }}
              </VChip>
            </div>
          </div>
          <VProgressLinear
            :model-value="progressPercent"
            color="primary"
            class="mt-3"
            rounded
          />
          <div class="text-caption text-medium-emphasis mt-1">
            {{ answeredCount }}/{{ totalQuestions }} preguntas respondidas
          </div>
        </VCardText>
      </VCard>

      <VRow>
        <!-- Sidebar: question navigation -->
        <VCol
          cols="12"
          md="3"
        >
          <VCard style="position: sticky; top: 80px;">
            <VCardTitle class="text-subtitle-1">
              Preguntas
            </VCardTitle>
            <VList
              density="compact"
              nav
            >
              <VListItem
                v-for="(q, index) in survey.questions"
                :key="q.question_id"
                :value="index"
                @click="scrollToQuestion(q.question_id)"
              >
                <template #prepend>
                  <VIcon
                    :icon="getQuestionStatusIcon(q)"
                    :color="getQuestionStatusColor(q)"
                    size="16"
                  />
                </template>
                <VListItemTitle class="text-body-2">
                  {{ index + 1 }}. {{ truncate(q.question_text, 40) }}
                </VListItemTitle>
                <template #append>
                  <VChip
                    v-if="q.required"
                    size="x-small"
                    color="error"
                    variant="tonal"
                  >
                    *
                  </VChip>
                </template>
              </VListItem>
            </VList>
          </VCard>
        </VCol>

        <!-- Main: all questions -->
        <VCol
          cols="12"
          md="9"
        >
          <!-- Review mode banner -->
          <VAlert
            v-if="reviewMode"
            type="info"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="reviewMode = false"
          >
            Revisa tus respuestas antes de enviar. Haz clic en "Editar" para modificar una respuesta.
          </VAlert>

          <!-- Missing required warning in review mode -->
          <VAlert
            v-if="reviewMode && missingRequired.length > 0"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            <strong>Faltan {{ missingRequired.length }} respuestas obligatorias</strong>
            <div class="mt-1 text-body-2">
              {{ missingRequired.map(q => `"${truncate(q.question_text, 50)}"`).join(', ') }}
            </div>
          </VAlert>

          <!-- Question cards -->
          <VCard
            v-for="(question, index) in survey.questions"
            :id="`question-${question.question_id}`"
            :key="question.question_id"
            class="mb-4"
            :variant="reviewMode ? 'tonal' : 'elevated'"
            :color="reviewMode && isRequiredUnanswered(question) ? 'error' : undefined"
          >
            <VCardText>
              <!-- Question header -->
              <div class="d-flex align-center gap-2 mb-3">
                <VAvatar
                  size="32"
                  color="primary"
                  variant="tonal"
                >
                  <span class="text-body-2 font-weight-bold">{{ index + 1 }}</span>
                </VAvatar>
                <div class="text-subtitle-1 font-weight-medium flex-grow-1">
                  {{ question.question_text }}
                </div>
                <VChip
                  v-if="question.required"
                  size="small"
                  color="error"
                  variant="tonal"
                >
                  Obligatoria
                </VChip>
                <VBtn
                  v-if="reviewMode"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="scrollToQuestion(question.question_id)"
                >
                  Editar
                </VBtn>
              </div>

              <!-- Response input (edit mode) -->
              <div v-if="!reviewMode">
                <!-- TEXT, DATE, EMAIL, PHONE -->
                <div v-if="['TEXT', 'DATE', 'EMAIL', 'PHONE'].includes(question.question_type)">
                  <VTextField
                    v-model="answers[question.question_id]"
                    :label="getInputLabel(question.question_type)"
                    :type="getInputType(question.question_type)"
                    :rules="question.required ? [(v: any) => !!v || 'Este campo es requerido'] : []"
                    variant="outlined"
                  />
                </div>

                <!-- NUMBER -->
                <div v-else-if="question.question_type === 'NUMBER'">
                  <VTextField
                    v-model.number="answers[question.question_id]"
                    label="Ingresa un numero"
                    type="number"
                    :rules="question.required ? [(v: any) => (v !== '' && v !== null) || 'Este campo es requerido'] : []"
                    variant="outlined"
                  />
                </div>

                <!-- YES_NO -->
                <div v-else-if="question.question_type === 'YES_NO'">
                  <VRadioGroup
                    :model-value="answers[question.question_id] || null"
                    inline
                    @update:model-value="(value: any) => answers[question.question_id] = value"
                  >
                    <VRadio
                      label="Sí"
                      value="SI"
                      color="primary"
                    />
                    <VRadio
                      label="No"
                      value="NO"
                      color="primary"
                    />
                  </VRadioGroup>
                </div>

                <!-- SCALE -->
                <div v-else-if="question.question_type === 'SCALE'">
                  <VRadioGroup
                    :model-value="answers[question.question_id] || null"
                    inline
                    @update:model-value="(value: any) => answers[question.question_id] = value"
                  >
                    <VRadio
                      v-for="option in getScaleOptions(question)"
                      :key="`scale_${option.id}`"
                      :label="option.option_text"
                      :value="option.id"
                      color="primary"
                    />
                  </VRadioGroup>
                </div>

                <!-- SINGLE_CHOICE -->
                <div v-else-if="question.question_type === 'SINGLE_CHOICE'">
                  <VRadioGroup
                    :model-value="answers[question.question_id] || null"
                    @update:model-value="(value: any) => answers[question.question_id] = value"
                  >
                    <VRadio
                      v-for="option in question.options"
                      :key="`single_${option.id}`"
                      :label="option.option_text"
                      :value="option.id"
                      color="primary"
                    />
                  </VRadioGroup>
                </div>

                <!-- MULTIPLE_CHOICE -->
                <div v-else-if="question.question_type === 'MULTIPLE_CHOICE'">
                  <div class="d-flex flex-column gap-2">
                    <VCheckbox
                      v-for="option in question.options"
                      :key="option.id"
                      :label="option.option_text"
                      :model-value="isCheckboxChecked(question.question_id, option.id)"
                      color="primary"
                      @update:model-value="(value: any) => toggleCheckbox(question.question_id, option.id, !!value)"
                    />
                  </div>
                </div>
              </div>

              <!-- Review mode: show answer as text -->
              <div v-else>
                <div class="text-body-1 pa-3 bg-surface rounded">
                  <VIcon
                    icon="tabler-message"
                    size="18"
                    class="me-2"
                  />
                  {{ getAnswerDisplay(question) || 'Sin respuesta' }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- Bottom actions (edit mode) -->
          <VCard
            v-if="!reviewMode"
            class="mt-4"
          >
            <VCardActions class="pa-4">
              <VBtn
                variant="outlined"
                color="error"
                @click="handleCancel"
              >
                Cancelar
              </VBtn>
              <VSpacer />
              <VBtn
                color="primary"
                :disabled="!canSubmit"
                @click="enterReviewMode"
              >
                Revisar y enviar
              </VBtn>
            </VCardActions>
          </VCard>

          <!-- Review mode footer -->
          <VCard
            v-if="reviewMode"
            class="mt-4"
          >
            <VCardActions>
              <VBtn
                variant="outlined"
                @click="reviewMode = false"
              >
                Volver a editar
              </VBtn>
              <VSpacer />
              <VBtn
                color="success"
                :loading="submitting || loadingSubmit"
                :disabled="missingRequired.length > 0"
                @click="showConfirmDialog = true"
              >
                Confirmar y enviar
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <!-- Confirm submission dialog -->
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
          Confirmar envio
        </VCardTitle>

        <VCardText>
          Estas seguro de que deseas enviar tus respuestas? Una vez enviadas no podras modificarlas.
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
            :loading="submitting || loadingSubmit"
            @click="handleFinalSubmit"
          >
            Confirmar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.v-radio-group {
  margin-block-start: 0;
}

.v-checkbox {
  margin-block-end: 8px;
}
</style>
