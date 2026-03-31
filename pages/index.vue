<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useGraduateDashboard } from '@/src/features/graduate-dashboard'
import { useRoles } from '@/composables/useRoles'
import { StatisticsButton, useSurveyStatisticsDashboard } from '@/src/features/survey-statistics'
import { formatReadableDate } from '@/utils/dateUtils'

// Chart.js se carga solo cuando el Director abre el dashboard (lazy)
const ChartRenderer = defineAsyncComponent(() => import('@/components/ChartRenderer.vue'))

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
const {
  dashboardData,
  loadingDashboard,
  filters,
  graduationYears,
  chartOptions,
  pieChartOptions,
  formatChartData,
  getTrendIcon,
  getTrendColor,
  getSurveyStatusColor,
  getSurveyTypeIcon,
  loadDashboard: loadDirectorDashboard,
  clearFilters: clearDirectorFilters,
} = useSurveyStatisticsDashboard()
const { isDirector, isEmployer, isGraduate, role, user } = useRoles()
const {
  loadGraduateDashboard,
  graduateDashboardLoading,
  surveyStats,
  pendingSurveys,
  completedSurveys,
  jobs,
  jobOffers,
  activeJobsCount,
  totalJobsCount,
  profileComplete,
} = useGraduateDashboard()

const graduateDashboardLoaded = ref(false)
const surveyPreview = computed(() => {
  const upcoming = pendingSurveys.value.slice(0, 3)
  if (upcoming.length >= 3)
    return upcoming

  const remaining = 3 - upcoming.length

  return [...upcoming, ...completedSurveys.value.slice(0, remaining)]
})

const jobTimeline = computed(() => jobs.value.slice(0, 4))
const jobOfferPreview = computed(() => jobOffers.value.slice(0, 3))

function surveyCompletionLabel(completed: boolean) {
  return completed ? 'Completada' : 'Pendiente'
}

function surveyCompletionColor(completed: boolean) {
  return completed ? 'success' : 'warning'
}

function formatJobRange(job: { fechaInicio: string; fechaFin: string }) {
  const start = formatReadableDate(job.fechaInicio)
  const end = job.fechaFin ? formatReadableDate(job.fechaFin) : 'Presente'

  return `${start} - ${end}`
}

function openJobOffer(link: string) {
  if (!link)
    return

  const normalized = link.startsWith('http') ? link : `https://${link}`
  window.open(normalized, '_blank')
}

function summarize(text: string, limit = 140) {
  if (!text)
    return 'Sin descripción disponible'

  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

// Dashboard title según el rol
const dashboardTitle = computed(() => {
  if (isDirector.value)
    return 'Panel de Control'
  if (isEmployer.value)
    return 'Mi Panel'
  if (isGraduate.value)
    return 'Mi Panel'

  return 'Inicio'
})

// Dashboard subtitle según el rol
const dashboardSubtitle = computed(() => {
  if (isDirector.value)
    return 'Resumen de encuestas y estadísticas del sistema'
  if (isEmployer.value)
    return 'Gestiona tus ofertas laborales y consulta perfiles de graduados'
  if (isGraduate.value)
    return 'Accede a tus encuestas pendientes y gestiona tu perfil profesional'

  return 'Bienvenido al sistema Egresys'
})

async function loadDashboard(useFilters = false) {
  if (isDirector.value)
    await loadDirectorDashboard(useFilters)
}

async function clearFilters() {
  await clearDirectorFilters()
}

// Watch para cargar dashboard cuando el rol se resuelve
watch(isDirector, newIsDirector => {
  if (newIsDirector)
    loadDashboard(false) // Cargar sin filtros al inicio
}, { immediate: true })

watch(isGraduate, async newIsGraduate => {
  if (newIsGraduate && !graduateDashboardLoaded.value) {
    await loadGraduateDashboard()
    graduateDashboardLoaded.value = true
  }
}, { immediate: true })
</script>

<template>
  <div>
    <!-- Header dinámico según el rol -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">
          {{ dashboardTitle }}
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ dashboardSubtitle }}
        </p>
      </div>
      <div
        v-if="isDirector"
        class="d-flex align-center gap-3"
      >
        <AppSelect
          v-model="filters.graduation_year"
          :items="graduationYears"
          label="Año de graduación"
          density="compact"
          hide-details
          clearable
          style="min-width: 180px"
          @update:model-value="() => loadDashboard(true)"
          @click:clear="clearFilters"
        />
        <VBtn
          :loading="loadingDashboard"
          color="primary"
          icon
          variant="tonal"
          size="small"
          @click="loadDashboard"
        >
          <VIcon
            icon="tabler-refresh"
            size="18"
          />
        </VBtn>
      </div>
    </div>

    <!-- DASHBOARD PARA DIRECTORES -->
    <div v-if="isDirector">

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
              class="h-100 kpi-card"
              elevation="0"
            >
              <VCardText class="pa-5">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div>
                    <p class="text-body-2 font-weight-semibold mb-0">
                      {{ kpi.name }}
                    </p>
                    <p class="text-caption text-disabled mb-0">
                      Sistema Egresys
                    </p>
                  </div>
                  <VAvatar
                    :color="getTrendColor(kpi.trend)"
                    rounded="lg"
                    size="40"
                    variant="tonal"
                  >
                    <VIcon
                      :icon="getTrendIcon(kpi.trend)"
                      size="20"
                    />
                  </VAvatar>
                </div>

                <div
                  class="text-h4 font-weight-bold mb-3"
                  :style="{ color: kpi.color }"
                >
                  {{ kpi.value }}
                </div>

                <div class="d-flex align-center justify-space-between">
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ kpi.description }}
                  </p>
                  <VChip
                    :color="getTrendColor(kpi.trend)"
                    size="x-small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    {{ kpi.trend === 'up' ? '+Subiendo' : kpi.trend === 'down' ? '-Bajando' : 'Estable' }}
                  </VChip>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Estadísticas Generales -->
        <VRow class="mb-6">
          <VCol
            cols="6"
            md="3"
          >
            <VCard
              elevation="0"
              class="h-100 stat-card"
            >
              <VCardText class="pa-5">
                <div class="d-flex align-center justify-space-between mb-3">
                  <VAvatar
                    color="primary"
                    rounded="lg"
                    size="42"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-file-text"
                      size="20"
                    />
                  </VAvatar>
                  <VChip
                    color="primary"
                    size="x-small"
                    variant="tonal"
                  >
                    Encuestas
                  </VChip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ dashboardData.general_statistics.total_surveys }}
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Total de Encuestas
                </p>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <VCard
              elevation="0"
              class="h-100 stat-card"
            >
              <VCardText class="pa-5">
                <div class="d-flex align-center justify-space-between mb-3">
                  <VAvatar
                    color="success"
                    rounded="lg"
                    size="42"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-user-check"
                      size="20"
                    />
                  </VAvatar>
                  <VChip
                    color="success"
                    size="x-small"
                    variant="tonal"
                  >
                    Graduados
                  </VChip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ dashboardData.general_statistics.total_graduates }}
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Total de Graduados
                </p>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <VCard
              elevation="0"
              class="h-100 stat-card"
            >
              <VCardText class="pa-5">
                <div class="d-flex align-center justify-space-between mb-3">
                  <VAvatar
                    color="info"
                    rounded="lg"
                    size="42"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-message-dots"
                      size="20"
                    />
                  </VAvatar>
                  <VChip
                    color="info"
                    size="x-small"
                    variant="tonal"
                  >
                    Respuestas
                  </VChip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ dashboardData.general_statistics.total_responses }}
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Total de Respuestas
                </p>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="6"
            md="3"
          >
            <VCard
              elevation="0"
              class="h-100 stat-card"
            >
              <VCardText class="pa-5">
                <div class="d-flex align-center justify-space-between mb-3">
                  <VAvatar
                    color="warning"
                    rounded="lg"
                    size="42"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-chart-bar"
                      size="20"
                    />
                  </VAvatar>
                  <VChip
                    color="warning"
                    size="x-small"
                    variant="tonal"
                  >
                    Tasa
                  </VChip>
                </div>
                <div class="text-h4 font-weight-bold mb-1">
                  {{ dashboardData.general_statistics.overall_response_rate.toFixed(1) }}%
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Tasa de Respuesta
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Estado de Encuestas -->
        <VRow class="mb-6">
          <VCol
            cols="12"
            sm="6"
          >
            <VCard
              elevation="0"
              class="stat-card"
            >
              <VCardText class="d-flex align-center pa-5">
                <VAvatar
                  color="success"
                  rounded="lg"
                  size="42"
                  variant="tonal"
                  class="me-4 flex-shrink-0"
                >
                  <VIcon
                    icon="tabler-player-play"
                    size="20"
                  />
                </VAvatar>
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{ dashboardData.general_statistics.active_surveys }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Encuestas Activas
                  </p>
                </div>
                <VSpacer />
                <VChip
                  color="success"
                  size="x-small"
                  variant="tonal"
                >
                  Activas
                </VChip>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            sm="6"
          >
            <VCard
              elevation="0"
              class="stat-card"
            >
              <VCardText class="d-flex align-center pa-5">
                <VAvatar
                  color="info"
                  rounded="lg"
                  size="42"
                  variant="tonal"
                  class="me-4 flex-shrink-0"
                >
                  <VIcon
                    icon="tabler-circle-check"
                    size="20"
                  />
                </VAvatar>
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{ dashboardData.general_statistics.completed_surveys }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Encuestas Completadas
                  </p>
                </div>
                <VSpacer />
                <VChip
                  color="info"
                  size="x-small"
                  variant="tonal"
                >
                  Completadas
                </VChip>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

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
                  <ChartRenderer
                    :chart-type="chart.chart_type"
                    :data="formatChartData(chart)"
                    :options="chart.chart_type === 'pie' ? pieChartOptions : chartOptions"
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
                to="/egresados"
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
                to="/encuestas"
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
                to="/empleadores"
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
      <VAlert
        v-if="!profileComplete"
        type="warning"
        variant="tonal"
        class="mb-4"
        prominent
      >
        <template #title>
          Completa tu perfil academico
        </template>
        Tu perfil no tiene informacion academica completa. Completa tus datos para mejorar tu visibilidad ante empleadores.
        <template #append>
          <VBtn
            color="warning"
            variant="elevated"
            to="/mi-perfil"
          >
            Completar datos
          </VBtn>
        </template>
      </VAlert>

      <VRow>
        <VCol cols="12">
          <VCard
            class="graduate-hero-card mb-6"
            elevation="4"
          >
            <VCardText class="pa-6">
              <div class="d-flex flex-column flex-lg-row justify-space-between gap-6">
                <div>
                  <p class="hero-subtitle mb-2">
                    Resumen personal
                  </p>
                  <h2 class="text-h4 font-weight-bold mb-2">
                    Hola, {{ user?.name || 'Graduado' }}
                  </h2>
                  <p class="text-body-1 mb-4">
                    {{ surveyStats.pending ? `Tienes ${surveyStats.pending} encuestas pendientes` : 'Estás al día con tus encuestas' }} y {{ activeJobsCount }} {{ activeJobsCount === 1 ? 'experiencia activa' : 'experiencias activas' }}.
                  </p>
                  <div class="d-flex flex-wrap gap-3">
                    <VBtn
                      color="white"
                      class="text-primary"
                      prepend-icon="tabler-edit"
                      to="/mi-perfil"
                    >
                      Completar mi perfil
                    </VBtn>
                    <VBtn
                      color="primary"
                      variant="tonal"
                      prepend-icon="tabler-edit"
                      to="/mis-encuestas"
                    >
                      Gestionar encuestas
                    </VBtn>
                  </div>
                </div>
                <div class="d-flex flex-wrap justify-end gap-4">
                  <div class="hero-metric">
                    <span class="text-caption">Avance en encuestas</span>
                    <strong class="text-h3">{{ surveyStats.completionRate }}%</strong>
                  </div>
                  <div class="hero-metric">
                    <span class="text-caption">Trabajos activos</span>
                    <strong class="text-h3">{{ activeJobsCount }}</strong>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow class="mb-6">
        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="dashboard-stat-card h-100">
            <VCardText class="pa-5 d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">
                  Total de encuestas
                </p>
                <h3 class="text-h4 mb-2">
                  {{ surveyStats.total }}
                </h3>
                <VProgressLinear
                  :model-value="surveyStats.completionRate"
                  color="white"
                  height="6"
                  rounded
                />
              </div>
              <VAvatar
                color="white"
                variant="tonal"
              >
                <VIcon
                  icon="tabler-forms"
                  color="primary"
                />
              </VAvatar>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="dashboard-stat-card h-100">
            <VCardText class="pa-5 d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">
                  Encuestas pendientes
                </p>
                <h3 class="text-h4 mb-0">
                  {{ surveyStats.pending }}
                </h3>
              </div>
              <VAvatar
                color="warning"
                variant="tonal"
              >
                <VIcon icon="tabler-alert-circle" />
              </VAvatar>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="dashboard-stat-card h-100">
            <VCardText class="pa-5 d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">
                  Encuestas completadas
                </p>
                <h3 class="text-h4 mb-0">
                  {{ surveyStats.completed }}
                </h3>
              </div>
              <VAvatar
                color="success"
                variant="tonal"
              >
                <VIcon icon="tabler-check" />
              </VAvatar>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard class="dashboard-stat-card h-100">
            <VCardText class="pa-5 d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">
                  Historias laborales
                </p>
                <h3 class="text-h4 mb-0">
                  {{ totalJobsCount }}
                </h3>
              </div>
              <VAvatar
                color="info"
                variant="tonal"
              >
                <VIcon icon="tabler-briefcase" />
              </VAvatar>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow class="align-stretch">
        <VCol
          cols="12"
          lg="7"
        >
          <VCard class="mb-6 h-100">
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon
                  icon="tabler-notebook"
                  class="me-2"
                />
                Mis Encuestas
              </div>
              <VChip
                color="primary"
                variant="tonal"
                size="small"
              >
                {{ pendingSurveys.length }} pendientes
              </VChip>
            </VCardTitle>
            <VCardText>
              <template v-if="surveyPreview.length">
                <VList
                  lines="three"
                  density="comfortable"
                >
                  <VListItem
                    v-for="survey in surveyPreview"
                    :key="survey.survey_id"
                  >
                    <template #prepend>
                      <VAvatar
                        color="primary"
                        variant="tonal"
                      >
                        <VIcon :icon="getSurveyTypeIcon(survey.survey_type?.name || '')" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-medium">
                      {{ survey.title }}
                    </VListItemTitle>
                    <VListItemSubtitle>
                      {{ survey.survey_type?.name }} · {{ survey.question_count }} preguntas · {{ formatReadableDate(survey.created_date) }}
                    </VListItemSubtitle>
                    <template #append>
                      <div class="d-flex flex-column align-end gap-2">
                        <VChip
                          :color="surveyCompletionColor(survey.completed)"
                          size="small"
                          variant="tonal"
                        >
                          {{ surveyCompletionLabel(survey.completed) }}
                        </VChip>
                        <VBtn
                          color="primary"
                          variant="text"
                          size="small"
                          to="/mis-encuestas"
                        >
                          {{ survey.completed ? 'Ver resultados' : 'Responder' }}
                        </VBtn>
                      </div>
                    </template>
                  </VListItem>
                </VList>
              </template>
              <div
                v-else
                class="empty-state"
              >
                <VIcon
                  icon="tabler-calendar-off"
                  size="48"
                  class="mb-3"
                />
                <p class="text-body-1">
                  No tienes encuestas asignadas por ahora.
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  Te avisaremos cuando haya nuevas evaluaciones disponibles.
                </p>
              </div>
              <div class="text-end mt-4">
                <VBtn
                  variant="text"
                  color="primary"
                  to="/mis-encuestas"
                  append-icon="tabler-arrow-right"
                >
                  Ver todas las encuestas
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="5"
        >
          <VCard class="mb-6 h-100">
            <VCardTitle class="d-flex align-center">
              <VIcon
                icon="tabler-timeline"
                class="me-2"
              />
              Mi trayectoria laboral
            </VCardTitle>
            <VCardText>
              <template v-if="jobTimeline.length">
                <VTimeline
                  density="comfortable"
                  side="end"
                >
                  <VTimelineItem
                    v-for="job in jobTimeline"
                    :key="job.jobId"
                    :dot-color="job.fechaFin ? 'primary' : 'success'"
                    fill-dot
                  >
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ job.cargo }} · {{ job.compania }}
                    </div>
                    <div class="text-caption text-medium-emphasis mb-2">
                      {{ job.modalidad }} · {{ formatJobRange(job) }}
                    </div>
                    <VChip
                      size="x-small"
                      :color="job.fechaFin ? 'primary' : 'success'"
                      variant="tonal"
                    >
                      {{ job.fechaFin ? 'Finalizado' : 'En curso' }}
                    </VChip>
                  </VTimelineItem>
                </VTimeline>
              </template>
              <div
                v-else
                class="empty-state"
              >
                <VIcon
                  icon="tabler-briefcase-off"
                  size="48"
                  class="mb-3"
                />
                <p class="text-body-1">
                  Aún no registras experiencias laborales.
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  Usa la sección "Mis Trabajos" para documentar tu crecimiento profesional.
                </p>
              </div>
              <div class="text-end mt-4">
                <VBtn
                  variant="text"
                  color="primary"
                  to="/mis-empleos"
                  append-icon="tabler-arrow-right"
                >
                  Administrar mis trabajos
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon
              icon="tabler-target"
              class="me-2"
            />
            Oportunidades recomendadas
          </div>
          <VChip
            color="info"
            variant="tonal"
            size="small"
          >
            {{ jobOfferPreview.length }} activas
          </VChip>
        </VCardTitle>
        <VCardText>
          <VRow v-if="jobOfferPreview.length">
            <VCol
              v-for="offer in jobOfferPreview"
              :key="offer.jobOfferId"
              cols="12"
              md="4"
            >
              <VCard class="recommended-offer-card h-100" variant="flat">
                <VCardText>
                  <div class="d-flex align-center justify-space-between mb-3">
                    <h3 class="text-h6 mb-0">
                      {{ offer.titulo }}
                    </h3>
                    <VChip
                      size="x-small"
                      :color="offer.estado === '1' ? 'success' : 'grey'
                      "
                      variant="tonal"
                    >
                      {{ offer.estado === '1' ? 'Activa' : 'Inactiva' }}
                    </VChip>
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    {{ summarize(offer.descripcion) }}
                  </p>
                  <VBtn
                    color="info"
                    variant="outlined"
                    block
                    @click="openJobOffer(offer.link)"
                  >
                    Postular
                  </VBtn>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
          <div
            v-else
            class="empty-state"
          >
            <VIcon
              icon="tabler-search"
              size="48"
              class="mb-3"
            />
            <p class="text-body-1">
              No hay ofertas recomendadas por ahora.
            </p>
            <p class="text-body-2 text-medium-emphasis">
              Vuelve pronto para descubrir nuevas oportunidades.
            </p>
          </div>
        </VCardText>
      </VCard>
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

/* KPI + Stat cards */
.kpi-card,
.stat-card {
  border-radius: 12px !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.kpi-card:hover,
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.text-truncate-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.graduate-hero-card {
  border-radius: 1.5rem;
  overflow: hidden;
}

.graduate-hero-card .hero-subtitle {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.graduate-hero-card .hero-metric {
  min-width: 150px;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  text-align: right;
}

.dashboard-stat-card {
  border-radius: 1.25rem;
  border: 1px solid transparent;
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  border: 1px dashed transparent;
  border-radius: 1rem;
}

.recommended-offer-card {
  border-radius: 1.25rem;
  border: 1px solid transparent;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.recommended-offer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

:deep(.v-theme--dark) .graduate-hero-card {
  background: linear-gradient(135deg, color-mix(in srgb, var(--v-theme-primary) 65%, #000) 0%, color-mix(in srgb, var(--v-theme-surface) 85%, #000) 100%);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.v-theme--light) .graduate-hero-card {
  background: linear-gradient(135deg, color-mix(in srgb, var(--v-theme-primary) 25%, #fff) 0%, color-mix(in srgb, var(--v-theme-surface) 90%, #fff) 100%);
  color: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

:deep(.v-theme--dark) .graduate-hero-card .hero-subtitle {
  color: rgba(255, 255, 255, 0.75);
}

:deep(.v-theme--light) .graduate-hero-card .hero-subtitle {
  color: rgba(15, 23, 42, 0.65);
}

:deep(.v-theme--dark) .graduate-hero-card .hero-metric {
  background-color: color-mix(in srgb, var(--v-theme-primary) 25%, #000);
  color: rgba(255, 255, 255, 0.95);
}

:deep(.v-theme--light) .graduate-hero-card .hero-metric {
  background-color: color-mix(in srgb, var(--v-theme-primary) 10%, #fff);
  color: rgba(15, 23, 42, 0.9);
}

:deep(.v-theme--dark) .dashboard-stat-card {
  background: color-mix(in srgb, var(--v-theme-surface) 90%, #000);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

:deep(.v-theme--light) .dashboard-stat-card {
  background: color-mix(in srgb, var(--v-theme-surface) 92%, #fff);
  border-color: rgba(79, 70, 229, 0.12);
}

:deep(.v-theme--dark) .empty-state {
  border-color: rgba(255, 255, 255, 0.12);
  background: color-mix(in srgb, var(--v-theme-surface) 85%, #000);
  color: rgba(255, 255, 255, 0.7);
}

:deep(.v-theme--light) .empty-state {
  border-color: rgba(79, 70, 229, 0.2);
  background: color-mix(in srgb, var(--v-theme-surface) 98%, #fff);
  color: rgba(15, 23, 42, 0.6);
}

:deep(.v-theme--dark) .recommended-offer-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: color-mix(in srgb, var(--v-theme-surface) 85%, #000);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

:deep(.v-theme--light) .recommended-offer-card {
  border-color: rgba(99, 102, 241, 0.18);
  background: color-mix(in srgb, var(--v-theme-surface) 98%, #fff);
}
</style>

