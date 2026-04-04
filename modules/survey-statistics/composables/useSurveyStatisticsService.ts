import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface SurveyStatistics {
  survey_id: number
  survey_title: string
  survey_description: string
  survey_type: {
    id: number
    name: string
    description: string
    active: boolean
  }
  status: string
  start_date: string
  end_date: string
  data_generated_at: string
  total_graduates: number
  total_responses: number
  pending_responses: number
  response_rate: number
  completion_rate: number
  total_questions: number
  responses_by_location: Record<string, number>
  responses_by_industry: Record<string, number>
  responses_by_gender: Record<string, number>
  responses_by_employment_status: Record<string, number>
  responses_by_month: Record<string, number>
  question_statistics: QuestionStatistic[]
}

export interface QuestionStatistic {
  question_id: number
  question_text: string
  type: string
  required: boolean
  total_responses: number
  response_rate: number
  average?: number
  median?: number
  mode?: number
  standard_deviation?: number
  min?: number
  max?: number
  option_counts: Record<string, number>
  percentages: Record<string, number>
  recommended_chart_type: string
  average_response_length?: number
  sample_responses?: string[]
}

export interface SurveyStatisticsResponse {
  success: boolean
  data: SurveyStatistics
}

// Nuevos tipos para las APIs adicionales

export interface ChartConfiguration {
  responsive: boolean
  maintain_aspect_ratio: boolean
  legend?: {
    display: boolean
    position: string
  }
  tooltip?: {
    enabled: boolean
    mode: string
  }
  axes?: {
    x_axis?: {
      type: string
      title: string
    }
    y_axis?: {
      type: string
      title: string
    }
  }
}

export interface ChartDataset {
  label: string
  data: number[]
  background_colors?: string[]
  border_color?: string
  background_color?: string
  border_width?: number
}

export interface QuestionChartData {
  chart_type: string
  title: string
  labels: string[]
  datasets: ChartDataset[]
  configuration: ChartConfiguration
  total_responses: number
  metadata: {
    question_type: string
    response_rate: number
  }
}

export interface QuestionChartResponse {
  success: boolean
  data: QuestionChartData
}

export interface DashboardKPI {
  name: string
  value: string
  unit: string
  trend: 'up' | 'down' | 'stable'
  change_percentage: number
  description: string
  color: string
}

export interface DashboardChart {
  chart_type: string
  title: string
  labels: string[]
  datasets: ChartDataset[]
  total_responses?: number
}

export interface Survey {
  id: number
  title: string
  description: string
  survey_type: {
    id: number
    name: string
    description: string
    active: boolean
  }
  status: string
  start_date: string
  end_date: string
  questions: Array<{
    id: number
    question_text: string
    question_type: string
    required: boolean
    options: Array<{
      id: number
      option_text: string
      order_number: number
    }>
  }>
}

export interface DashboardStatistics {
  general_statistics: {
    total_surveys: number
    total_graduates: number
    total_responses: number
    overall_response_rate: number
    active_surveys: number
    completed_surveys: number
    responses_by_graduation_year: Record<string, number>
  }
  dashboard_charts: DashboardChart[]
  recent_surveys: Survey[]
  kpi_indicators: DashboardKPI[]
  applied_filters: {
    graduation_year?: number
  }
}

export interface DashboardResponse {
  success: boolean
  data: DashboardStatistics
}

export interface SurveyComparison {
  survey_id: number
  survey_title: string
  total_responses: number
  response_rate: number
  completion_rate: number
  status: string
}

export interface SurveyComparisonResponse {
  success: boolean
  data: SurveyComparison[]
}

export interface TrendsData {
  chart_type: string
  title: string
  labels: string[]
  datasets: ChartDataset[]
  configuration: ChartConfiguration
  total_responses: number
  metadata: {
    period: string
    growth_rate: number
  }
}

export interface TrendsResponse {
  success: boolean
  data: TrendsData
}

export interface DemographicsData {
  chart_type: string
  title: string
  labels: string[]
  datasets: ChartDataset[]
  configuration: ChartConfiguration
  total_responses: number
  metadata: {
    demographic_type: string
    most_common: string
  }
}

export interface DemographicsResponse {
  success: boolean
  data: DemographicsData
}

const statistics = ref<SurveyStatistics | null>(null)
const dashboardData = ref<DashboardStatistics | null>(null)
const questionChart = ref<QuestionChartData | null>(null)
const trendsData = ref<TrendsData | null>(null)
const demographicsData = ref<DemographicsData | null>(null)
const surveyComparisons = ref<SurveyComparison[]>([])

const loadingStatistics = ref(false)
const loadingDashboard = ref(false)
const loadingQuestionChart = ref(false)
const loadingTrends = ref(false)
const loadingDemographics = ref(false)
const loadingComparisons = ref(false)
const loadingExport = ref(false)

async function fetchSurveyStatistics(surveyId: number) {
  loadingStatistics.value = true

  try {
    const response = await useApi<SurveyStatisticsResponse>(
      `/graduate-insights/v1/api/survey-statistics/${surveyId}`,
      { method: 'GET' },
    )

    if (response.data.success) {
      statistics.value = response.data.data

      return {
        success: true,
        data: response.data.data,
      }
    }
    else {
      console.error('Error en la respuesta del servidor:', response.data)

      return {
        success: false,
        message: 'Error al obtener las estadísticas de la encuesta',
      }
    }
  }
  catch (error: any) {
    console.error('Error fetching survey statistics:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al obtener las estadísticas de la encuesta',
      error: error.data || error,
    }
  }
  finally {
    loadingStatistics.value = false
  }
}

async function fetchQuestionChart(surveyId: number, questionId: number, chartType: string = 'pie') {
  loadingQuestionChart.value = true

  try {
    const response = await useApi<QuestionChartResponse>(
      `/graduate-insights/v1/api/survey-statistics/${surveyId}/question/${questionId}/chart?chartType=${chartType}`,
      { method: 'GET' },
    )

    if (response.data.success) {
      questionChart.value = response.data.data

      return {
        success: true,
        data: response.data.data,
      }
    }
    else {
      return {
        success: false,
        message: 'Error al obtener el gráfico de la pregunta',
      }
    }
  }
  catch (error: any) {
    console.error('Error fetching question chart:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al obtener el gráfico de la pregunta',
      error: error.data || error,
    }
  }
  finally {
    loadingQuestionChart.value = false
  }
}

async function fetchDashboard(filters: { graduation_year?: number } = {}) {
  loadingDashboard.value = true

  try {
    const params = new URLSearchParams()
    if (filters.graduation_year)
      params.append('graduation_year', filters.graduation_year.toString())

    const response = await useApi<DashboardResponse>(
      `/graduate-insights/v1/api/survey-statistics/dashboard?${params.toString()}`,
      { method: 'GET' },
    )

    if (response.data.success) {
      dashboardData.value = response.data.data

      return {
        success: true,
        data: response.data.data,
      }
    }
    else {
      return {
        success: false,
        message: 'Error al obtener los datos del dashboard',
      }
    }
  }
  catch (error: any) {
    console.error('Error fetching dashboard:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al obtener los datos del dashboard',
      error: error.data || error,
    }
  }
  finally {
    loadingDashboard.value = false
  }
}

async function fetchSurveyComparisons(surveyIds: number[] = []) {
  loadingComparisons.value = true

  try {
    const params = surveyIds.length > 0 ? `?survey_ids=${surveyIds.join(',')}` : ''

    const response = await useApi<SurveyComparisonResponse>(
      `/graduate-insights/v1/api/survey-statistics/comparisons${params}`,
      { method: 'GET' },
    )

    if (response.data.success) {
      surveyComparisons.value = response.data.data

      return {
        success: true,
        data: response.data.data,
      }
    }
    else {
      return {
        success: false,
        message: 'Error al obtener las comparaciones de encuestas',
      }
    }
  }
  catch (error: any) {
    console.error('Error fetching survey comparisons:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al obtener las comparaciones de encuestas',
      error: error.data || error,
    }
  }
  finally {
    loadingComparisons.value = false
  }
}

async function fetchTrends(surveyId: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  loadingTrends.value = true

  try {
    const response = await useApi<TrendsResponse>(
      `/graduate-insights/v1/api/survey-statistics/${surveyId}/trends?period=${period}`,
      { method: 'GET' },
    )

    if (response.data.success) {
      trendsData.value = response.data.data

      return {
        success: true,
        data: response.data.data,
      }
    }
    else {
      return {
        success: false,
        message: 'Error al obtener las tendencias',
      }
    }
  }
  catch (error: any) {
    console.error('Error fetching trends:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al obtener las tendencias',
      error: error.data || error,
    }
  }
  finally {
    loadingTrends.value = false
  }
}

async function fetchDemographics(surveyId: number, demographic: 'gender' | 'age' | 'location' | 'industry' = 'gender') {
  loadingDemographics.value = true

  try {
    const response = await useApi<DemographicsResponse>(
      `/graduate-insights/v1/api/survey-statistics/${surveyId}/demographics?demographic=${demographic}`,
      { method: 'GET' },
    )

    if (response.data.success) {
      demographicsData.value = response.data.data

      return {
        success: true,
        data: response.data.data,
      }
    }
    else {
      return {
        success: false,
        message: 'Error al obtener los datos demográficos',
      }
    }
  }
  catch (error: any) {
    console.error('Error fetching demographics:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al obtener los datos demográficos',
      error: error.data || error,
    }
  }
  finally {
    loadingDemographics.value = false
  }
}

async function exportSurveyData(surveyId: number, format: 'csv' | 'excel' | 'pdf' = 'csv') {
  loadingExport.value = true

  try {
    const response = await useApi<Blob>(
      `/graduate-insights/v1/api/survey-statistics/${surveyId}/export?format=${format}`,
      {
        method: 'GET',
        responseType: 'blob',
      },
    )

    const ext = format === 'excel' ? 'xlsx' : format
    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    }
    const blob = new Blob([response.data], { type: mimeTypes[format] || 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte_encuesta_${surveyId}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return {
      success: true,
      message: `Reporte ${ext.toUpperCase()} descargado correctamente`,
    }
  }
  catch (error: any) {
    console.error('Error exporting survey data:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al exportar los datos',
      error: error.data || error,
    }
  }
  finally {
    loadingExport.value = false
  }
}

async function exportGeneralReport(format: 'csv' | 'excel' | 'pdf' = 'csv') {
  loadingExport.value = true

  try {
    const response = await useApi<Blob>(
      `/graduate-insights/v1/api/survey-statistics/export/general?format=${format}`,
      { method: 'GET', responseType: 'blob' },
    )

    const ext = format === 'excel' ? 'xlsx' : format
    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    }
    const blob = new Blob([response.data], { type: mimeTypes[format] || 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte_general_encuestas.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, message: `Reporte general ${ext.toUpperCase()} descargado correctamente` }
  }
  catch (error: any) {
    console.error('Error exporting general report:', error)
    return { success: false, message: error.data?.message || 'Error al exportar el reporte general', error: error.data || error }
  }
  finally {
    loadingExport.value = false
  }
}

function clearStatistics() {
  statistics.value = null
}

function clearDashboard() {
  dashboardData.value = null
}

function clearAll() {
  statistics.value = null
  dashboardData.value = null
  questionChart.value = null
  trendsData.value = null
  demographicsData.value = null
  surveyComparisons.value = []
}

export function useSurveyStatisticsService() {
  return {
    // Estado
    statistics,
    dashboardData,
    questionChart,
    trendsData,
    demographicsData,
    surveyComparisons,

    // Estados de carga
    loadingStatistics,
    loadingDashboard,
    loadingQuestionChart,
    loadingTrends,
    loadingDemographics,
    loadingComparisons,
    loadingExport,

    // Métodos
    fetchSurveyStatistics,
    fetchQuestionChart,
    fetchDashboard,
    fetchSurveyComparisons,
    fetchTrends,
    fetchDemographics,
    exportSurveyData,
    exportGeneralReport,
    clearStatistics,
    clearDashboard,
    clearAll,
  }
}
