<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar, Doughnut, Pie } from 'vue-chartjs'
import { useTheme } from 'vuetify'
import { getDoughnutChartConfig } from '@core/libs/chartjs/chartjsConfig'
import type { QuestionStatistic, SurveyStatistics } from '@/composables/useSurveyStatisticsService'

interface Props {
  statistics: SurveyStatistics | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'question-selected': [questionId: number]
}>()

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
)

const { current: currentTheme } = useTheme()

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
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
        color: 'rgba(255, 255, 255, 0.1)',
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
  animation: {
    duration: 0,
  },
}))

const doughnutChartOptions = computed(() => getDoughnutChartConfig())

function getChartComponent(chartType: string) {
  switch (chartType) {
  case 'bar': return Bar
  case 'doughnut': return Doughnut
  case 'pie': return Pie
  default: return Bar
  }
}

function getChartOptions(chartType: string) {
  switch (chartType) {
  case 'bar': return barChartOptions.value
  case 'doughnut':
  case 'pie': return doughnutChartOptions.value
  default: return barChartOptions.value
  }
}

function getChartDataForQuestion(question: QuestionStatistic) {
  // Verificar que question exista
  if (!question) {
    console.log('QuestionStatistics: No question provided')

    return null
  }

  // Log para depuración
  console.log('QuestionStatistics: Processing question', {
    id: question.question_id,
    type: question.type,
    option_counts: question.option_counts,
    percentages: question.percentages,
  })

  // Verificar que option_counts exista y tenga datos
  if (!question.option_counts || Object.keys(question.option_counts).length === 0) {
    console.log('QuestionStatistics: No option_counts or empty option_counts')

    // Para preguntas SCALE, crear datos basados en estadísticas disponibles
    if (question.type === 'SCALE' && question.total_responses > 0) {
      console.log('QuestionStatistics: Creating SCALE data from available stats')

      const defaultLabels = ['1 - Muy insatisfecho', '2 - Insatisfecho', '3 - Neutral', '4 - Satisfecho', '5 - Muy satisfecho']

      // Si tenemos promedio, intentar simular una distribución básica
      let simulatedData = [1, 1, 2, 3, 2] // Distribución por defecto

      if (question.average && question.total_responses > 0) {
        // Crear una distribución simulada basada en el promedio
        const avg = question.average
        const total = question.total_responses

        // Distribución más realista basada en el promedio
        if (avg <= 2)
          simulatedData = [Math.ceil(total * 0.4), Math.ceil(total * 0.3), Math.ceil(total * 0.2), Math.ceil(total * 0.1), 0]
        else if (avg <= 3)
          simulatedData = [Math.ceil(total * 0.2), Math.ceil(total * 0.3), Math.ceil(total * 0.3), Math.ceil(total * 0.15), Math.ceil(total * 0.05)]
        else if (avg <= 4)
          simulatedData = [Math.ceil(total * 0.1), Math.ceil(total * 0.15), Math.ceil(total * 0.25), Math.ceil(total * 0.35), Math.ceil(total * 0.15)]
        else
          simulatedData = [0, Math.ceil(total * 0.1), Math.ceil(total * 0.2), Math.ceil(total * 0.3), Math.ceil(total * 0.4)]

        // Ajustar para que sume exactamente el total
        const currentSum = simulatedData.reduce((a, b) => a + b, 0)
        if (currentSum !== total) {
          const diff = total - currentSum

          simulatedData[Math.floor(avg) - 1] += diff
        }
      }

      return {
        labels: defaultLabels,
        datasets: [
          {
            label: 'Respuestas (estimado)',
            data: simulatedData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(75, 192, 192, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    }

    return null
  }

  const labels = Object.keys(question.option_counts).map(formatOptionName)
  const data = Object.values(question.option_counts)

  // Si no hay datos, retornar null
  if (labels.length === 0 || data.length === 0) {
    console.log('QuestionStatistics: Empty labels or data')

    return null
  }

  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ]

  const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 205, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
  ]

  console.log('QuestionStatistics: Returning chart data', { labels, data })

  return {
    labels,
    datasets: [
      {
        label: 'Respuestas',
        data,
        backgroundColor: colors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  }
}

function formatOptionName(option: string): string {
  const optionMap: Record<string, string> = {
    // Mapeos para escala de satisfacción
    muy_insatisfecho: 'Muy Insatisfecho',
    insatisfecho: 'Insatisfecho',
    neutral: 'Neutral',
    satisfecho: 'Satisfecho',
    muy_satisfecho: 'Muy Satisfecho',

    // Mapeos para opciones numéricas de escala
    1: '1 - Muy insatisfecho',
    2: '2 - Insatisfecho',
    3: '3 - Neutral',
    4: '4 - Satisfecho',
    5: '5 - Muy satisfecho',

    // Mapeos para opciones de Sí/No
    si: 'Sí',
    no: 'No',
    yes: 'Sí',

    // Agregar más mapeos según sea necesario
  }

  return optionMap[option] || option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<template>
  <div>
    <VRow>
      <VCol
        v-for="question in statistics?.question_statistics"
        :key="question.question_id"
        cols="12"
      >
        <VCard>
          <VCardText>
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <VCardTitle class="pa-0 mb-2">
                  {{ question.question_text }}
                </VCardTitle>
                <div class="d-flex gap-2">
                  <VChip
                    size="small"
                    :color="question.required ? 'error' : 'success'"
                  >
                    {{ question.required ? 'Obligatoria' : 'Opcional' }}
                  </VChip>
                  <VChip
                    size="small"
                    color="primary"
                  >
                    {{ question.type }}
                  </VChip>
                </div>
              </div>

              <div class="text-right">
                <div class="d-flex flex-column align-end gap-2">
                  <div>
                    <div class="text-h5 font-weight-bold">
                      {{ question.total_responses }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ Math.round(question.response_rate) }}% respuestas
                    </div>
                  </div>
                  <VBtn
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="tabler-chart-bar"
                    @click="emit('question-selected', question.question_id)"
                  >
                    Ver Gráficos
                  </VBtn>
                </div>
              </div>
            </div>

            <VRow v-if="question.type === 'SCALE'">
              <!-- Estadísticas numéricas para preguntas tipo escala -->
              <VCol
                cols="12"
                md="8"
              >
                <div v-if="getChartDataForQuestion(question)">
                  <VAlert
                    v-if="!question.option_counts || Object.keys(question.option_counts).length === 0"
                    type="warning"
                    variant="tonal"
                    class="mb-3"
                    density="compact"
                  >
                    <VIcon
                      icon="tabler-info-circle"
                      class="me-2"
                    />
                    Los datos del gráfico son estimados basados en el promedio ({{ question.average?.toFixed(1) }})
                    ya que no se recibieron datos detallados de la API.
                  </VAlert>
                  <div
                    class="chart-container"
                    style="position: relative; block-size: 300px; inline-size: 100%;"
                  >
                    <Bar
                      :data="getChartDataForQuestion(question)!"
                      :options="barChartOptions"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="text-center py-8"
                >
                  <VIcon
                    size="48"
                    color="grey-lighten-2"
                    icon="tabler-chart-bar"
                  />
                  <div class="text-body-2 text-medium-emphasis mt-2">
                    No hay datos suficientes para mostrar el gráfico
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Datos recibidos: {{ question.option_counts ? 'Sí' : 'No' }},
                    Total respuestas: {{ question.total_responses }}
                  </div>
                </div>
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <div class="d-flex flex-column gap-3">
                  <VCard
                    variant="outlined"
                    class="pa-3"
                  >
                    <div class="text-center">
                      <div class="text-h4 font-weight-bold text-primary">
                        {{ question.average?.toFixed(1) || 'N/A' }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Promedio
                      </div>
                    </div>
                  </VCard>

                  <VCard
                    variant="outlined"
                    class="pa-3"
                  >
                    <div class="text-center">
                      <div class="text-h4 font-weight-bold text-success">
                        {{ question.median?.toFixed(1) || 'N/A' }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Mediana
                      </div>
                    </div>
                  </VCard>

                  <VCard
                    variant="outlined"
                    class="pa-3"
                  >
                    <div class="text-center">
                      <div class="text-h4 font-weight-bold text-warning">
                        {{ question.mode?.toFixed(1) || 'N/A' }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Moda
                      </div>
                    </div>
                  </VCard>

                  <VCard
                    variant="outlined"
                    class="pa-3"
                  >
                    <div class="text-center">
                      <div class="text-h4 font-weight-bold text-info">
                        {{ question.standard_deviation?.toFixed(2) || 'N/A' }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Desv. Estándar
                      </div>
                    </div>
                  </VCard>
                </div>
              </VCol>
            </VRow>

            <VRow v-else>
              <!-- Para otros tipos de preguntas -->
              <VCol
                cols="12"
                lg="8"
              >
                <div v-if="getChartDataForQuestion(question)">
                  <div
                    class="chart-container"
                    style="position: relative; block-size: 300px; inline-size: 100%;"
                  >
                    <component
                      :is="getChartComponent(question.recommended_chart_type || 'bar')"
                      :data="getChartDataForQuestion(question)!"
                      :options="getChartOptions(question.recommended_chart_type || 'bar')"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="text-center py-8"
                >
                  <VIcon
                    size="48"
                    color="grey-lighten-2"
                    icon="tabler-chart-bar"
                  />
                  <div class="text-body-2 text-medium-emphasis mt-2">
                    No hay datos suficientes para mostrar el gráfico
                  </div>
                </div>
              </VCol>

              <VCol
                cols="12"
                lg="4"
              >
                <div class="d-flex flex-column gap-2">
                  <h4 class="text-h6 mb-2">
                    Distribución de Respuestas
                  </h4>
                  <div
                    v-for="(percentage, option) in question.percentages"
                    :key="option"
                    class="d-flex justify-space-between align-center"
                  >
                    <span class="text-body-2">
                      {{ formatOptionName(option) }}
                    </span>
                    <div class="d-flex align-center gap-2">
                      <span class="text-body-2 font-weight-bold">
                        {{ percentage.toFixed(1) }}%
                      </span>
                      <span class="text-body-2 text-medium-emphasis">
                        ({{ question.option_counts[option] }})
                      </span>
                    </div>
                  </div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
