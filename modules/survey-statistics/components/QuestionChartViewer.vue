<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { computed, onMounted, ref, watch } from 'vue'
import { Bar, Doughnut, Pie } from 'vue-chartjs'
import TextQuestionViewer from './TextQuestionViewer.vue'
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'
import { useSnackbar } from '@/composables/useSnackbar'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'

const props = defineProps<Props>()

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
)

interface Props {
  surveyId: number
  questionId: number
  questionText?: string
}

// Composables
const { questionChart, loadingQuestionChart, fetchQuestionChart, statistics } = useSurveyStatisticsService()
const { showSnackbar } = useSnackbar()

// State
const selectedChartType = ref('bar')
const error = ref<string | null>(null)

// Chart type options
const chartTypeOptions = [
  { title: 'Gráfico de Barras', value: 'bar' },
  { title: 'Gráfico de Torta', value: 'pie' },
  { title: 'Gráfico de Dona', value: 'doughnut' },
]

// Obtener datos de la pregunta específica de las estadísticas locales
const questionData = computed(() => {
  if (!statistics.value?.question_statistics)
    return null

  return statistics.value.question_statistics.find(q => q.question_id === props.questionId)
})

// Tipos que no tienen gráfico (respuesta libre)
const TEXT_BASED_TYPES = ['TEXT', 'EMAIL', 'PHONE', 'DATE']

function translateType(type?: string): string {
  const types: Record<string, string> = {
    TEXT: 'Texto', EMAIL: 'Email', PHONE: 'Teléfono', DATE: 'Fecha',
    YES_NO: 'Sí/No', SCALE: 'Escala', NUMBER: 'Número',
    SINGLE_CHOICE: 'Opción Única', MULTIPLE_CHOICE: 'Opción Múltiple',
  }

  return types[type || ''] || type || ''
}

const isTextQuestion = computed(() => {
  return TEXT_BASED_TYPES.includes(questionData.value?.type || '')
})

// Chart data procesado desde la API
const chartData = computed(() => {
  if (!questionChart.value) {
    return {
      labels: ['Sin datos'],
      datasets: [{
        label: 'Sin datos',
        data: [1],
        backgroundColor: ['#E0E0E0'],
        borderColor: '#BDBDBD',
        borderWidth: 1,
      }],
    }
  }

  try {
    // Procesar datasets desde la API
    const processedDatasets = questionChart.value.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.background_colors || ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'],
      borderColor: dataset.border_color || '#FFFFFF',
      borderWidth: dataset.border_width || 1,
    }))

    return {
      labels: questionChart.value.labels,
      datasets: processedDatasets,
    }
  }
  catch (err) {
    console.error('QuestionChartViewer: Error processing API data', err)

    return {
      labels: ['Error'],
      datasets: [{
        label: 'Error',
        data: [1],
        backgroundColor: ['#F44336'],
        borderColor: '#FFFFFF',
        borderWidth: 1,
      }],
    }
  }
})

// Chart options basadas en la configuración de la API
const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        display: true,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)

            // Obtener el valor correcto según el tipo de gráfico
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed
            const percentage = ((value * 100) / total).toFixed(1)

            return `${context.label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  // Aplicar configuración de la API si existe
  if (questionChart.value?.configuration) {
    const apiConfig = questionChart.value.configuration

    // Aplicar configuración de leyenda
    if (apiConfig.legend) {
      baseOptions.plugins.legend = {
        ...baseOptions.plugins.legend,
        display: apiConfig.legend.display,
        position: (apiConfig.legend.position as any) || 'right',
      }
    }

    // Aplicar configuración de tooltip
    if (apiConfig.tooltip) {
      baseOptions.plugins.tooltip = {
        ...baseOptions.plugins.tooltip,
        enabled: apiConfig.tooltip.enabled,
      }
    }
  }

  // Opciones específicas para gráfico de barras
  if (selectedChartType.value === 'bar') {
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            callback(value: any) {
              return Number.isInteger(value) ? value : ''
            },
          },
        },
      },
    }
  }

  return baseOptions
})

// Verificar si hay datos de la API
const hasApiData = computed(() => {
  return questionChart.value
         && questionChart.value.labels
         && questionChart.value.labels.length > 0
         && questionChart.value.datasets
         && questionChart.value.datasets.length > 0
})

// Cargar datos del gráfico desde la API
async function loadQuestionChart() {
  error.value = null

  try {
    const result = await fetchQuestionChart(props.surveyId, props.questionId, selectedChartType.value)

    if (!result.success) {
      error.value = result.message || 'Error al cargar el gráfico de la pregunta'
      showSnackbar({
        text: result.message || 'Error al cargar el gráfico de la pregunta',
        color: 'error',
      })
    }
  }
  catch (err) {
    console.error('QuestionChartViewer: Error loading chart', err)
    error.value = 'Error inesperado al cargar el gráfico'
    showSnackbar({
      text: 'Error inesperado al cargar el gráfico',
      color: 'error',
    })
  }
}

// Watch para cambios en el tipo de gráfico
watch(selectedChartType, () => {
  loadQuestionChart()
}, { immediate: false })

// Watch para cambios en questionId
watch(() => props.questionId, () => {
  loadQuestionChart()
}, { immediate: false })

// Cargar datos iniciales
onMounted(() => {
  loadQuestionChart()
})
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>{{ questionChart?.title || questionText || `Pregunta ${questionId}` }}</span>
      <AppSelect
        v-if="!isTextQuestion"
        v-model="selectedChartType"
        :items="chartTypeOptions"
        style="max-inline-size: 200px;"
        density="compact"
        hide-details
      />
    </VCardTitle>

    <VCardText>
      <!-- Error State -->
      <VAlert
        v-if="error"
        type="error"
        class="mb-4"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </VAlert>

      <!-- Loading State -->
      <div
        v-if="loadingQuestionChart"
        class="text-center py-8"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <div class="mt-2">
          Cargando gráfico...
        </div>
      </div>

      <!-- Pregunta de respuesta libre (texto, email, teléfono, fecha) -->
      <div v-else-if="isTextQuestion">
        <TextQuestionViewer
          v-if="questionData && questionData.type === 'TEXT'"
          :question="questionData as any"
        />
        <div
          v-else
          class="text-center py-8"
        >
          <VIcon
            size="64"
            color="grey-lighten-1"
            icon="tabler-text-caption"
          />
          <div class="mt-4 text-h6 text-medium-emphasis">
            Pregunta de respuesta libre
          </div>
          <div class="mt-2 text-body-2 text-medium-emphasis">
            Las preguntas de tipo {{ translateType(questionData?.type) }} no generan gráficos de distribución.
          </div>
        </div>
      </div>

      <!-- Gráficos para otros tipos de preguntas -->
      <div v-else-if="hasApiData">
        <div style="block-size: 400px;">
          <!-- Pie Chart -->
          <Pie
            v-if="selectedChartType === 'pie'"
            :data="chartData"
            :options="chartOptions"
          />

          <!-- Doughnut Chart -->
          <Doughnut
            v-else-if="selectedChartType === 'doughnut'"
            :data="chartData"
            :options="chartOptions"
          />

          <!-- Bar Chart -->
          <Bar
            v-else-if="selectedChartType === 'bar'"
            :data="chartData"
            :options="chartOptions"
          />
        </div>

        <!-- Chart Metadata -->
        <VDivider class="my-4" />

        <VRow>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 text-medium-emphasis">
              Total de Respuestas
            </div>
            <div class="text-h6">
              {{ questionChart?.total_responses || 0 }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <div class="text-body-2 text-medium-emphasis">
              Tipo de Gráfico
            </div>
            <div class="text-h6 text-capitalize">
              {{ questionChart?.chart_type || selectedChartType }}
            </div>
          </VCol>
          <VCol
            v-if="questionChart?.metadata?.response_rate"
            cols="12"
            md="3"
          >
            <div class="text-body-2 text-medium-emphasis">
              Tasa de Respuesta
            </div>
            <div class="text-h6">
              {{ Math.round(questionChart.metadata.response_rate) }}%
            </div>
          </VCol>
          <VCol
            v-if="questionChart?.metadata?.question_type"
            cols="12"
            md="3"
          >
            <div class="text-body-2 text-medium-emphasis">
              Tipo de Pregunta
            </div>
            <VChip
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ questionChart.metadata.question_type }}
            </VChip>
          </VCol>
        </VRow>

        <!-- Información adicional basada en datos locales -->
        <div v-if="questionData">
          <VDivider class="my-4" />
          <VRow>
            <VCol
              v-if="questionData.average"
              cols="12"
              md="4"
            >
              <div class="text-body-2 text-medium-emphasis">
                Promedio
              </div>
              <div class="text-h6">
                {{ questionData.average.toFixed(1) }}
              </div>
            </VCol>
            <VCol
              v-if="questionData.min"
              cols="12"
              md="4"
            >
              <div class="text-body-2 text-medium-emphasis">
                Valor Mínimo
              </div>
              <div class="text-h6">
                {{ questionData.min }}
              </div>
            </VCol>
            <VCol
              v-if="questionData.max"
              cols="12"
              md="4"
            >
              <div class="text-body-2 text-medium-emphasis">
                Valor Máximo
              </div>
              <div class="text-h6">
                {{ questionData.max }}
              </div>
            </VCol>
          </VRow>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-8"
      >
        <VIcon
          size="64"
          color="grey-lighten-1"
        >
          tabler-chart-pie
        </VIcon>
        <div class="mt-2 text-grey">
          No hay datos disponibles para esta pregunta
        </div>
        <div class="text-caption text-medium-emphasis mt-2">
          ID de pregunta: {{ questionId }}
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.chart-container {
  position: relative;
}
</style>

