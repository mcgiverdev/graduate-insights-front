import { computed, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyStatisticsService } from './useSurveyStatisticsService'

const DEFAULT_GRADUATION_YEARS = [
  { title: 'Todos los años', value: null },
  { title: '2024', value: 2024 },
  { title: '2023', value: 2023 },
  { title: '2022', value: 2022 },
  { title: '2021', value: 2021 },
  { title: '2020', value: 2020 },
]

export const useSurveyStatisticsDashboard = () => {
  const { dashboardData, loadingDashboard, fetchDashboard } = useSurveyStatisticsService()
  const { showSnackbar } = useSnackbar()

  const filters = ref({
    graduation_year: undefined as number | undefined,
  })

  const graduationYears = ref([...DEFAULT_GRADUATION_YEARS])

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

  const formatChartData = (chart: any) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'tabler-trending-up'
      case 'down': return 'tabler-trending-down'
      default: return 'tabler-trending-up'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success'
      case 'down': return 'error'
      default: return 'grey'
    }
  }

  const getSurveyStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'COMPLETED': return 'info'
      case 'PAUSED': return 'warning'
      case 'CLOSED': return 'error'
      case 'DRAFT': return 'grey'
      default: return 'grey'
    }
  }

  const getSurveyTypeIcon = (surveyType: string) => {
    switch (surveyType) {
      case 'EMPLOYMENT': return 'tabler-briefcase'
      case 'ACADEMIC': return 'tabler-school'
      case 'SATISFACTION': return 'tabler-heart'
      case 'ENTREPRENEURSHIP': return 'tabler-rocket'
      default: return 'tabler-file-text'
    }
  }

  const loadDashboard = async (useFilters = true) => {
    const filtersToApply = useFilters ? filters.value : {}
    const result = await fetchDashboard(filtersToApply)

    if (!result.success) {
      showSnackbar({
        text: result.message || 'Error al cargar el dashboard',
        color: 'error',
      })
    }
  }

  const clearFilters = async () => {
    filters.value = {
      graduation_year: undefined,
    }

    await loadDashboard(false)
  }

  return {
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
  }
}
