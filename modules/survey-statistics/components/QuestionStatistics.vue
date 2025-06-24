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
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
      },
    },
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
  // Verificar que question y option_counts existan
  if (!question || !question.option_counts)
    return null

  const labels = Object.keys(question.option_counts).map(formatOptionName)
  const data = Object.values(question.option_counts)

  // Si no hay datos, retornar null
  if (labels.length === 0 || data.length === 0)
    return null

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
    muy_insatisfecho: 'Muy Insatisfecho',
    insatisfecho: 'Insatisfecho',
    neutral: 'Neutral',
    satisfecho: 'Satisfecho',
    muy_satisfecho: 'Muy Satisfecho',

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
                    prepend-icon="mdi-chart-box"
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
                  <Bar
                    :data="getChartDataForQuestion(question)!"
                    :options="barChartOptions"
                    :height="250"
                  />
                </div>
                <div
                  v-else
                  class="text-center py-8"
                >
                  <VIcon
                    size="48"
                    color="grey-lighten-2"
                    icon="mdi-chart-bar"
                  />
                  <div class="text-body-2 text-medium-emphasis mt-2">
                    No hay datos suficientes para mostrar el gráfico
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
                  <component
                    :is="getChartComponent(question.recommended_chart_type || 'bar')"
                    :data="getChartDataForQuestion(question)!"
                    :options="getChartOptions(question.recommended_chart_type || 'bar')"
                    :height="250"
                  />
                </div>
                <div
                  v-else
                  class="text-center py-8"
                >
                  <VIcon
                    size="48"
                    color="grey-lighten-2"
                    icon="mdi-chart-bar"
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
