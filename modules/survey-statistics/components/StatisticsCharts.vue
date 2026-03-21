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
import { computed } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { useTheme } from 'vuetify'
import { getDoughnutChartConfig, getHorizontalBarChartConfig, getLineChartConfig } from '@core/libs/chartjs/chartjsConfig'
import type { SurveyStatistics } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'

const props = defineProps<Props>()

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
)

interface Props {
  statistics: SurveyStatistics | null
}

const { current: currentTheme } = useTheme()

// Configuraciones de gráficos
const barChartOptions = computed(() => getHorizontalBarChartConfig(currentTheme.value))

const horizontalBarChartOptions = computed(() => ({
  ...getHorizontalBarChartConfig(currentTheme.value),
  indexAxis: 'y' as const,
}))

const doughnutChartOptions = computed(() => getDoughnutChartConfig())
const lineChartOptions = computed(() => getLineChartConfig(currentTheme.value))

// Datos para gráfico de ubicaciones
const locationChartData = computed(() => {
  if (!props.statistics?.responses_by_location)
    return null

  const data = props.statistics.responses_by_location

  return {
    labels: Object.keys(data).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        label: 'Respuestas',
        data: Object.values(data),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

// Datos para gráfico de industrias
const industryChartData = computed(() => {
  if (!props.statistics?.responses_by_industry)
    return null

  const data = props.statistics.responses_by_industry

  return {
    labels: Object.keys(data).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

// Datos para gráfico de estado laboral
const employmentChartData = computed(() => {
  if (!props.statistics?.responses_by_employment_status)
    return null

  const data = props.statistics.responses_by_employment_status

  const labels = Object.keys(data).map(key => {
    switch (key) {
    case 'empleado': return 'Empleado'
    case 'desempleado': return 'Desempleado'
    case 'emprendedor': return 'Emprendedor'
    default: return key.charAt(0).toUpperCase() + key.slice(1)
    }
  })

  return {
    labels,
    datasets: [
      {
        label: 'Número de Egresados',
        data: Object.values(data),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

// Datos para gráfico de salarios
const salaryChartData = computed(() => {
  if (!props.statistics?.responses_by_salary_range)
    return null

  const data = props.statistics.responses_by_salary_range

  const labels = Object.keys(data).map(key => {
    switch (key) {
    case 'menos_1500': return 'Menos de S/1,500'
    case '1500_3000': return 'S/1,500 - S/3,000'
    case '3000_5000': return 'S/3,000 - S/5,000'
    case 'mas_5000': return 'Más de S/5,000'
    default: return key
    }
  })

  return {
    labels,
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
})

// Datos para gráfico mensual
const monthlyChartData = computed(() => {
  if (!props.statistics?.responses_by_month)
    return null

  const data = props.statistics.responses_by_month

  const monthNames = {
    enero: 'Enero',
    febrero: 'Febrero',
    marzo: 'Marzo',
    abril: 'Abril',
    mayo: 'Mayo',
    junio: 'Junio',
    julio: 'Julio',
    agosto: 'Agosto',
    septiembre: 'Septiembre',
    octubre: 'Octubre',
    noviembre: 'Noviembre',
    diciembre: 'Diciembre',
  }

  return {
    labels: Object.keys(data).map(key => monthNames[key as keyof typeof monthNames] || key),
    datasets: [
      {
        label: 'Respuestas',
        data: Object.values(data),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }
})
</script>

<template>
  <div>
    <VRow>
      <!-- Gráfico de respuestas por ubicación -->
      <VCol
        cols="12"
        lg="6"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-4">
              <VCardTitle class="pa-0">
                Respuestas por Ubicación
              </VCardTitle>
            </div>

            <div v-if="locationChartData">
              <Bar
                :data="locationChartData"
                :options="barChartOptions"
                :height="300"
              />
            </div>
            <div
              v-else
              class="d-flex justify-center align-center"
              style="block-size: 300px;"
            >
              <span class="text-body-2 text-medium-emphasis">
                No hay datos disponibles
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Gráfico de respuestas por industria -->
      <VCol
        cols="12"
        lg="6"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-4">
              <VCardTitle class="pa-0">
                Respuestas por Industria
              </VCardTitle>
            </div>

            <div v-if="industryChartData">
              <Doughnut
                :data="industryChartData"
                :options="doughnutChartOptions"
                :height="300"
              />
            </div>
            <div
              v-else
              class="d-flex justify-center align-center"
              style="block-size: 300px;"
            >
              <span class="text-body-2 text-medium-emphasis">
                No hay datos disponibles
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Gráfico de estado laboral -->
      <VCol
        cols="12"
        lg="6"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-4">
              <VCardTitle class="pa-0">
                Estado Laboral
              </VCardTitle>
            </div>

            <div v-if="employmentChartData">
              <Bar
                :data="employmentChartData"
                :options="horizontalBarChartOptions"
                :height="300"
              />
            </div>
            <div
              v-else
              class="d-flex justify-center align-center"
              style="block-size: 300px;"
            >
              <span class="text-body-2 text-medium-emphasis">
                No hay datos disponibles
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Gráfico de rango salarial -->
      <VCol
        cols="12"
        lg="6"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-4">
              <VCardTitle class="pa-0">
                Rango Salarial
              </VCardTitle>
            </div>

            <div v-if="salaryChartData">
              <Doughnut
                :data="salaryChartData"
                :options="doughnutChartOptions"
                :height="300"
              />
            </div>
            <div
              v-else
              class="d-flex justify-center align-center"
              style="block-size: 300px;"
            >
              <span class="text-body-2 text-medium-emphasis">
                No hay datos disponibles
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Gráfico de respuestas por mes -->
      <VCol cols="12">
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-4">
              <VCardTitle class="pa-0">
                Evolución de Respuestas por Mes
              </VCardTitle>
            </div>

            <div v-if="monthlyChartData">
              <Line
                :data="monthlyChartData"
                :options="lineChartOptions"
                :height="300"
              />
            </div>
            <div
              v-else
              class="d-flex justify-center align-center"
              style="block-size: 300px;"
            >
              <span class="text-body-2 text-medium-emphasis">
                No hay datos disponibles
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

