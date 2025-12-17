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
import { computed, ref, watch } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useRoles } from '@/composables/useRoles'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'
import StatisticsButton from '@/modules/survey-statistics/components/StatisticsButton.vue'

// Chart.js registration
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

// Configuración de la página
definePageMeta({
  title: 'Dashboard',
  requiresAuth: true,
})

// Head configuration
useHead({
  title: 'Dashboard - Graduate Insights',
})

// Composables
const { dashboardData, loadingDashboard, fetchDashboard } = useSurveyStatisticsService()
const { showSnackbar } = useSnackbar()
const { isDirector, isEmployer, isGraduate, role, user } = useRoles()

// Filtros - solo año de graduación para directores
const filters = ref({
  graduation_year: undefined as number | undefined,
})

// Datos para el selector de años
const graduationYears = ref([
  { title: 'Todos los años', value: null },
  { title: '2024', value: 2024 },
  { title: '2023', value: 2023 },
  { title: '2022', value: 2022 },
  { title: '2021', value: 2021 },
  { title: '2020', value: 2020 },
])

// Chart options mejoradas
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}))

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
      },
    },
  },
}))

// Dashboard title según el rol
const dashboardTitle = computed(() => {
  if (isDirector.value)
    return 'Dashboard Administrativo'
  if (isEmployer.value)
    return 'Dashboard de Empleador'
  if (isGraduate.value)
    return 'Dashboard de Graduado'

  return 'Dashboard'
})

// Dashboard subtitle según el rol
const dashboardSubtitle = computed(() => {
  if (isDirector.value)
    return 'Vista general de todas las encuestas y estadísticas del sistema'
  if (isEmployer.value)
    return 'Gestiona tus ofertas laborales y consulta perfiles de graduados'
  if (isGraduate.value)
    return 'Accede a encuestas y gestiona tu perfil profesional'

  return 'Bienvenido al sistema Graduate Insights'
})

// Methods
function formatChartData(chart: any) {
  return {
    labels: chart.labels,
    datasets: chart.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: dataset.background_colors || dataset.background_color,
      borderColor: dataset.border_color,
      borderWidth: dataset.border_width || 2,
      tension: chart.chart_type === 'line' ? 0.4 : undefined,
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

function getSurveyStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'COMPLETED': return 'info'
    case 'PAUSED': return 'warning'
    case 'CLOSED': return 'error'
    case 'DRAFT': return 'grey'
    default: return 'grey'
  }
}

function getSurveyTypeIcon(surveyType: string) {
  switch (surveyType) {
    case 'EMPLOYMENT': return 'tabler-briefcase'
    case 'ACADEMIC': return 'tabler-school'
    case 'SATISFACTION': return 'tabler-heart'
    case 'ENTREPRENEURSHIP': return 'tabler-rocket'
    default: return 'tabler-file-text'
  }
}

async function loadDashboard(useFilters = false) {
  if (isDirector.value) {
    // Si useFilters es false, cargar sin filtros. Si es true, usar los filtros seleccionados
    const filtersToApply = useFilters ? filters.value : {}
    const result = await fetchDashboard(filtersToApply)

    if (!result.success) {
      showSnackbar({
        text: result.message || 'Error al cargar el dashboard',
        color: 'error',
      })
    }
  }
}

function clearFilters() {
  filters.value = {
    graduation_year: undefined,
  }

  // Al limpiar filtros, cargar sin filtros
  loadDashboard(false)
}

// Watch para cargar dashboard cuando el rol se resuelve
watch(isDirector, newIsDirector => {
  if (newIsDirector)
    loadDashboard(false) // Cargar sin filtros al inicio
}, { immediate: true })
</script>

<template>
  <div>
    <!-- Header dinámico según el rol -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">
          <VIcon
            icon="tabler-dashboard"
            class="me-3"
            size="32"
          />
          {{ dashboardTitle }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ dashboardSubtitle }}
        </p>
      </div>
      <VBtn
        v-if="isDirector"
        :loading="loadingDashboard"
        color="primary"
        prepend-icon="tabler-refresh"
        @click="loadDashboard"
      >
        Actualizar
      </VBtn>
    </div>

    <!-- DASHBOARD PARA DIRECTORES -->
    <div v-if="isDirector">
      <!-- Filtros simplificados -->
      <VCard class="mb-6">
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="tabler-filter"
            class="me-2"
          />
          Filtros
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <AppSelect
                v-model="filters.graduation_year"
                :items="graduationYears"
                label="Año de Graduación"
                placeholder="Seleccione un año"
                @update:model-value="() => loadDashboard(true)"
              />
            </VCol>
            <VCol
              cols="auto"
              class="d-flex align-center"
            >
              <VBtn
                variant="outlined"
                prepend-icon="tabler-x"
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
        v-if="loadingDashboard && !dashboardData"
        class="text-center py-8"
      >
        <VProgressCircular
          indeterminate
          color="primary"
          size="64"
        />
        <div class="mt-4 text-h6">
          Cargando dashboard...
        </div>
      </div>

      <!-- Dashboard Content para Directores -->
      <div v-else-if="dashboardData">
        <!-- KPI Indicators -->
        <VRow class="mb-6">
          <VCol
            v-for="kpi in dashboardData.kpi_indicators"
            :key="kpi.name"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard
              class="h-100"
              elevation="2"
            >
              <VCardText class="d-flex align-center pa-6">
                <div class="flex-grow-1">
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    {{ kpi.name }}
                  </div>
                  <div
                    class="text-h4 font-weight-bold mb-1"
                    :style="{ color: kpi.color }"
                  >
                    {{ kpi.value }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ kpi.description }}
                  </div>
                </div>
                <VAvatar
                  :color="getTrendColor(kpi.trend)"
                  variant="tonal"
                  size="48"
                >
                  <VIcon
                    :icon="getTrendIcon(kpi.trend)"
                    size="24"
                  />
                </VAvatar>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Estadísticas Generales -->
        <VCard class="mb-6">
          <VCardTitle class="d-flex align-center">
            <VIcon
              icon="tabler-chart-pie"
              class="me-2"
            />
            Estadísticas Generales
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="6"
                md="3"
              >
                <div class="text-center">
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="56"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-file-text"
                      size="28"
                    />
                  </VAvatar>
                  <div class="text-h4 font-weight-bold text-primary mb-1">
                    {{ dashboardData.general_statistics.total_surveys }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Total de Encuestas
                  </div>
                </div>
              </VCol>
              <VCol
                cols="6"
                md="3"
              >
                <div class="text-center">
                  <VAvatar
                    color="success"
                    variant="tonal"
                    size="56"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-users"
                      size="28"
                    />
                  </VAvatar>
                  <div class="text-h4 font-weight-bold text-success mb-1">
                    {{ dashboardData.general_statistics.total_graduates }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Total de Graduados
                  </div>
                </div>
              </VCol>
              <VCol
                cols="6"
                md="3"
              >
                <div class="text-center">
                  <VAvatar
                    color="info"
                    variant="tonal"
                    size="56"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-message-circle"
                      size="28"
                    />
                  </VAvatar>
                  <div class="text-h4 font-weight-bold text-info mb-1">
                    {{ dashboardData.general_statistics.total_responses }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Total de Respuestas
                  </div>
                </div>
              </VCol>
              <VCol
                cols="6"
                md="3"
              >
                <div class="text-center">
                  <VAvatar
                    color="warning"
                    variant="tonal"
                    size="56"
                    class="mb-3"
                  >
                    <VIcon
                      icon="tabler-percentage"
                      size="28"
                    />
                  </VAvatar>
                  <div class="text-h4 font-weight-bold text-warning mb-1">
                    {{ dashboardData.general_statistics.overall_response_rate.toFixed(1) }}%
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Tasa de Respuesta
                  </div>
                </div>
              </VCol>
            </VRow>

            <!-- Estado de Encuestas -->
            <VDivider class="my-6" />
            <VRow>
              <VCol
                cols="6"
                md="6"
              >
                <div class="text-center">
                  <VChip
                    color="success"
                    variant="tonal"
                    size="large"
                    class="mb-2"
                  >
                    <VIcon
                      icon="tabler-play"
                      start
                    />
                    {{ dashboardData.general_statistics.active_surveys }}
                  </VChip>
                  <div class="text-body-2 text-medium-emphasis">
                    Encuestas Activas
                  </div>
                </div>
              </VCol>
              <VCol
                cols="6"
                md="6"
              >
                <div class="text-center">
                  <VChip
                    color="info"
                    variant="tonal"
                    size="large"
                    class="mb-2"
                  >
                    <VIcon
                      icon="tabler-check"
                      start
                    />
                    {{ dashboardData.general_statistics.completed_surveys }}
                  </VChip>
                  <div class="text-body-2 text-medium-emphasis">
                    Encuestas Completadas
                  </div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Gráficos del Dashboard -->
        <VRow class="mb-6">
          <VCol
            v-for="(chart, index) in dashboardData.dashboard_charts"
            :key="index"
            cols="12"
            md="6"
          >
            <VCard class="h-100">
              <VCardTitle class="d-flex align-center">
                <VIcon
                  :icon="chart.chart_type === 'pie' ? 'tabler-chart-pie'
                    : chart.chart_type === 'line' ? 'tabler-chart-line' : 'tabler-chart-bar'"
                  class="me-2"
                />
                {{ chart.title }}
              </VCardTitle>
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
                    :options="chartOptions"
                  />
                  <!-- Bar Chart -->
                  <Bar
                    v-else-if="chart.chart_type === 'bar'"
                    :data="formatChartData(chart)"
                    :options="chartOptions"
                  />
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Encuestas Recientes -->
        <VCard class="mb-6">
          <VCardTitle class="d-flex align-center">
            <VIcon
              icon="tabler-clock"
              class="me-2"
            />
            Encuestas Recientes
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                v-for="survey in dashboardData.recent_surveys.slice(0, 6)"
                :key="survey.id"
                cols="12"
                md="6"
                lg="4"
              >
                <VCard
                  variant="outlined"
                  class="h-100"
                >
                  <VCardText>
                    <div class="d-flex align-start justify-space-between mb-3">
                      <VAvatar
                        :color="getSurveyStatusColor(survey.status)"
                        variant="tonal"
                        size="40"
                      >
                        <VIcon :icon="getSurveyTypeIcon(survey.survey_type.name)" />
                      </VAvatar>
                      <VChip
                        :color="getSurveyStatusColor(survey.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ survey.status }}
                      </VChip>
                    </div>

                    <h4 class="text-h6 mb-2 text-truncate">
                      {{ survey.title }}
                    </h4>

                    <p class="text-body-2 text-medium-emphasis mb-3 text-truncate-2">
                      {{ survey.description }}
                    </p>

                    <div class="d-flex justify-space-between align-center mb-3">
                      <div class="text-caption text-medium-emphasis">
                        {{ survey.survey_type.name }}
                      </div>
                      <div class="text-caption font-weight-medium">
                        {{ survey.questions.length }} preguntas
                      </div>
                    </div>

                    <div class="d-flex justify-space-between align-center mb-3">
                      <div class="text-caption text-medium-emphasis">
                        {{ survey.start_date }} - {{ survey.end_date }}
                      </div>
                    </div>

                    <StatisticsButton
                      :survey-id="survey.id"
                      button-text="Ver Estadísticas"
                      variant="outlined"
                      size="small"
                      color="primary"
                      class="w-100"
                    />
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Respuestas por Año de Graduación -->
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon
              icon="tabler-calendar"
              class="me-2"
            />
            Respuestas por Año de Graduación
          </VCardTitle>
          <VCardText>
            <VList>
              <VListItem
                v-for="(count, year) in dashboardData.general_statistics.responses_by_graduation_year"
                :key="year"
                class="px-0"
              >
                <template #prepend>
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="40"
                  >
                    <VIcon icon="tabler-calendar" />
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium">
                  Promoción {{ year }}
                </VListItemTitle>

                <template #append>
                  <VChip
                    color="primary"
                    variant="tonal"
                    size="small"
                  >
                    {{ count }} respuestas
                  </VChip>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </div>

      <!-- Empty State para Directores -->
      <div
        v-else
        class="text-center py-12"
      >
        <VIcon
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        >
          tabler-chart-line
        </VIcon>
        <div class="text-h6 text-medium-emphasis mb-2">
          No hay datos disponibles
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Pruebe cambiando los filtros o contacte al administrador
        </div>
      </div>
    </div>

    <!-- DASHBOARD PARA EMPLEADORES -->
    <div v-else-if="isEmployer">
      <VRow>
        <!-- Welcome Card -->
        <VCol cols="12">
          <VCard
            color="primary"
            variant="tonal"
            class="mb-6"
          >
            <VCardText class="pa-6">
              <div class="d-flex align-center">
                <VAvatar
                  color="primary"
                  size="64"
                  class="me-4"
                >
                  <VIcon
                    icon="tabler-briefcase"
                    size="32"
                  />
                </VAvatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-2">
                    ¡Bienvenido {{ user?.name }}!
                  </h2>
                  <p class="text-body-1 mb-0">
                    Tu plataforma para encontrar el talento perfecto
                  </p>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Quick Actions for Employers -->
        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="primary"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-users"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Explorar Graduados
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Encuentra perfiles de graduados que se ajusten a tus necesidades
              </p>
              <VBtn
                color="primary"
                variant="outlined"
                to="/graduates"
              >
                Ver Graduados
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="success"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-file-text"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Encuestas
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Accede y gestiona encuestas para obtener insights valiosos
              </p>
              <VBtn
                color="success"
                variant="outlined"
                to="/surveys"
              >
                Ver Encuestas
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="info"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-building"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Empresas
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Gestiona la información de tu empresa y oportunidades laborales
              </p>
              <VBtn
                color="info"
                variant="outlined"
                to="/employers"
              >
                Ver Empresas
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="warning"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-chart-bar"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Estadísticas
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Analiza tendencias y estadísticas del mercado laboral
              </p>
              <VBtn
                color="warning"
                variant="outlined"
                disabled
              >
                Próximamente
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- DASHBOARD PARA GRADUADOS -->
    <div v-else-if="isGraduate">
      <VRow>
        <!-- Welcome Card -->
        <VCol cols="12">
          <VCard
            color="success"
            variant="tonal"
            class="mb-6"
          >
            <VCardText class="pa-6">
              <div class="d-flex align-center">
                <VAvatar
                  color="success"
                  size="64"
                  class="me-4"
                >
                  <VIcon
                    icon="tabler-graduation-cap"
                    size="32"
                  />
                </VAvatar>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-2">
                    ¡Bienvenido {{ user?.name }}!
                  </h2>
                  <p class="text-body-1 mb-0">
                    Tu plataforma para el desarrollo profesional continuo
                  </p>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Quick Actions for Graduates -->
        <VCol
          cols="12"
          md="6"
          lg="4"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="primary"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-file-text"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Mis Encuestas
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Participa en encuestas y comparte tu experiencia profesional
              </p>
              <VBtn
                color="primary"
                variant="outlined"
                to="/my-surveys"
              >
                Ver Encuestas
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="6"
          lg="4"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="success"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-user"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Mi Perfil
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Actualiza tu información personal y profesional
              </p>
              <VBtn
                color="success"
                variant="outlined"
                disabled
              >
                Próximamente
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="6"
          lg="4"
        >
          <VCard class="text-center h-100">
            <VCardText class="pa-6">
              <VAvatar
                color="info"
                variant="tonal"
                size="56"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-briefcase"
                  size="28"
                />
              </VAvatar>
              <h3 class="text-h6 mb-2">
                Oportunidades
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Explora oportunidades laborales y de desarrollo profesional
              </p>
              <VBtn
                color="info"
                variant="outlined"
                disabled
              >
                Próximamente
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- DASHBOARD GENÉRICO (fallback) -->
    <div v-else>
      <VCard class="text-center">
        <VCardText class="pa-12">
          <VIcon
            size="64"
            color="grey-lighten-1"
            class="mb-4"
          >
            tabler-user
          </VIcon>
          <h2 class="text-h5 mb-4">
            Bienvenido al Sistema
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Para acceder a todas las funcionalidades, contacta al administrador para asignar tu rol correspondiente.
          </p>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
}

.text-truncate-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>

