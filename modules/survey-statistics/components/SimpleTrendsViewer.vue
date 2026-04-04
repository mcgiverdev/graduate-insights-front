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
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'

defineProps<Props>()

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
const { statistics } = useSurveyStatisticsService()

const MONTH_TRANSLATIONS: Record<string, string> = {
  JANUARY: 'Enero', FEBRUARY: 'Febrero', MARCH: 'Marzo', APRIL: 'Abril',
  MAY: 'Mayo', JUNE: 'Junio', JULY: 'Julio', AUGUST: 'Agosto',
  SEPTEMBER: 'Septiembre', OCTOBER: 'Octubre', NOVEMBER: 'Noviembre', DECEMBER: 'Diciembre',
  january: 'Enero', february: 'Febrero', march: 'Marzo', april: 'Abril',
  may: 'Mayo', june: 'Junio', july: 'Julio', august: 'Agosto',
  september: 'Septiembre', october: 'Octubre', november: 'Noviembre', december: 'Diciembre',
  enero: 'Enero', febrero: 'Febrero', marzo: 'Marzo', abril: 'Abril',
  mayo: 'Mayo', junio: 'Junio', julio: 'Julio', agosto: 'Agosto',
  septiembre: 'Septiembre', octubre: 'Octubre', noviembre: 'Noviembre', diciembre: 'Diciembre',
}

// Generar datos de tendencia basados en responses_by_month
const trendsChartData = computed(() => {
  if (!statistics.value?.responses_by_month)
    return { labels: [], datasets: [] }

  const monthsData = statistics.value.responses_by_month
  const labels = Object.keys(monthsData).map(k => MONTH_TRANSLATIONS[k] || k)
  const data = Object.values(monthsData)

  if (labels.length === 0)
    return { labels: [], datasets: [] }

  return {
    labels,
    datasets: [{
      label: 'Respuestas por Mes',
      data,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 6,
      pointHoverRadius: 8,
      spanGaps: true,
    }],
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
      text: 'Tendencia de Respuestas por Mes',
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Mes',
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
}))

// Validar si hay datos
const hasData = computed(() => {
  return statistics.value?.responses_by_month
         && Object.keys(statistics.value.responses_by_month).length > 0
})
</script>

<template>
  <VCard>
    <VCardTitle>
      Tendencias - {{ surveyTitle || `Encuesta ${surveyId}` }}
    </VCardTitle>

    <VCardText>
      <!-- Chart Content -->
      <div
        v-if="hasData"
        class="chart-container"
      >
        <div style="block-size: 400px;">
          <Line
            :data="trendsChartData"
            :options="chartOptions"
          />
        </div>

        <!-- Metadata -->
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
              {{ statistics?.total_responses || 0 }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <div class="text-body-2 text-medium-emphasis">
              Meses con Respuestas
            </div>
            <div class="text-h6">
              {{ Object.keys(statistics?.responses_by_month || {}).length }}
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
        <div class="text-caption text-medium-emphasis mt-2">
          Los datos de tendencias se generan automáticamente basados en las respuestas mensuales
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

