import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import type {
  GraduateSurveyDetail,
  GraduateSurveyDetailResponse,
  GraduateSurveyListItem,
  GraduateSurveyListResponse,
  SurveySubmissionRequest,
  SurveySubmissionResponse,
} from '@/modules/graduate-surveys/types'

// Estado global
const surveys = ref<GraduateSurveyListItem[]>([])
const currentSurvey = ref<GraduateSurveyDetail | null>(null)
const loadingList = ref(false)
const loadingDetail = ref(false)
const loadingSubmit = ref(false)

export const useGraduateSurveyService = () => {
  // Obtener lista de encuestas del graduado
  const fetchSurveys = async () => {
    loadingList.value = true
    try {
      const response = await useApi<GraduateSurveyListResponse>(
        '/graduate-insights/v1/api/graduate-surveys',
        { method: 'GET' },
      )

      if (response.data?.success) {
        surveys.value = response.data.data

        return { success: true, data: response.data.data }
      }

      return { success: false, message: response.data?.message || 'Error al obtener encuestas' }
    }
    catch (error: any) {
      console.error('Error fetching graduate surveys:', error)
      surveys.value = []

      return { success: false, message: 'Error al conectar con el servidor' }
    }
    finally {
      loadingList.value = false
    }
  }

  // Obtener detalle de una encuesta específica
  const fetchSurveyDetail = async (surveyId: number) => {
    loadingDetail.value = true
    try {
      const response = await useApi<GraduateSurveyDetailResponse>(
        `/graduate-insights/v1/api/graduate-surveys/${surveyId}`,
        { method: 'GET' },
      )

      if (response.data?.success) {
        currentSurvey.value = response.data.data

        return { success: true, data: response.data.data }
      }

      return { success: false, message: response.data?.message || 'Error al obtener detalle de encuesta' }
    }
    catch (error: any) {
      console.error('Error fetching survey detail:', error)
      currentSurvey.value = null

      return { success: false, message: 'Error al conectar con el servidor' }
    }
    finally {
      loadingDetail.value = false
    }
  }

  // Enviar respuestas de encuesta
  const submitSurveyResponses = async (submissionData: SurveySubmissionRequest) => {
    loadingSubmit.value = true
    try {
      const response = await useApi<SurveySubmissionResponse>(
        '/graduate-insights/v1/api/survey-responses',
        {
          method: 'POST',
          body: submissionData,
        },
      )

      if (response.status === 201) {
        // Actualizar el estado de la encuesta como completada
        if (currentSurvey.value && currentSurvey.value.survey_id === submissionData.survey_id) {
          currentSurvey.value.completed = true
          currentSurvey.value.submitted_at = new Date().toISOString()
        }

        // Actualizar en la lista también
        const surveyIndex = surveys.value.findIndex(s => s.survey_id === submissionData.survey_id)
        if (surveyIndex !== -1)
          surveys.value[surveyIndex].completed = true

        return { success: true, message: 'Encuesta enviada exitosamente' }
      }

      return { success: false, message: 'Error al enviar encuesta' }
    }
    catch (error: any) {
      console.error('Error submitting survey:', error)

      return { success: false, message: 'Error al conectar con el servidor' }
    }
    finally {
      loadingSubmit.value = false
    }
  }

  // Limpiar survey actual
  const clearCurrentSurvey = () => {
    currentSurvey.value = null
  }

  // Obtener encuestas completadas
  const getCompletedSurveys = () => {
    return surveys.value.filter(survey => survey.completed)
  }

  // Obtener encuestas pendientes
  const getPendingSurveys = () => {
    return surveys.value.filter(survey => !survey.completed)
  }

  // Obtener estadísticas
  const getSurveyStats = () => {
    const total = surveys.value.length
    const completed = getCompletedSurveys().length
    const pending = getPendingSurveys().length

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  // Verificar si una encuesta está completada
  const isSurveyCompleted = (surveyId: number) => {
    const survey = surveys.value.find(s => s.survey_id === surveyId)

    return survey?.completed || false
  }

  // Buscar encuestas por tipo
  const getSurveysByType = (surveyType: string) => {
    return surveys.value.filter(survey => survey.survey_type === surveyType)
  }

  return {
    // Estado
    surveys: readonly(surveys),
    currentSurvey: readonly(currentSurvey),
    loadingList: readonly(loadingList),
    loadingDetail: readonly(loadingDetail),
    loadingSubmit: readonly(loadingSubmit),

    // Métodos principales
    fetchSurveys,
    fetchSurveyDetail,
    submitSurveyResponses,
    clearCurrentSurvey,

    // Métodos de utilidad
    getCompletedSurveys,
    getPendingSurveys,
    getSurveyStats,
    isSurveyCompleted,
    getSurveysByType,
  }
}
