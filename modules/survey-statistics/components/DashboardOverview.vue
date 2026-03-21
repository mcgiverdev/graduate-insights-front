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
import { computed, onMounted, ref } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import type { DashboardChart } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'

// Chart.js imports

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
)

// Composables
const { dashboardData, loadingDashboard, fetchDashboard } = useSurveyStatisticsService()
const { showSnackbar } = useSnackbar()

// Filtros
const filters = ref({
  graduation_year: undefined as number | undefined,
  education_center_id: undefined as number | undefined,
})

// Datos para los selectores (estos deberían venir de APIs específicas)
const graduationYears = ref([
  { title: '2024', value: 2024 },
  { title: '2023', value: 2023 },
  { title: '2022', value: 2022 },
  { title: '2021', value: 2021 },
])

const educationCenters = ref([
  { id: 1, name: 'Universidad Nacional' },
  { id: 2, name: 'Universidad Privada' },
  { id: 3, name: 'Instituto Técnico' },
])

// Chart options
const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
    },
  },
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}))

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}))

// Methods
function formatChartData(chart: DashboardChart) {
  return {
    labels: chart.labels,
    datasets: chart.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.background_colors || dataset.background_color,
      borderColor: dataset.border_color,
    })),
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'up': return 'tabler-trending-up'
    case 'down': return 'tabler-trending-down'
    default: return 'tabler-trending-up'
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
  case 'up': return 'success'
  case 'down': return 'error'
  default: return 'grey'
  }
}

async function loadDashboard() {
  const result = await fetchDashboard(filters.value)

  if (!result.success) {
    showSnackbar({
      message: result.message || 'Error al cargar el dashboard',
      color: 'error',
    })
  }
}

function clearFilters() {
  filters.value = {
    graduation_year: undefined,
    education_center_id: undefined,
  }
}

onMounted(() => {
  // Cargar dashboard inicial sin filtros
  loadDashboard()
})
</script>

<template>
  <div>
    <!-- Filtros del Dashboard -->
    <VCard class="mb-6">
      <VCardTitle>Filtros del Dashboard</VCardTitle>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="filters.graduation_year"
              :items="graduationYears"
              label="Año de Graduación"
              placeholder="Seleccione un año"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppSelect
              v-model="filters.education_center_id"
              :items="educationCenters"
              item-title="name"
              item-value="id"
              label="Centro Educativo"
              placeholder="Seleccione un centro"
              clearable
            />
          </VCol>
        </VRow>
        <VRow class="mt-2">
          <VCol cols="auto">
            <VBtn
              :loading="loadingDashboard"
              color="primary"
              @click="loadDashboard"
            >
              Aplicar Filtros
            </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn
              variant="outlined"
              @click="clearFilters"
            >
              Limpiar Filtros
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Estados de Carga y Error -->
    <div
      v-if="loadingDashboard"
      class="text-center py-8"
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
      <div class="mt-4">
        Cargando dashboard...
      </div>
    </div>

    <div
      v-else-if="!dashboardData"
      class="text-center py-8"
    >
      <VIcon
        size="64"
        color="grey-lighten-1"
      >
        tabler-chart-line
      </VIcon>
      <div class="mt-4 text-grey">
        Seleccione filtros para ver el dashboard
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- KPI Indicators -->
      <VRow class="mb-6">
        <VCol
          v-for="kpi in dashboardData.kpi_indicators"
          :key="kpi.name"
          cols="12"
          sm="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center">
              <div class="flex-grow-1">
                <div class="text-body-2 text-medium-emphasis">
                  {{ kpi.name }}
                </div>
                <div
                  class="text-h5 font-weight-bold"
                  :style="{ color: kpi.color }"
                >
                  {{ kpi.value }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ kpi.description }}
                </div>
              </div>
              <VIcon
                :color="getTrendColor(kpi.trend)"
                size="24"
              >
                {{ getTrendIcon(kpi.trend) }}
              </VIcon>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- General Statistics -->
      <VCard class="mb-6">
        <VCardTitle>Estadísticas Generales</VCardTitle>
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <div class="text-center">
                <div class="text-h3 font-weight-bold text-primary">
                  {{ dashboardData.general_statistics.total_surveys }}
                </div>
                <div class="text-body-2">
                  Total de Encuestas
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <div class="text-center">
                <div class="text-h3 font-weight-bold text-success">
                  {{ dashboardData.general_statistics.total_graduates }}
                </div>
                <div class="text-body-2">
                  Total de Graduados
                </div>
              </div>
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <div class="text-center">
                <div class="text-h3 font-weight-bold text-info">
                  {{ dashboardData.general_statistics.total_responses }}
                </div>
                <div class="text-body-2">
                  Total de Respuestas
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Dashboard Charts -->
      <VRow>
        <VCol
          v-for="(chart, index) in dashboardData.dashboard_charts"
          :key="index"
          cols="12"
          md="6"
        >
          <VCard>
            <VCardTitle>{{ chart.title }}</VCardTitle>
            <VCardText>
              <div
                class="chart-container"
                style="block-size: 300px;"
              >
                <!-- Pie Chart -->
                <Pie
                  v-if="chart.chart_type === 'pie'"
                  :data="formatChartData(chart)"
                  :options="pieChartOptions"
                />
                <!-- Line Chart -->
                <Line
                  v-else-if="chart.chart_type === 'line'"
                  :data="formatChartData(chart)"
                  :options="lineChartOptions"
                />
                <!-- Bar Chart -->
                <Bar
                  v-else-if="chart.chart_type === 'bar'"
                  :data="formatChartData(chart)"
                  :options="barChartOptions"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Respuestas por Centro Educativo -->
      <VCard class="mt-6">
        <VCardTitle>Respuestas por Centro Educativo</VCardTitle>
        <VCardText>
          <VList>
            <VListItem
              v-for="(count, center) in dashboardData.general_statistics.responses_by_education_center"
              :key="center"
            >
              <VListItemTitle>{{ center }}</VListItemTitle>
              <template #append>
                <VChip
                  color="primary"
                  size="small"
                >
                  {{ count }}
                </VChip>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>

      <!-- Respuestas por Año de Graduación -->
      <VCard class="mt-6">
        <VCardTitle>Respuestas por Año de Graduación</VCardTitle>
        <VCardText>
          <VList>
            <VListItem
              v-for="(count, year) in dashboardData.general_statistics.responses_by_graduation_year"
              :key="year"
            >
              <VListItemTitle>{{ year }}</VListItemTitle>
              <template #append>
                <VChip
                  color="success"
                  size="small"
                >
                  {{ count }}
                </VChip>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
}
</style>

