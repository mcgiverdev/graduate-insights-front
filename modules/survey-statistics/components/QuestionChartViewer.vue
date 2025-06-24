<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { ref, watch } from 'vue'
import { Bar, Doughnut, Line, Pie } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyStatisticsService } from '@/composables/useSurveyStatisticsService'

// Chart.js imports

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
  LineElement,
)

interface Props {
  surveyId: number
  questionId: number
  questionText?: string
}

// Composables
const { questionChart, loadingQuestionChart, fetchQuestionChart } = useSurveyStatisticsService()
const { showSnackbar } = useSnackbar()

// State
const selectedChartType = ref('pie')

// Chart type options
const chartTypeOptions = [
  { title: 'Gráfico de Torta', value: 'pie' },
  { title: 'Gráfico de Dona', value: 'doughnut' },
  { title: 'Gráfico de Barras', value: 'bar' },
  { title: 'Gráfico de Líneas', value: 'line' },
]

// Chart data
const chartData = ref({
  labels: [] as string[],
  datasets: [] as any[],
})

// Chart options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
    },
    tooltip: {
      enabled: true,
    },
  },
})

// Methods
async function loadQuestionChart() {
  const result = await fetchQuestionChart(props.surveyId, props.questionId, selectedChartType.value)

  if (result.success && result.data) {
    // Validar que los datos existen antes de procesarlos
    const labels = Array.isArray(result.data.labels) ? result.data.labels : []
    const datasets = Array.isArray(result.data.datasets) ? result.data.datasets : []

    // Crear datasets válidos
    const processedDatasets = datasets.length > 0
      ? datasets.map(dataset => ({
        ...dataset,
        backgroundColor: dataset.background_colors || ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: dataset.border_color || '#fff',
        borderWidth: dataset.border_width || 1,
      }))
      : [{
          label: 'Sin datos',
          data: [1],
          backgroundColor: ['#E0E0E0'],
          borderColor: '#BDBDBD',
          borderWidth: 1,
        }]

    chartData.value = {
      labels: labels.length > 0 ? labels : ['Sin datos'],
      datasets: processedDatasets,
    }

    // Update chart options from API response
    if (result.data.configuration) {
      chartOptions.value = {
        ...chartOptions.value,
        ...result.data.configuration,
      }
    }
  }
  else {
    showSnackbar({
      text: result.message || 'Error al cargar el gráfico de la pregunta',
      color: 'error',
    })

    // Reset chart data on error
    chartData.value = {
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
}

// Watch for chart type changes
watch(selectedChartType, () => {
  loadQuestionChart()
})

// Load initial chart
loadQuestionChart()
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>{{ questionText || `Pregunta ${questionId}` }}</span>
      <AppSelect
        v-model="selectedChartType"
        :items="chartTypeOptions"
        style="max-inline-size: 200px;"
        density="compact"
        hide-details
      />
    </VCardTitle>

    <VCardText>
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

      <!-- Chart Content -->
      <div
        v-else-if="questionChart && chartData.labels.length > 0"
        class="chart-container"
      >
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

          <!-- Line Chart -->
          <Line
            v-else-if="selectedChartType === 'line'"
            :data="chartData"
            :options="chartOptions"
          />
        </div>

        <!-- Chart Metadata -->
        <VDivider class="my-4" />

        <VRow>
          <VCol
            cols="12"
            md="6"
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
            md="6"
          >
            <div class="text-body-2 text-medium-emphasis">
              Tasa de Respuesta
            </div>
            <div class="text-h6">
              {{ questionChart?.metadata?.response_rate || 0 }}%
            </div>
          </VCol>
        </VRow>

        <!-- Question Type Info -->
        <VChip
          v-if="questionChart?.metadata?.question_type"
          class="mt-2"
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ questionChart.metadata.question_type }}
        </VChip>
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
          mdi-chart-pie
        </VIcon>
        <div class="mt-2 text-grey">
          No hay datos disponibles para esta pregunta
        </div>
        <div
          v-if="questionChart && chartData.labels.length === 0"
          class="text-caption text-medium-emphasis mt-2"
        >
          La pregunta no tiene respuestas suficientes para generar un gráfico
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
