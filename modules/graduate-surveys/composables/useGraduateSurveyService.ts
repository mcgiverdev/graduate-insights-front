import { readonly, ref } from 'vue'
import type {
  GraduateSurveyDetail,
  GraduateSurveyDetailResponse,
  GraduateSurveyListItem,
  GraduateSurveyListResponse,
  GraduateSurveyQuestion,
  SurveyQuestionResponse,
  SurveySubmissionRequest,
  SurveySubmissionResponse,
} from '../types'
import { useApi } from '@/composables/useApi'

const surveys = ref<GraduateSurveyListItem[]>([])
const currentSurvey = ref<GraduateSurveyDetail | null>(null)
const loadingList = ref(false)
const loadingDetail = ref(false)
const loadingSubmit = ref(false)

export const useGraduateSurveyService = () => {
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
        if (currentSurvey.value?.survey_id === submissionData.survey_id) {
          currentSurvey.value.completed = true
          currentSurvey.value.submitted_at = new Date().toISOString()
        }

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

  const clearCurrentSurvey = () => {
    currentSurvey.value = null
  }

  const getCompletedSurveys = () => {
    return surveys.value.filter(survey => survey.completed)
  }

  const getPendingSurveys = () => {
    return surveys.value.filter(survey => !survey.completed && survey.status !== 'CLOSED')
  }

  const getClosedSurveys = () => {
    return surveys.value.filter(survey => !survey.completed && survey.status === 'CLOSED')
  }

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

  const isSurveyCompleted = (surveyId: number) => {
    const survey = surveys.value.find(s => s.survey_id === surveyId)

    return survey?.completed || false
  }

  const getSurveysByType = (surveyType: string) => {
    return surveys.value.filter(survey => survey.survey_type === surveyType)
  }

  const buildResponsesFromAnswers = (
    answers: Record<number, any>,
    questions: GraduateSurveyQuestion[],
  ): SurveyQuestionResponse[] => {
    return questions
      .filter(q => {
        const answer = answers[q.question_id]

        return answer !== undefined && answer !== null && answer !== ''
      })
      .map(q => {
        const answer = answers[q.question_id]
        const response: SurveyQuestionResponse = { question_id: q.question_id }

        if (q.question_type === 'YES_NO')
          response.text_response = String(answer)
        else if (q.question_type === 'SCALE') {
          if (q.options && q.options.length > 0)
            response.selected_option_ids = answer ? [answer] : []
          else
            response.text_response = String(answer)
        }
        else if (q.question_type === 'SINGLE_CHOICE')
          response.selected_option_ids = answer ? [answer] : []
        else if (q.question_type === 'MULTIPLE_CHOICE')
          response.selected_option_ids = Array.isArray(answer) ? answer : []
        else if (q.question_type === 'NUMBER')
          response.number_response = Number(answer)
        else
          response.text_response = String(answer)

        return response
      })
  }

  const saveDraft = async (
    surveyId: number,
    answers: Record<number, any>,
    questions: GraduateSurveyQuestion[],
  ) => {
    const responses = buildResponsesFromAnswers(answers, questions)

    await useApi('/graduate-insights/v1/api/survey-responses/draft', {
      method: 'POST',
      body: { survey_id: surveyId, responses },
    })
  }

  return {
    surveys: readonly(surveys),
    currentSurvey: readonly(currentSurvey),
    loadingList: readonly(loadingList),
    loadingDetail: readonly(loadingDetail),
    loadingSubmit: readonly(loadingSubmit),
    fetchSurveys,
    fetchSurveyDetail,
    submitSurveyResponses,
    clearCurrentSurvey,
    getCompletedSurveys,
    getPendingSurveys,
    getSurveyStats,
    isSurveyCompleted,
    getSurveysByType,
    buildResponsesFromAnswers,
    saveDraft,
    getClosedSurveys,
  }
}
