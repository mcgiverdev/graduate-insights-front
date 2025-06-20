<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGraduateSurveyService } from '@/composables/useGraduateSurveyService'
import { useSnackbar } from '@/composables/useSnackbar'
import type { QuestionType } from '@/modules/graduate-surveys/types'

interface Props {
  surveyId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
}>()

// Composables
const {
  currentSurvey,
  loadingDetail,
  fetchSurveyDetail,
} = useGraduateSurveyService()

const { showSnackbar } = useSnackbar()

// Estados computados
const survey = computed(() => currentSurvey.value)
const questions = computed(() => survey.value?.questions || [])

// Métodos
const loadSurvey = async () => {
  const result = await fetchSurveyDetail(props.surveyId)
  if (!result.success) {
    showSnackbar(result.message, 'error')
    emit('back')
  }
}

const formatQuestionType = (type: QuestionType) => {
  const types = {
    YES_NO: 'Sí/No',
    TEXT: 'Respuesta de texto',
    NUMBER: 'Respuesta numérica',
    DATE: 'Respuesta de fecha',
    EMAIL: 'Respuesta de email',
    PHONE: 'Respuesta de teléfono',
    SINGLE_CHOICE: 'Opción única',
    MULTIPLE_CHOICE: 'Opción múltiple',
  }

  return types[type] || type
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getSelectedOptions = (question: any) => {
  if (!question.selected_option_ids || question.selected_option_ids.length === 0)
    return []

  return question.options.filter((option: any) =>
    question.selected_option_ids.includes(option.id),
  )
}

// Cargar al montar
onMounted(() => {
  if (props.surveyId)
    loadSurvey()
})
</script>

<template>
  <div>
    <!-- Cargando -->
    <VCard v-if="loadingDetail">
      <VCardText class="text-center py-8">
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
        />
        <div class="mt-4">
          Cargando resultados...
        </div>
      </VCardText>
    </VCard>

    <!-- Resultados de la encuesta -->
    <div v-else-if="survey">
      <!-- Encabezado -->
      <VCard>
        <VCardItem>
          <VCardTitle class="text-h4 d-flex align-center">
            <VIcon
              icon="tabler-chart-bar"
              class="me-3"
            />
            Resultados de la Encuesta
          </VCardTitle>
          <VCardSubtitle>
            {{ survey.survey_title }}
          </VCardSubtitle>
        </VCardItem>

        <VCardText>
          <div class="mb-4">
            <p class="text-body-1 mb-2">
              {{ survey.survey_description }}
            </p>
          </div>

          <!-- Información de la encuesta -->
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <div class="d-flex align-center mb-2">
                <VIcon
                  icon="tabler-calendar"
                  class="me-2"
                />
                <strong>Fecha de creación:</strong>
                <span class="ms-2">{{ formatDate(survey.created_date) }}</span>
              </div>
            </VCol>
            <VCol
              v-if="survey.submitted_at"
              cols="12"
              md="6"
            >
              <div class="d-flex align-center mb-2">
                <VIcon
                  icon="tabler-calendar-check"
                  class="me-2"
                />
                <strong>Fecha de envío:</strong>
                <span class="ms-2">{{ formatDate(survey.submitted_at) }}</span>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <div class="d-flex align-center mb-2">
                <VIcon
                  icon="tabler-tag"
                  class="me-2"
                />
                <strong>Tipo:</strong>
                <VChip
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="ms-2"
                >
                  {{ survey.survey_type }}
                </VChip>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <div class="d-flex align-center mb-2">
                <VIcon
                  icon="tabler-check-circle"
                  class="me-2"
                />
                <strong>Estado:</strong>
                <VChip
                  size="small"
                  :color="survey.completed ? 'success' : 'warning'"
                  variant="tonal"
                  class="ms-2"
                >
                  {{ survey.completed ? 'Completada' : 'Pendiente' }}
                </VChip>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Respuestas -->
      <VCard class="mt-6">
        <VCardItem>
          <VCardTitle class="text-h5">
            <VIcon
              icon="tabler-list-details"
              class="me-2"
            />
            Tus Respuestas
          </VCardTitle>
          <VCardSubtitle>
            Total de preguntas: {{ questions.length }}
          </VCardSubtitle>
        </VCardItem>

        <VCardText>
          <div
            v-for="(question, index) in questions"
            :key="question.question_id"
            class="mb-6"
          >
            <!-- Encabezado de la pregunta -->
            <div class="d-flex align-start mb-3">
              <VAvatar
                size="32"
                color="primary"
                class="me-3 flex-shrink-0"
              >
                {{ index + 1 }}
              </VAvatar>
              <div class="flex-grow-1">
                <h6 class="text-h6 mb-2">
                  {{ question.question_text }}
                </h6>
                <div class="d-flex gap-2 mb-3">
                  <VChip
                    size="small"
                    :color="question.required ? 'error' : 'success'"
                    variant="tonal"
                  >
                    {{ question.required ? 'Requerida' : 'Opcional' }}
                  </VChip>
                  <VChip
                    size="small"
                    color="info"
                    variant="tonal"
                  >
                    {{ formatQuestionType(question.question_type) }}
                  </VChip>
                </div>
              </div>
            </div>

            <!-- Respuesta -->
            <VCard
              variant="tonal"
              color="primary"
              class="ms-11"
            >
              <VCardText>
                <!-- Respuesta de texto (TEXT, EMAIL, PHONE) -->
                <div v-if="['TEXT', 'EMAIL', 'PHONE'].includes(question.question_type)">
                  <div class="d-flex align-center mb-2">
                    <VIcon
                      :icon="question.question_type === 'EMAIL' ? 'tabler-mail'
                        : question.question_type === 'PHONE' ? 'tabler-phone'
                          : 'tabler-text-caption'"
                      class="me-2"
                    />
                    <strong>Tu respuesta:</strong>
                  </div>
                  <p
                    v-if="question.text_response"
                    class="text-body-1 mb-0"
                  >
                    {{ question.text_response }}
                  </p>
                  <p
                    v-else
                    class="text-medium-emphasis mb-0"
                  >
                    No respondido
                  </p>
                </div>

                <!-- Respuesta de fecha -->
                <div v-else-if="question.question_type === 'DATE'">
                  <div class="d-flex align-center mb-2">
                    <VIcon
                      icon="tabler-calendar"
                      class="me-2"
                    />
                    <strong>Fecha seleccionada:</strong>
                  </div>
                  <p
                    v-if="question.text_response"
                    class="text-body-1 mb-0"
                  >
                    {{ formatDate(question.text_response) }}
                  </p>
                  <p
                    v-else
                    class="text-medium-emphasis mb-0"
                  >
                    No respondido
                  </p>
                </div>

                <!-- Respuesta numérica -->
                <div v-else-if="question.question_type === 'NUMBER'">
                  <div class="d-flex align-center mb-2">
                    <VIcon
                      icon="tabler-123"
                      class="me-2"
                    />
                    <strong>Valor numérico:</strong>
                  </div>
                  <div v-if="question.number_response !== null && question.number_response !== undefined">
                    <VChip
                      color="success"
                      variant="tonal"
                      size="large"
                    >
                      {{ question.number_response }}
                    </VChip>
                  </div>
                  <p
                    v-else
                    class="text-medium-emphasis mb-0"
                  >
                    No respondido
                  </p>
                </div>

                <!-- Respuesta Sí/No y opción única -->
                <div v-else-if="['YES_NO', 'SINGLE_CHOICE'].includes(question.question_type)">
                  <div class="d-flex align-center mb-2">
                    <VIcon
                      icon="tabler-check-circle"
                      class="me-2"
                    />
                    <strong>Opción seleccionada:</strong>
                  </div>
                  <div v-if="getSelectedOptions(question).length > 0">
                    <VChip
                      v-for="option in getSelectedOptions(question)"
                      :key="option.id"
                      color="success"
                      variant="tonal"
                      size="large"
                      class="me-2"
                    >
                      {{ option.option_text }}
                    </VChip>
                  </div>
                  <p
                    v-else
                    class="text-medium-emphasis mb-0"
                  >
                    No respondido
                  </p>
                </div>

                <!-- Respuesta de opción múltiple -->
                <div v-else-if="question.question_type === 'MULTIPLE_CHOICE'">
                  <div class="d-flex align-center mb-2">
                    <VIcon
                      icon="tabler-check-circle"
                      class="me-2"
                    />
                    <strong>Opciones seleccionadas:</strong>
                  </div>
                  <div v-if="getSelectedOptions(question).length > 0">
                    <VChip
                      v-for="option in getSelectedOptions(question)"
                      :key="option.id"
                      color="success"
                      variant="tonal"
                      size="large"
                      class="me-2 mb-2"
                    >
                      {{ option.option_text }}
                    </VChip>
                  </div>
                  <p
                    v-else
                    class="text-medium-emphasis mb-0"
                  >
                    No respondido
                  </p>
                </div>
              </VCardText>
            </VCard>
          </div>
        </VCardText>
      </VCard>

      <!-- Acciones -->
      <VCard class="mt-6">
        <VCardActions class="justify-center">
          <VBtn
            color="primary"
            size="large"
            @click="emit('back')"
          >
            <VIcon
              icon="tabler-arrow-left"
              class="me-2"
            />
            Volver a Mis Encuestas
          </VBtn>
        </VCardActions>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.v-card {
  transition: all 0.2s ease-in-out;
}

.border-success {
  border-color: rgb(var(--v-theme-success)) !important;
}

.bg-success-lighten-4 {
  background-color: rgba(var(--v-theme-success), 0.1) !important;
}
</style>
