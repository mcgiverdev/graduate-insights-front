<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGraduateSurveyService } from '@/composables/useGraduateSurveyService'
import { useSnackbar } from '@/composables/useSnackbar'
import {type GraduateSurveyListItem, SurveyType, type SurveyTypeObject} from '@/modules/graduate-surveys/types'

const emit = defineEmits<{
  takeSurvey: [survey: GraduateSurveyListItem]
  viewResults: [survey: GraduateSurveyListItem]
}>()

// Composables
const {
  surveys,
  loadingList,
  fetchSurveys,
  getSurveyStats,
  getCompletedSurveys,
  getPendingSurveys,
} = useGraduateSurveyService()

const { showSnackbar } = useSnackbar()

// Estados computados
const stats = computed(() => getSurveyStats())
const completedSurveys = computed(() => getCompletedSurveys())
const pendingSurveys = computed(() => getPendingSurveys())

// Métodos
const loadSurveys = async () => {
  const result = await fetchSurveys()
  if (!result.success)
    showSnackbar(result.message, 'error')
}

const handleTakeSurvey = (survey: GraduateSurveyListItem) => {
  emit('takeSurvey', survey)
}

const handleViewResults = (survey: GraduateSurveyListItem) => {
  emit('viewResults', survey)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Cargar datos al montar
onMounted(() => {
  loadSurveys()
})
</script>

<template>
  <div>
    <!-- Estadísticas -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="text-center">
            <VIcon
              size="40"
              color="primary"
              icon="tabler-clipboard-list"
              class="mb-3"
            />
            <h3 class="text-h4 mb-1">
              {{ stats.total }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Total de Encuestas
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="text-center">
            <VIcon
              size="40"
              color="success"
              icon="tabler-circle-check"
              class="mb-3"
            />
            <h3 class="text-h4 mb-1">
              {{ stats.completed }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Completadas
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="text-center">
            <VIcon
              size="40"
              color="warning"
              icon="tabler-clock"
              class="mb-3"
            />
            <h3 class="text-h4 mb-1">
              {{ stats.pending }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Pendientes
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="text-center">
            <VIcon
              size="40"
              color="info"
              icon="tabler-percentage"
              class="mb-3"
            />
            <h3 class="text-h4 mb-1">
              {{ stats.completionRate }}%
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Completado
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Encuestas Pendientes -->
    <VCard
      v-if="pendingSurveys.length > 0"
      class="mb-6"
    >
      <VCardTitle class="d-flex align-center">
        <VIcon
          icon="tabler-clock"
          class="me-2"
          color="warning"
        />
        Encuestas Pendientes
        <VSpacer />
        <VChip
          color="warning"
          size="small"
        >
          {{ pendingSurveys.length }}
        </VChip>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol
            v-for="survey in pendingSurveys"
            :key="`pending-${survey.survey_id}`"
            cols="12"
            md="6"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardItem>
                <VCardTitle class="text-h6">
                  {{ survey.title }}
                </VCardTitle>
                <VCardSubtitle>
                  <VChip
                    color="primary"
                    size="x-small"
                    class="me-2"
                  >
                    {{ survey.survey_type.name }}
                  </VChip>
                  {{ survey.question_count }} pregunta{{ survey.question_count !== 1 ? 's' : '' }}
                </VCardSubtitle>
              </VCardItem>

              <VCardText>
                <p class="text-body-2 text-medium-emphasis">
                  {{ survey.description }}
                </p>
                <p class="text-caption mt-2">
                  Creada el {{ formatDate(survey.created_date) }}
                </p>
              </VCardText>

              <VCardActions>
                <VBtn
                  color="primary"
                  variant="flat"
                  @click="handleTakeSurvey(survey)"
                >
                  <VIcon
                    start
                    icon="tabler-pencil"
                  />
                  Responder Encuesta
                </VBtn>
              </VCardActions>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Encuestas Completadas -->
    <VCard v-if="completedSurveys.length > 0">
      <VCardTitle class="d-flex align-center">
        <VIcon
          icon="tabler-circle-check"
          class="me-2"
          color="success"
        />
        Encuestas Completadas
        <VSpacer />
        <VChip
          color="success"
          size="small"
        >
          {{ completedSurveys.length }}
        </VChip>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol
            v-for="survey in completedSurveys"
            :key="`completed-${survey.survey_id}`"
            cols="12"
            md="6"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardItem>
                <VCardTitle class="text-h6">
                  {{ survey.title }}
                  <VIcon
                    icon="tabler-circle-check"
                    color="success"
                    size="20"
                    class="ms-2"
                  />
                </VCardTitle>
                <VCardSubtitle>
                  <VChip
                    color="success"
                    size="x-small"
                    class="me-2"
                  >
                    {{ survey.survey_type.name }}
                  </VChip>
                  {{ survey.question_count }} pregunta{{ survey.question_count !== 1 ? 's' : '' }}
                </VCardSubtitle>
              </VCardItem>

              <VCardText>
                <p class="text-body-2 text-medium-emphasis">
                  {{ survey.description }}
                </p>
                <p class="text-caption mt-2">
                  Creada el {{ formatDate(survey.created_date) }}
                </p>
              </VCardText>

              <VCardActions>
                <VBtn
                  color="success"
                  variant="outlined"
                  @click="handleViewResults(survey)"
                >
                  <VIcon
                    start
                    icon="tabler-eye"
                  />
                  Ver Respuestas
                </VBtn>
              </VCardActions>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Estado de carga -->
    <VCard v-if="loadingList">
      <VCardText class="text-center py-8">
        <VProgressCircular
          indeterminate
          color="primary"
          size="48"
        />
        <p class="text-h6 mt-4">
          Cargando encuestas...
        </p>
      </VCardText>
    </VCard>

    <!-- Estado vacío -->
    <VCard v-if="!loadingList && surveys.length === 0">
      <VCardText class="text-center py-8">
        <VIcon
          size="64"
          color="grey-lighten-2"
          icon="tabler-clipboard-text"
        />
        <h3 class="text-h5 mt-4 mb-2">
          No hay encuestas disponibles
        </h3>
        <p class="text-body-1 text-medium-emphasis">
          Cuando se te asignen encuestas, aparecerán aquí.
        </p>
        <VBtn
          color="primary"
          variant="outlined"
          class="mt-4"
          @click="loadSurveys"
        >
          <VIcon
            start
            icon="tabler-refresh"
          />
          Actualizar
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>
