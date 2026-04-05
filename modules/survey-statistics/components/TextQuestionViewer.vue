<script setup lang="ts">
import { ref } from 'vue'
import TextResponsesDialog from './TextResponsesDialog.vue'

interface TextQuestionData {
  question_id: number
  question_text: string
  type: 'TEXT'
  total_responses: number
  response_rate: number
  average_response_length?: number
  sample_responses?: string[]
  recommended_chart_type: string
}

interface Props {
  question: TextQuestionData
}

defineProps<Props>()

const showAllResponses = ref(false)

function getSampleText(samples: string[], maxLength: number = 100): string[] {
  return samples.map(sample => {
    if (sample.length <= maxLength)
      return sample

    return `${sample.substring(0, maxLength)}...`
  })
}

function getResponseLengthCategory(length: number): { label: string; color: string } {
  if (length <= 20)
    return { label: 'Corta', color: 'info' }
  if (length <= 100)
    return { label: 'Media', color: 'warning' }

  return { label: 'Larga', color: 'success' }
}
</script>

<template>
  <VCard>
    <VCardTitle>
      <div class="d-flex justify-space-between align-center">
        <span>{{ question.question_text }}</span>
        <VChip
          size="small"
          color="primary"
          variant="outlined"
        >
          Respuesta de Texto
        </VChip>
      </div>
    </VCardTitle>

    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-primary">
              {{ question.total_responses }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Total de Respuestas
            </div>
          </div>
        </VCol>

        <VCol
          v-if="question.average_response_length"
          cols="12"
          md="4"
        >
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-success">
              {{ Math.round(question.average_response_length) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Promedio de Caracteres
            </div>
            <VChip
              v-if="question.average_response_length"
              :color="getResponseLengthCategory(question.average_response_length).color"
              size="small"
              class="mt-1"
            >
              {{ getResponseLengthCategory(question.average_response_length).label }}
            </VChip>
          </div>
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-info">
              {{ Math.round(question.response_rate) }}%
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Tasa de Respuesta
            </div>
          </div>
        </VCol>
      </VRow>

      <VDivider
        v-if="question.sample_responses?.length"
        class="my-4"
      />

      <div
        v-if="question.sample_responses?.length"
        class="mb-4"
      >
        <h4 class="text-h6 mb-3">
          Ejemplos de Respuestas
        </h4>
        <VRow>
          <VCol
            v-for="(sample, index) in getSampleText(question.sample_responses)"
            :key="index"
            cols="12"
            md="4"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardText>
                <div class="d-flex align-start">
                  <VIcon
                    icon="tabler-quote"
                    size="small"
                    class="text-medium-emphasis me-2 mt-1"
                  />
                  <div class="flex-grow-1">
                    <p class="text-body-2 mb-2">
                      "{{ sample }}"
                    </p>
                    <div class="text-caption text-medium-emphasis">
                      {{ question.sample_responses[index].length }} caracteres
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>

      <div
        v-if="question.sample_responses?.length"
        class="d-flex justify-center mt-4"
      >
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="tabler-list"
          @click="showAllResponses = true"
        >
          Ver todas las respuestas ({{ question.total_responses }})
        </VBtn>
      </div>

      <VAlert
        v-if="question.recommended_chart_type === 'word_cloud'"
        type="info"
        variant="outlined"
        class="mt-4"
      >
        <template #prepend>
          <VIcon icon="tabler-cloud" />
        </template>
        <div>
          <strong>Recomendación:</strong> Para este tipo de pregunta se recomienda usar una nube de palabras
          para visualizar los términos más frecuentes en las respuestas.
        </div>
      </VAlert>
    </VCardText>

    <TextResponsesDialog
      v-model="showAllResponses"
      :responses="question.sample_responses || []"
      :question-text="question.question_text"
    />
  </VCard>
</template>
