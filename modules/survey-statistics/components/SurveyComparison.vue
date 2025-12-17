<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { computed, onMounted, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyService } from '@/composables/useSurveyService'
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'

// Chart.js imports

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

// Composables
const { surveyComparisons, loadingComparisons, fetchSurveyComparisons } = useSurveyStatisticsService()
const { surveys, fetchSurveys } = useSurveyService()
const { showSnackbar } = useSnackbar()

// State
const selectedSurveyIds = ref<number[]>([])

// Available surveys for selection
const availableSurveys = computed(() =>
  surveys.value.map(survey => ({
    title: survey.title,
    value: survey.id,
    subtitle: `Tipo: ${survey.type} - Estado: ${survey.status}`,
  })),
)

// Chart data for response rates
const responseRateChart = computed(() => {
  if (!surveyComparisons.value?.length)
    return { labels: [], datasets: [] }

  return {
    labels: surveyComparisons.value.map(survey => survey.survey_title),
    datasets: [
      {
        label: 'Tasa de Respuesta (%)',
        data: surveyComparisons.value.map(survey => survey.response_rate),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: '#2196F3',
        borderWidth: 1,
      },
    ],
  }
})

// Chart data for completion rates
const completionRateChart = computed(() => {
  if (!surveyComparisons.value?.length)
    return { labels: [], datasets: [] }

  return {
    labels: surveyComparisons.value.map(survey => survey.survey_title),
    datasets: [
      {
        label: 'Tasa de Completitud (%)',
        data: surveyComparisons.value.map(survey => survey.completion_rate),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: '#4CAF50',
        borderWidth: 1,
      },
    ],
  }
})

// Chart data for total responses
const totalResponsesChart = computed(() => {
  if (!surveyComparisons.value?.length)
    return { labels: [], datasets: [] }

  return {
    labels: surveyComparisons.value.map(survey => survey.survey_title),
    datasets: [
      {
        label: 'Total de Respuestas',
        data: surveyComparisons.value.map(survey => survey.total_responses),
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
        borderColor: '#FF9800',
        borderWidth: 1,
      },
    ],
  }
})

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}))

// Methods
async function loadComparisons() {
  if (selectedSurveyIds.value.length === 0) {
    showSnackbar({
      text: 'Seleccione al menos una encuesta para comparar',
      color: 'warning',
    })

    return
  }

  const result = await fetchSurveyComparisons(selectedSurveyIds.value)

  if (!result.success) {
    showSnackbar({
      text: result.message || 'Error al cargar las comparaciones',
      color: 'error',
    })
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'COMPLETED': return 'primary'
    case 'DRAFT': return 'warning'
    case 'PAUSED': return 'orange'
    case 'CLOSED': return 'error'
    default: return 'grey'
  }
}

// Load surveys on mount
onMounted(() => {
  fetchSurveys()
})
</script>

<template>
  <div>
    <!-- Survey Selection -->
    <VCard class="mb-6">
      <VCardTitle>Seleccionar Encuestas para Comparar</VCardTitle>
      <VCardText>
        <VSelect
          v-model="selectedSurveyIds"
          :items="availableSurveys"
          multiple
          chips
          closable-chips
          label="Encuestas"
          placeholder="Seleccione encuestas para comparar"
          :loading="surveys.length === 0"
        >
          <template #selection="{ item, index }">
            <VChip
              v-if="index < 2"
              size="small"
            >
              {{ item.title }}
            </VChip>
            <span
              v-if="index === 2"
              class="text-grey text-caption align-self-center"
            >
              (+{{ selectedSurveyIds.length - 2 }} otros)
            </span>
          </template>
        </VSelect>

        <div class="mt-4">
          <VBtn
            :loading="loadingComparisons"
            :disabled="selectedSurveyIds.length === 0"
            color="primary"
            @click="loadComparisons"
          >
            Comparar Encuestas
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- Loading State -->
    <div
      v-if="loadingComparisons"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
      <div class="mt-4">
        Cargando comparaciones...
      </div>
    </div>

    <!-- Comparison Results -->
    <div v-else-if="surveyComparisons?.length">
      <!-- Summary Table -->
      <VCard class="mb-6">
        <VCardTitle>Resumen de Comparación</VCardTitle>
        <VCardText>
          <VTable>
            <thead>
              <tr>
                <th>Encuesta</th>
                <th>Total Respuestas</th>
                <th>Tasa de Respuesta</th>
                <th>Tasa de Completitud</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="survey in surveyComparisons"
                :key="survey.survey_id"
              >
                <td class="font-weight-medium">
                  {{ survey.survey_title }}
                </td>
                <td>{{ survey.total_responses }}</td>
                <td>{{ survey.response_rate }}%</td>
                <td>{{ survey.completion_rate }}%</td>
                <td>
                  <VChip
                    :color="getStatusColor(survey.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ survey.status }}
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>

      <!-- Charts -->
      <VRow>
        <!-- Response Rate Chart -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Tasa de Respuesta</VCardTitle>
            <VCardText>
              <div style="block-size: 300px;">
                <Bar
                  :data="responseRateChart"
                  :options="chartOptions"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Completion Rate Chart -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Tasa de Completitud</VCardTitle>
            <VCardText>
              <div style="block-size: 300px;">
                <Bar
                  :data="completionRateChart"
                  :options="chartOptions"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Total Responses Chart -->
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardTitle>Total de Respuestas</VCardTitle>
            <VCardText>
              <div style="block-size: 300px;">
                <Bar
                  :data="totalResponsesChart"
                  :options="chartOptions"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Statistics Summary -->
      <VCard class="mt-6">
        <VCardTitle>Estadísticas de Comparación</VCardTitle>
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-center">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ surveyComparisons.length }}
                </div>
                <div class="text-body-2">
                  Encuestas Comparadas
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-center">
                <div class="text-h4 font-weight-bold text-success">
                  {{ Math.round(surveyComparisons.reduce((sum, s) => sum + s.response_rate, 0) / surveyComparisons.length) }}%
                </div>
                <div class="text-body-2">
                  Tasa de Respuesta Promedio
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-center">
                <div class="text-h4 font-weight-bold text-info">
                  {{ Math.round(surveyComparisons.reduce((sum, s) => sum + s.completion_rate, 0) / surveyComparisons.length) }}%
                </div>
                <div class="text-body-2">
                  Tasa de Completitud Promedio
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-center">
                <div class="text-h4 font-weight-bold text-warning">
                  {{ surveyComparisons.reduce((sum, s) => sum + s.total_responses, 0) }}
                </div>
                <div class="text-body-2">
                  Total de Respuestas
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loadingComparisons"
      class="text-center py-8"
    >
      <VIcon
        size="64"
        color="grey-lighten-1"
      >
        tabler-chart-bar
      </VIcon>
      <div class="mt-4 text-grey">
        Seleccione encuestas para ver las comparaciones
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>

