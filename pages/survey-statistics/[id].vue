<script setup lang="ts">
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import {
  QuestionStatistics,
  SimpleTrendsViewer,
  StatisticsOverview,
  useSurveyStatisticsService,
} from '@/src/features/survey-statistics'
import { formatDateTime } from '@/utils/dateUtils'
import { getDoughnutChartConfig } from '@core/libs/chartjs/chartjsConfig'

ChartJS.register(ArcElement, Tooltip, Legend)

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  path: '/estadisticas-encuesta/:id',
})

const route = useRoute()
const router = useRouter()
const { showSnackbar } = useSnackbar()

function goBackToSurveys() {
  router.push({ path: '/encuestas' })
}

const {
  statistics,
  loadingStatistics,
  fetchSurveyStatistics,
  clearStatistics,
  exportSurveyData,
  loadingExport,
} = useSurveyStatisticsService()

const activeTab = ref('overview')
const error = ref<string | null>(null)

const doughnutOptions = computed(() => ({
  ...getDoughnutChartConfig(),
  plugins: {
    legend: {
      display: true,
      position: 'right' as const,
    },
  },
}))

const genderChartData = computed(() => {
  if (!statistics.value?.responses_by_gender)
    return null

  const data = statistics.value.responses_by_gender

  return {
    labels: Object.keys(data).map(key => {
      switch (key) {
      case 'M': return 'Masculino'
      case 'F': return 'Femenino'
      case 'masculino': return 'Masculino'
      case 'femenino': return 'Femenino'
      case 'otro': return 'Otro'
      default: return key.charAt(0).toUpperCase() + key.slice(1)
      }
    }),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

const surveyId = computed(() => Number(route.params.id))

const tabs = [
  {
    value: 'overview',
    title: 'Resumen General',
    icon: 'tabler-chart-line',
  },
  {
    value: 'trends',
    title: 'Tendencias',
    icon: 'tabler-trending-up',
  },
  {
    value: 'questions',
    title: 'Análisis por Pregunta',
    icon: 'tabler-help-circle',
  },
]

async function loadStatistics() {
  if (!surveyId.value)
    return

  const result = await fetchSurveyStatistics(surveyId.value)

  if (!result.success) {
    showSnackbar({
      text: result.message || 'Error al cargar las estadísticas',
      color: 'error',
    })
  }
}

async function handleExport(format: 'csv' | 'excel' | 'pdf' = 'csv') {
  if (!surveyId.value)
    return

  const result = await exportSurveyData(surveyId.value, format)

  if (result.success) {
    showSnackbar({
      text: result.message || `Archivo ${format.toUpperCase()} exportado correctamente`,
      color: 'success',
    })
  }
  else {
    showSnackbar({
      text: result.message || 'Error al exportar los datos',
      color: 'error',
    })
  }
}


const surveyMetadata = computed(() => {
  if (!statistics.value)
    return null

  return {
    title: statistics.value.survey_title,
    description: statistics.value.survey_description,
    type: statistics.value.survey_type?.name || 'N/A',
    typeDescription: statistics.value.survey_type?.description || '',
    status: statistics.value.status,
    startDate: statistics.value.start_date,
    endDate: statistics.value.end_date,
    dataGenerated: formatDateTime(statistics.value.data_generated_at),
  }
})

const processedStatistics = computed(() => {
  if (!statistics.value)
    return null

  const processedQuestions = statistics.value.question_statistics?.map(question => {
    if (question.type === 'TEXT') {
      return {
        ...question,
        hasTextAnalysis: !!(question.average_response_length || question.sample_responses),
        displaySamples: question.sample_responses?.slice(0, 3) || [],
      }
    }

    return question
  }) || []

  return {
    ...statistics.value,
    question_statistics: processedQuestions,
  }
})

onMounted(() => {
  loadStatistics()
})

// Limpiar al salir del componente
onUnmounted(() => {
  clearStatistics()
})

// Head configuration
useHead({
  title: computed(() =>
    statistics.value
      ? `Estadísticas - ${statistics.value.survey_title}`
      : 'Estadísticas de Encuesta',
  ),
})
</script>

<template>
  <div>
    <!-- Header con navegación -->
    <div class="d-flex align-center mb-4">
      <VBtn
        variant="text"
        prepend-icon="tabler-arrow-left"
        @click="goBackToSurveys"
      >
        Volver a Encuestas
      </VBtn>
      <VDivider
        vertical
        class="mx-4"
      />
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold">
          Estadísticas de Encuesta
        </h1>
        <p
          v-if="surveyMetadata"
          class="text-body-1 text-medium-emphasis mb-0"
        >
          {{ surveyMetadata.title }}
        </p>
      </div>

      <div class="d-flex gap-2">
        <VBtn
          :loading="loadingStatistics"
          variant="outlined"
          prepend-icon="tabler-refresh"
          @click="loadStatistics"
        >
          Actualizar
        </VBtn>

        <VMenu>
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              :loading="loadingExport"
              color="primary"
              prepend-icon="tabler-download"
            >
              Exportar
              <VIcon icon="tabler-chevron-down" />
            </VBtn>
          </template>

          <VList>
            <VListItem @click="handleExport('csv')">
              <VListItemTitle>Exportar CSV</VListItemTitle>
            </VListItem>
            <VListItem @click="handleExport('excel')">
              <VListItemTitle>Exportar Excel</VListItemTitle>
            </VListItem>
            <VListItem @click="handleExport('pdf')">
              <VListItemTitle>Exportar PDF</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="loadingStatistics && !statistics"
      class="d-flex justify-center align-center"
      style="min-block-size: 400px;"
    >
      <div class="text-center">
        <VProgressCircular
          indeterminate
          size="64"
          color="primary"
        />
        <div class="mt-4 text-h6">
          Cargando estadísticas...
        </div>
      </div>
    </div>

    <!-- Error state -->
    <VAlert
      v-else-if="error"
      type="error"
      class="mb-6"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </VAlert>

    <!-- Content -->
    <div v-else-if="statistics">
      <!-- Resumen general -->
      <StatisticsOverview
        :statistics="statistics"
        class="mb-6"
      />

      <!-- Survey Metadata Card -->
      <VCard
        v-if="surveyMetadata"
        class="mb-6"
      >
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">
                Tipo de Encuesta
              </div>
              <div class="font-weight-medium">
                {{ surveyMetadata.type }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ surveyMetadata.typeDescription }}
              </div>
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">
                Estado
              </div>
              <div class="font-weight-medium">
                <VChip
                  :color="surveyMetadata.status === 'ACTIVE' ? 'success'
                    : surveyMetadata.status === 'CLOSED' ? 'error'
                    : surveyMetadata.status === 'DRAFT' ? 'warning'
                    : surveyMetadata.status === 'PAUSED' ? 'info'
                    : 'default'"
                  size="small"
                >
                  {{ surveyMetadata.status === 'ACTIVE' ? 'Activa'
                    : surveyMetadata.status === 'CLOSED' ? 'Cerrada'
                    : surveyMetadata.status === 'DRAFT' ? 'Borrador'
                    : surveyMetadata.status === 'PAUSED' ? 'Pausada'
                    : surveyMetadata.status === 'COMPLETED' ? 'Completada'
                    : surveyMetadata.status }}
                </VChip>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">
                Fecha de Inicio
              </div>
              <div class="font-weight-medium">
                {{ surveyMetadata.startDate }}
              </div>
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <div class="text-body-2 text-medium-emphasis">
                Fecha de Fin
              </div>
              <div class="font-weight-medium">
                {{ surveyMetadata.endDate }}
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Tabs de contenido -->
      <VTabs
        v-model="activeTab"
        class="mb-6"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
        >
          <VIcon
            :icon="tab.icon"
            class="me-2"
          />
          {{ tab.title }}
        </VTab>
      </VTabs>

      <VWindow v-model="activeTab">
        <!-- Tab 1: Resumen General -->
        <VWindowItem value="overview">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VCard>
                <VCardText>
                  <VCardTitle class="mb-4">
                    Métricas Clave
                  </VCardTitle>

                  <div class="d-flex flex-column gap-4">
                    <div class="d-flex justify-space-between align-center">
                      <span>Tasa de Respuesta</span>
                      <div class="d-flex align-center gap-2">
                        <VProgressLinear
                          :model-value="statistics.response_rate"
                          height="8"
                          color="primary"
                          class="flex-grow-1"
                          style="max-inline-size: 100px;"
                        />
                        <span class="font-weight-bold">
                          {{ Math.round(statistics.response_rate) }}%
                        </span>
                      </div>
                    </div>

                    <div class="d-flex justify-space-between align-center">
                      <span>Tasa de Completitud</span>
                      <div class="d-flex align-center gap-2">
                        <VProgressLinear
                          :model-value="statistics.completion_rate"
                          height="8"
                          color="success"
                          class="flex-grow-1"
                          style="max-inline-size: 100px;"
                        />
                        <span class="font-weight-bold">
                          {{ Math.round(statistics.completion_rate) }}%
                        </span>
                      </div>
                    </div>

                    <VDivider />

                    <div class="d-flex justify-space-between">
                      <span>Total de Preguntas</span>
                      <span class="font-weight-bold">{{ statistics.total_questions }}</span>
                    </div>

                    <div class="d-flex justify-space-between">
                      <span>Fecha de Inicio</span>
                      <span class="font-weight-bold">{{ statistics.start_date }}</span>
                    </div>

                    <div class="d-flex justify-space-between">
                      <span>Fecha de Fin</span>
                      <span class="font-weight-bold">{{ statistics.end_date }}</span>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VCard>
                <VCardText>
                  <VCardTitle class="mb-4">
                    Distribución por Género
                  </VCardTitle>

                  <div v-if="genderChartData">
                    <Doughnut
                      :data="genderChartData"
                      :options="doughnutOptions"
                      :height="200"
                    />
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VWindowItem>

        <!-- Tab 2: Tendencias -->
        <VWindowItem value="trends">
          <VRow>
            <VCol cols="12">
              <SimpleTrendsViewer
                :survey-id="surveyId"
                :survey-title="statistics.survey_title"
              />
            </VCol>
          </VRow>
        </VWindowItem>

        <!-- Tab 3: Análisis por Pregunta -->
        <VWindowItem value="questions">
          <div
            v-if="loadingStatistics"
            class="text-center py-8"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              size="48"
            />
            <div class="mt-4">
              Cargando análisis de preguntas...
            </div>
          </div>
          <div
            v-else-if="!statistics || !statistics.question_statistics || statistics.question_statistics.length === 0"
            class="text-center py-8"
          >
            <VIcon
              size="64"
              color="grey-lighten-1"
              icon="tabler-help-circle"
            />
            <div class="mt-4 text-h6 text-medium-emphasis">
              No hay preguntas disponibles
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Esta encuesta no tiene preguntas configuradas o no hay datos suficientes.
            </div>
          </div>
          <QuestionStatistics
            v-else
            :statistics="processedStatistics"
          />
        </VWindowItem>

      </VWindow>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="d-flex justify-center align-center"
      style="min-block-size: 400px;"
    >
      <div class="text-center">
        <VIcon
          size="64"
          color="grey-lighten-1"
        >
          tabler-chart-line
        </VIcon>
        <div class="mt-4 text-h6 text-medium-emphasis">
          No se encontraron estadísticas
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Verifica el ID de la encuesta e intenta nuevamente
        </div>
      </div>
    </div>
  </div>
</template>

