<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'

// Chart.js imports

const props = defineProps<Props>()

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface Props {
  surveyId: number
  surveyTitle?: string
}

// Composables
const { trendsData, loadingTrends, fetchTrends } = useSurveyStatisticsService()
const { showSnackbar } = useSnackbar()

// State
const selectedPeriod = ref<'daily' | 'weekly' | 'monthly'>('monthly')
const error = ref<string | null>(null)

// Period options
const periodOptions = [
  { title: 'Diario', value: 'daily' },
  { title: 'Semanal', value: 'weekly' },
  { title: 'Mensual', value: 'monthly' },
]

// Chart data con validación robusta
const chartData = computed(() => {
  if (!trendsData.value)
    return { labels: [], datasets: [] }

  try {
    // Validar que existan las propiedades necesarias
    if (!trendsData.value.labels || !Array.isArray(trendsData.value.labels)) {
      console.warn('TrendsViewer: labels is not an array or missing')

      return { labels: [], datasets: [] }
    }

    if (!trendsData.value.datasets || !Array.isArray(trendsData.value.datasets)) {
      console.warn('TrendsViewer: datasets is not an array or missing')

      return { labels: trendsData.value.labels, datasets: [] }
    }

    const processedDatasets = trendsData.value.datasets.map((dataset, index) => {
      // Validar dataset
      if (!dataset || typeof dataset !== 'object') {
        console.warn(`TrendsViewer: dataset ${index} is invalid`, dataset)

        return {
          label: `Dataset ${index}`,
          data: [],
          backgroundColor: '#E0E0E0',
          borderColor: '#BDBDBD',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        }
      }

      return {
        ...dataset,
        backgroundColor: dataset.background_color || 'rgba(54, 162, 235, 0.2)',
        borderColor: dataset.border_color || 'rgba(54, 162, 235, 1)',
        borderWidth: dataset.border_width || 2,
        fill: false,
        tension: 0.1,
      }
    })

    return {
      labels: trendsData.value.labels,
      datasets: processedDatasets,
    }
  }
  catch (err) {
    console.error('TrendsViewer: Error processing chart data', err)

    return { labels: [], datasets: [] }
  }
})

// Chart options con validación
const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: trendsData.value?.title || 'Tendencias de Respuestas',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Período',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cantidad de Respuestas',
        },
        beginAtZero: true,
      },
    },
  }

  // Intentar usar configuración personalizada si existe
  try {
    if (trendsData.value?.configuration?.axes) {
      const axes = trendsData.value.configuration.axes
      if (axes.x_axis?.title)
        baseOptions.scales.x.title.text = axes.x_axis.title

      if (axes.y_axis?.title)
        baseOptions.scales.y.title.text = axes.y_axis.title
    }
  }
  catch (err) {
    console.warn('TrendsViewer: Error processing chart configuration', err)
  }

  return baseOptions
})

// Computed para validar si hay datos válidos
const hasValidData = computed(() => {
  return trendsData.value
         && Array.isArray(trendsData.value.labels)
         && trendsData.value.labels.length > 0
         && Array.isArray(trendsData.value.datasets)
         && trendsData.value.datasets.length > 0
})

// Methods con mejor manejo de errores
async function loadTrends() {
  error.value = null

  try {
    const result = await fetchTrends(props.surveyId, selectedPeriod.value)

    if (!result.success) {
      error.value = result.message || 'Error al cargar las tendencias'
      showSnackbar({
        text: result.message || 'Error al cargar las tendencias',
        color: 'error',
      })
    }
  }
  catch (err) {
    console.error('TrendsViewer: Error in loadTrends', err)
    error.value = 'Error inesperado al cargar las tendencias'
    showSnackbar({
      text: 'Error inesperado al cargar las tendencias',
      color: 'error',
    })
  }
}

function getTrendColor(growthRate: number | undefined) {
  if (typeof growthRate !== 'number')
    return 'text-grey'
  if (growthRate > 0)
    return 'text-success'
  if (growthRate < 0)
    return 'text-error'

  return 'text-grey'
}

function getTrendIcon(growthRate: number | undefined) {
  if (typeof growthRate !== 'number')
    return 'tabler-trending-up'
  if (growthRate > 0)
    return 'tabler-trending-up'
  if (growthRate < 0)
    return 'tabler-trending-down'

  return 'tabler-trending-up'
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadTrends()
}, { immediate: false })

// Load initial trends on mount
onMounted(() => {
  loadTrends()
})
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Tendencias - {{ surveyTitle || `Encuesta ${surveyId}` }}</span>
      <AppSelect
        v-model="selectedPeriod"
        :items="periodOptions"
        style="max-inline-size: 150px;"
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
        v-if="loadingTrends"
        class="text-center py-8"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <div class="mt-2">
          Cargando tendencias...
        </div>
      </div>

      <!-- Chart Content -->
      <div
        v-else-if="hasValidData"
        class="chart-container"
      >
        <div style="block-size: 400px;">
          <Line
            :data="chartData"
            :options="chartOptions"
          />
        </div>

        <!-- Trends Metadata -->
        <VDivider class="my-4" />

        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 text-medium-emphasis">
              Total de Respuestas
            </div>
            <div class="text-h6">
              {{ trendsData?.total_responses || 0 }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 text-medium-emphasis">
              Período
            </div>
            <div class="text-h6 text-capitalize">
              {{ trendsData?.metadata?.period || selectedPeriod }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 text-medium-emphasis">
              Tasa de Crecimiento
            </div>
            <div
              class="text-h6"
              :class="getTrendColor(trendsData?.metadata?.growth_rate)"
            >
              {{ trendsData?.metadata?.growth_rate || 0 }}%
              <VIcon
                :icon="getTrendIcon(trendsData?.metadata?.growth_rate)"
                size="small"
                class="ms-1"
              />
            </div>
          </VCol>
        </VRow>
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
          tabler-trending-up
        </VIcon>
        <div class="mt-2 text-grey">
          No hay datos de tendencias disponibles
        </div>
        <div
          v-if="trendsData"
          class="text-caption text-medium-emphasis mt-2"
        >
          Período: {{ selectedPeriod }} | Encuesta ID: {{ surveyId }}
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

