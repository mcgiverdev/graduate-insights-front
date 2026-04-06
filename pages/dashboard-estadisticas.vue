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
import { onMounted } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { StatisticsButton, useSurveyStatisticsDashboard } from '@/src/features/survey-statistics'

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
  title: 'Dashboard de Estadísticas',
  requiresAuth: true,
})

// Head configuration
useHead({
  title: 'Dashboard de Estadísticas - Graduate Insights',
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
  loadDashboard,
  clearFilters,
} = useSurveyStatisticsDashboard()

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div>
    <!-- Header mejorado -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">
          <VIcon
            icon="tabler-dashboard"
            class="me-3"
            size="32"
          />
          Dashboard de Estadísticas
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Vista general de todas las encuestas y estadísticas del sistema
        </p>
      </div>
      <VBtn
        :loading="loadingDashboard"
        color="primary"
        prepend-icon="tabler-refresh"
        @click="loadDashboard"
      >
        Actualizar
      </VBtn>
    </div>

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
              @update:model-value="loadDashboard"
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

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData">
      <!-- KPI Indicators mejorados -->
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

    <!-- Empty State -->
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
