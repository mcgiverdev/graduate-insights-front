<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Survey } from '@/library/resources/surveys/SurveyResource'

const props = defineProps<{
  survey: Survey
}>()

const emit = defineEmits<{
  (e: 'submit', answers: Record<string, any>): void
}>()

const currentQuestionIndex = ref(0)
const answers = ref<Record<string, any>>({})

const progress = computed(() => {
  return ((currentQuestionIndex.value + 1) / props.survey.questions.length) * 100
})

const currentQuestion = computed(() => {
  return props.survey.questions[currentQuestionIndex.value]
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === props.survey.questions.length - 1
})

const canAdvance = computed(() => {
  const question = currentQuestion.value
  if (!question)
    return true
  if (!question.required)
    return true

  const answer = answers.value[question.id]
  if (answer === undefined || answer === null)
    return false

  if (Array.isArray(answer))
    return answer.length > 0

  return answer !== ''
})

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.survey.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const submitSurvey = () => {
  emit('submit', answers.value)
}

const getRatingOptions = (max: number = 5) => {
  return Array.from({ length: max }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }))
}
</script>

<template>
  <div class="survey-viewer">
    <VCard class="mb-6">
      <VCardTitle>{{ survey.title }}</VCardTitle>
      <VCardText>
        <p>{{ survey.description }}</p>
      </VCardText>
    </VCard>

    <VCard v-if="currentQuestion">
      <VCardText>
        <!-- Barra de progreso -->
        <VProgressLinear
          v-if="survey.settings.showProgressBar"
          :model-value="progress"
          color="primary"
          height="8"
          rounded
          class="mb-4"
        />

        <!-- Número de pregunta -->
        <div class="text-subtitle-2 mb-2">
          Pregunta {{ currentQuestionIndex + 1 }} de {{ survey.questions.length }}
        </div>

        <!-- Título y descripción de la pregunta -->
        <h2 class="text-h6 mb-2">
          {{ currentQuestion.title }}
          <span
            v-if="currentQuestion.required"
            class="text-error"
          >*</span>
        </h2>
        <p
          v-if="currentQuestion.description"
          class="text-body-2 mb-6"
        >
          {{ currentQuestion.description }}
        </p>

        <!-- Campos de respuesta según el tipo de pregunta -->
        <div class="answer-field">
          <!-- Campo de texto -->
          <VTextField
            v-if="currentQuestion.type === 'text'"
            v-model="answers[currentQuestion.id]"
            variant="outlined"
            placeholder="Tu respuesta"
          />

          <!-- Opción múltiple -->
          <VRadioGroup
            v-else-if="currentQuestion.type === 'multiple_choice'"
            v-model="answers[currentQuestion.id]"
          >
            <VRadio
              v-for="option in currentQuestion.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </VRadioGroup>

          <!-- Casillas de verificación -->
          <VCheckboxGroup
            v-else-if="currentQuestion.type === 'checkbox'"
            v-model="answers[currentQuestion.id]"
          >
            <VCheckbox
              v-for="option in currentQuestion.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </VCheckboxGroup>

          <!-- Calificación -->
          <div
            v-else-if="currentQuestion.type === 'rating'"
            class="d-flex align-center gap-4"
          >
            <VRadioGroup
              v-model="answers[currentQuestion.id]"
              inline
            >
              <VRadio
                v-for="option in getRatingOptions(currentQuestion.validation?.max || 5)"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </VRadioGroup>
          </div>

          <!-- Fecha -->
          <VTextField
            v-else-if="currentQuestion.type === 'date'"
            v-model="answers[currentQuestion.id]"
            type="date"
            variant="outlined"
          />

          <!-- Hora -->
          <VTextField
            v-else-if="currentQuestion.type === 'time'"
            v-model="answers[currentQuestion.id]"
            type="time"
            variant="outlined"
          />

          <!-- Archivo -->
          <VFileInput
            v-else-if="currentQuestion.type === 'file'"
            v-model="answers[currentQuestion.id]"
            variant="outlined"
            placeholder="Seleccionar archivo"
          />

          <!-- Matriz -->
          <div
            v-else-if="currentQuestion.type === 'matrix'"
            class="matrix-container"
          >
            <table class="matrix-table">
              <thead>
                <tr>
                  <th />
                  <th
                    v-for="column in currentQuestion.matrix?.columns"
                    :key="column"
                  >
                    {{ column }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in currentQuestion.matrix?.rows"
                  :key="row"
                >
                  <td>{{ row }}</td>
                  <td
                    v-for="column in currentQuestion.matrix?.columns"
                    :key="column"
                  >
                    <VRadio
                      v-model="answers[`${currentQuestion.id}_${row}`]"
                      :value="column"
                      density="compact"
                      hide-details
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VBtn
          variant="text"
          :disabled="currentQuestionIndex === 0"
          @click="previousQuestion"
        >
          Anterior
        </VBtn>
        <VSpacer />
        <VBtn
          v-if="!isLastQuestion"
          color="primary"
          :disabled="!canAdvance"
          @click="nextQuestion"
        >
          Siguiente
        </VBtn>
        <VBtn
          v-else
          color="success"
          :disabled="!canAdvance"
          @click="submitSurvey"
        >
          Enviar
        </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped>
.survey-viewer {
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 800px;
}

.answer-field {
  margin-block-start: 2rem;
}

.matrix-table {
  border-collapse: collapse;
  inline-size: 100%;
}

.matrix-table th,
.matrix-table td {
  padding: 0.5rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  text-align: center;
}

.matrix-table th:first-child,
.matrix-table td:first-child {
  text-align: start;
}
</style>
