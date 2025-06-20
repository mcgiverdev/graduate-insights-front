<script setup lang="ts">
import { ref } from 'vue'
import { type CreateSurveyRequest, QuestionType } from '@/modules/surveys/types'

interface Props {
  survey: CreateSurveyRequest
  title?: string
  description?: string
}

const props = defineProps<Props>()

// Estado para las respuestas de la vista previa
const answers = ref<{ [key: number]: any }>({})

function handleAnswer(questionIndex: number, value: any) {
  answers.value[questionIndex] = value
}

function getQuestionTypeIcon(type: QuestionType) {
  const icons = {
    [QuestionType.YES_NO]: 'mdi-help-circle',
    [QuestionType.SINGLE_CHOICE]: 'mdi-radiobox-marked',
    [QuestionType.MULTIPLE_CHOICE]: 'mdi-checkbox-marked',
    [QuestionType.TEXT]: 'mdi-text',
    [QuestionType.NUMBER]: 'mdi-numeric',
    [QuestionType.DATE]: 'mdi-calendar',
    [QuestionType.EMAIL]: 'mdi-email',
    [QuestionType.PHONE]: 'mdi-phone',
  }

  return icons[type] || 'mdi-help-circle'
}
</script>

<template>
  <div class="survey-preview">
    <!-- Encabezado de la encuesta -->
    <div class="text-center mb-6">
      <h2 class="text-h4 mb-2">
        {{ title || 'Vista Previa de la Encuesta' }}
      </h2>
      <p class="text-body-1 text-medium-emphasis">
        {{ description || 'Descripción de la encuesta' }}
      </p>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="survey.questions.length === 0"
      class="text-center py-8"
    >
      <VIcon
        size="64"
        color="grey-lighten-2"
      >
        mdi-clipboard-text-outline
      </VIcon>
      <p class="text-h6 mt-4 mb-2">
        No hay preguntas para mostrar
      </p>
      <p class="text-body-2 text-medium-emphasis">
        Agrega preguntas para ver la vista previa
      </p>
    </div>

    <!-- Lista de preguntas -->
    <div
      v-else
      class="questions-preview"
    >
      <VCard
        v-for="(question, index) in survey.questions"
        :key="index"
        class="mb-4"
        variant="outlined"
      >
        <VCardText>
          <!-- Encabezado de la pregunta -->
          <div class="d-flex align-start gap-3 mb-4">
            <VIcon
              :icon="getQuestionTypeIcon(question.question_type)"
              color="primary"
            />

            <div class="flex-grow-1">
              <div class="d-flex align-center gap-2 mb-1">
                <span class="text-h6">{{ index + 1 }}.</span>
                <VChip
                  v-if="question.required"
                  size="small"
                  color="error"
                  variant="tonal"
                >
                  Requerida
                </VChip>
              </div>

              <p class="text-body-1">
                {{ question.question_text }}
              </p>
            </div>
          </div>

          <!-- Campo de respuesta según el tipo -->
          <div class="ml-8">
            <!-- Sí/No -->
            <VRadioGroup
              v-if="question.question_type === QuestionType.YES_NO"
              v-model="answers[index]"
              inline
            >
              <VRadio
                v-for="option in question.options"
                :key="option.order_number"
                :label="option.option_text"
                :value="option.option_text"
              />
            </VRadioGroup>

            <!-- Opción única -->
            <VRadioGroup
              v-else-if="question.question_type === QuestionType.SINGLE_CHOICE"
              v-model="answers[index]"
            >
              <VRadio
                v-for="option in question.options"
                :key="option.order_number"
                :label="option.option_text"
                :value="option.option_text"
              />
            </VRadioGroup>

            <!-- Opción múltiple -->
            <div v-else-if="question.question_type === QuestionType.MULTIPLE_CHOICE">
              <VCheckbox
                v-for="option in question.options"
                :key="option.order_number"
                :label="option.option_text"
                :value="option.option_text"
                @update:model-value="(value) => {
                  if (!answers[index]) answers[index] = []
                  if (value) {
                    if (!answers[index].includes(option.option_text)) {
                      answers[index].push(option.option_text)
                    }
                  }
                  else {
                    const idx = answers[index].indexOf(option.option_text)
                    if (idx > -1) answers[index].splice(idx, 1)
                  }
                }"
              />
            </div>

            <!-- Texto -->
            <VTextarea
              v-else-if="question.question_type === QuestionType.TEXT"
              v-model="answers[index]"
              placeholder="Escribe tu respuesta aquí..."
              rows="3"
              variant="outlined"
            />

            <!-- Número -->
            <VTextField
              v-else-if="question.question_type === QuestionType.NUMBER"
              v-model="answers[index]"
              type="number"
              placeholder="Ingresa un número"
              variant="outlined"
            />

            <!-- Fecha -->
            <VTextField
              v-else-if="question.question_type === QuestionType.DATE"
              v-model="answers[index]"
              type="date"
              variant="outlined"
            />

            <!-- Email -->
            <VTextField
              v-else-if="question.question_type === QuestionType.EMAIL"
              v-model="answers[index]"
              type="email"
              placeholder="ejemplo@correo.com"
              variant="outlined"
            />

            <!-- Teléfono -->
            <VTextField
              v-else-if="question.question_type === QuestionType.PHONE"
              v-model="answers[index]"
              type="tel"
              placeholder="+1 (555) 123-4567"
              variant="outlined"
            />
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Botones de la vista previa -->
    <div
      v-if="survey.questions.length > 0"
      class="text-center mt-6"
    >
      <VBtn
        color="primary"
        size="large"
        disabled
      >
        <VIcon start>
          mdi-send
        </VIcon>
        Enviar Respuestas
      </VBtn>

      <p class="text-body-2 text-medium-emphasis mt-2">
        * Esta es solo una vista previa. Las respuestas no se guardarán.
      </p>
    </div>
  </div>
</template>

<style scoped>
.survey-preview {
  padding: 24px;
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
  min-block-size: 400px;
}

.questions-preview {
  max-block-size: 600px;
  overflow-y: auto;
}
</style>
