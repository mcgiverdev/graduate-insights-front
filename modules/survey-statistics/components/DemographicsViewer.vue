<script setup lang="ts">
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Title,
  Tooltip,
} from 'chart.js'
import { computed, ref, watch } from 'vue'
import { Doughnut, Pie } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyStatisticsService } from '@/composables/useSurveyStatisticsService'

// Chart.js imports

const props = defineProps<Props>()

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

interface Props {
  surveyId: number
  surveyTitle?: string
}

// Composables
const { demographicsData, loadingDemographics, fetchDemographics } = useSurveyStatisticsService()
const { showSnackbar } = useSnackbar()

// State
const selectedDemographic = ref<'gender' | 'age' | 'location' | 'industry'>('gender')
const selectedChartType = ref<'pie' | 'doughnut'>('doughnut')

// Demographic options
const demographicOptions = [
  { title: 'Género', value: 'gender' },
  { title: 'Edad', value: 'age' },
  { title: 'Ubicación', value: 'location' },
  { title: 'Industria', value: 'industry' },
]

// Chart type options
const chartTypeOptions = [
  { title: 'Gráfico de Dona', value: 'doughnut' },
  { title: 'Gráfico de Torta', value: 'pie' },
]

// Chart data
const chartData = computed(() => {
  if (!demographicsData.value)
    return { labels: [], datasets: [] }

  return {
    labels: demographicsData.value.labels,
    datasets: demographicsData.value.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.background_colors,
    })),
  }
})

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: demographicsData.value?.configuration?.legend?.position || 'right' as const,
    },
    title: {
      display: true,
      text: demographicsData.value?.title || 'Distribución Demográfica',
    },
  },
}))

// Methods
async function loadDemographics() {
  const result = await fetchDemographics(props.surveyId, selectedDemographic.value)

  if (!result.success) {
    showSnackbar({
      text: result.message || 'Error al cargar los datos demográficos',
      color: 'error',
    })
  }
}

function getDemographicIcon(demographic: string) {
  switch (demographic) {
    case 'gender': return 'tabler-users'
    case 'age': return 'tabler-calendar'
    case 'location': return 'tabler-map-pin'
    case 'industry': return 'tabler-building'
    default: return 'tabler-chart-pie'
  }
}

function getDemographicColor(demographic: string) {
  switch (demographic) {
    case 'gender': return 'purple'
    case 'age': return 'blue'
    case 'location': return 'green'
    case 'industry': return 'orange'
    default: return 'grey'
  }
}

// Watch for changes
watch([selectedDemographic, selectedChartType], () => {
  loadDemographics()
})

// Load initial demographics
loadDemographics()
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>
        <VIcon
          :icon="getDemographicIcon(selectedDemographic)"
          class="me-2"
        />
        Demografía - {{ surveyTitle || `Encuesta ${surveyId}` }}
      </span>
      <div class="d-flex gap-2">
        <AppSelect
          v-model="selectedDemographic"
          :items="demographicOptions"
          style="max-inline-size: 150px;"
          density="compact"
          hide-details
        />
        <AppSelect
          v-model="selectedChartType"
          :items="chartTypeOptions"
          style="max-inline-size: 120px;"
          density="compact"
          hide-details
        />
      </div>
    </VCardTitle>

    <VCardText>
      <!-- Loading State -->
      <div
        v-if="loadingDemographics"
        class="text-center py-8"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
        <div class="mt-2">
          Cargando datos demográficos...
        </div>
      </div>

      <!-- Chart Content -->
      <div
        v-else-if="demographicsData"
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
            v-else
            :data="chartData"
            :options="chartOptions"
          />
        </div>

        <!-- Demographics Metadata -->
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
              {{ demographicsData.total_responses }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 text-medium-emphasis">
              Tipo Demográfico
            </div>
            <div class="text-h6 text-capitalize">
              {{ demographicsData.metadata.demographic_type }}
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <div class="text-body-2 text-medium-emphasis">
              Más Común
            </div>
            <div class="text-h6 text-capitalize">
              {{ demographicsData.metadata.most_common }}
            </div>
          </VCol>
        </VRow>

        <!-- Detailed Statistics -->
        <VCard
          class="mt-4"
          variant="tonal"
          :color="getDemographicColor(selectedDemographic)"
        >
          <VCardTitle class="text-body-1">
            <VIcon
              :icon="getDemographicIcon(selectedDemographic)"
              class="me-2"
            />
            Distribución Detallada
          </VCardTitle>
          <VCardText>
            <VList density="compact">
              <VListItem
                v-for="(value, index) in demographicsData.labels"
                :key="index"
                :title="value"
              >
                <template #append>
                  <div class="d-flex align-center gap-2">
                    <VChip
                      :color="getDemographicColor(selectedDemographic)"
                      size="small"
                      variant="flat"
                    >
                      {{ demographicsData.datasets[0].data[index] }}
                    </VChip>
                    <div class="text-caption text-medium-emphasis">
                      ({{ Math.round((demographicsData.datasets[0].data[index] / demographicsData.total_responses) * 100) }}%)
                    </div>
                  </div>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
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
          tabler-users
        </VIcon>
        <div class="mt-2 text-grey">
          No hay datos demográficos disponibles
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
