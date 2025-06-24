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
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyStatisticsService } from '@/composables/useSurveyStatisticsService'

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

// Period options
const periodOptions = [
  { title: 'Diario', value: 'daily' },
  { title: 'Semanal', value: 'weekly' },
  { title: 'Mensual', value: 'monthly' },
]

// Chart data
const chartData = computed(() => {
  if (!trendsData.value)
    return { labels: [], datasets: [] }

  return {
    labels: trendsData.value.labels,
    datasets: trendsData.value.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.background_color,
      borderColor: dataset.border_color,
      borderWidth: dataset.border_width || 2,
      fill: false,
      tension: 0.1,
    })),
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
    title: {
      display: true,
      text: trendsData.value?.title || 'Tendencias de Respuestas',
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: trendsData.value?.configuration?.axes?.x_axis?.title || 'Período',
      },
    },
    y: {
      title: {
        display: true,
        text: trendsData.value?.configuration?.axes?.y_axis?.title || 'Cantidad de Respuestas',
      },
      beginAtZero: true,
    },
  },
}))

// Methods
async function loadTrends() {
  const result = await fetchTrends(props.surveyId, selectedPeriod.value)

  if (!result.success) {
    showSnackbar({
      text: result.message || 'Error al cargar las tendencias',
      color: 'error',
    })
  }
}

function getTrendColor(growthRate: number) {
  if (growthRate > 0)
    return 'text-success'
  if (growthRate < 0)
    return 'text-error'

  return 'text-grey'
}

function getTrendIcon(growthRate: number) {
  if (growthRate > 0)
    return 'mdi-trending-up'
  if (growthRate < 0)
    return 'mdi-trending-down'

  return 'mdi-trending-neutral'
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadTrends()
})

// Load initial trends
loadTrends()
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
        v-else-if="trendsData"
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
              {{ trendsData.total_responses }}
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
              {{ trendsData.metadata.period }}
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
              :class="getTrendColor(trendsData.metadata.growth_rate)"
            >
              {{ trendsData.metadata.growth_rate }}%
              <VIcon
                :icon="getTrendIcon(trendsData.metadata.growth_rate)"
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
          mdi-trending-up
        </VIcon>
        <div class="mt-2 text-grey">
          No hay datos de tendencias disponibles
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
