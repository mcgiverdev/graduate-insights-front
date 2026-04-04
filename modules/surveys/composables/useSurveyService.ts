import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import type {
  CreateSurveyRequest,
  Survey,
  SurveyListResponse,
  SurveyResponse,
  SurveyTypesResponse,
} from '../types'

const surveys = ref<Survey[]>([])
const totalSurveys = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

const currentSurvey = ref<Survey | null>(null)
const previewMode = ref(false)

async function fetchSurveys(
  page: number = 1,
  size: number = 10,
  filters: {
    searchQuery?: string
    surveyType?: string
    status?: string
  } = {},
) {
  loadingList.value = true

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    if (filters.searchQuery)
      params.append('search', filters.searchQuery)

    if (filters.surveyType)
      params.append('survey_type', filters.surveyType)

    if (filters.status)
      params.append('status', filters.status)

    const response = await useApi<SurveyListResponse>(
      `/graduate-insights/v1/api/survey?${params.toString()}`,
      { method: 'GET' },
    )

    if (Array.isArray(response.data.data)) {
      surveys.value = response.data.data
      totalSurveys.value = response.data.paginate?.totalElements || 0
    }
    else {
      console.warn('La respuesta no tiene el formato esperado:', response.data)
      surveys.value = []
      totalSurveys.value = 0
    }
  }
  catch (error) {
    console.error('Error fetching surveys:', error)
    surveys.value = []
    totalSurveys.value = 0
  }
  finally {
    loadingList.value = false
  }
}

async function fetchSurveyTypes() {
  try {
    const response = await useApi<SurveyTypesResponse>(
      '/graduate-insights/v1/api/survey-types/list',
      { method: 'GET' },
    )

    return {
      success: true,
      data: response.data.data,
    }
  }
  catch (error) {
    console.error('Error fetching survey types:', error)

    return {
      success: false,
      data: [],
      error,
    }
  }
}

async function getSurvey(id: number) {
  loadingForm.value = true

  try {
    const response = await useApi<{ data: Survey }>(
      `/graduate-insights/v1/api/survey/${id}`,
      { method: 'GET' },
    )

    return response.data.data
  }
  catch (error) {
    console.error('Error getting survey:', error)

    return null
  }
  finally {
    loadingForm.value = false
  }
}

async function createSurvey(survey: CreateSurveyRequest) {
  loadingSave.value = true

  try {
    const response = await useApi<SurveyResponse>(
      '/graduate-insights/v1/api/survey',
      {
        method: 'POST',
        body: survey,
      },
    )

    return {
      success: true,
      message: 'Encuesta creada exitosamente',
      data: response.data.data,
    }
  }
  catch (error: any) {
    const errors = error.data?.errors
    const message = errors
      ? Object.values(errors).join('. ')
      : (error.data?.message || 'Error al crear la encuesta')

    return {
      success: false,
      message,
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function updateSurvey(id: number, survey: CreateSurveyRequest) {
  loadingSave.value = true

  try {
    await useApi<SurveyResponse>(
      `/graduate-insights/v1/api/survey/${id}`,
      {
        method: 'PUT',
        body: survey,
      },
    )

    return {
      success: true,
      message: 'Encuesta actualizada exitosamente',
      data: null,
    }
  }
  catch (error: any) {
    const errors = error.data?.errors
    const message = errors
      ? Object.values(errors).join('. ')
      : (error.data?.message || 'Error al actualizar la encuesta')

    return {
      success: false,
      message,
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function deleteSurvey(id: number) {
  loadingSave.value = true

  try {
    await useApi(
      `/graduate-insights/v1/api/survey/${id}`,
      { method: 'DELETE' },
    )

    return {
      success: true,
      message: 'Encuesta eliminada exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al eliminar la encuesta',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

function setCurrentSurvey(survey: Survey | null) {
  currentSurvey.value = survey
}

function togglePreviewMode() {
  previewMode.value = !previewMode.value
}

function resetSurveyForm() {
  currentSurvey.value = null
  previewMode.value = false
}

export function useSurveyService() {
  return {
    surveys,
    totalSurveys,
    loadingList,
    loadingForm,
    loadingSave,
    currentSurvey,
    previewMode,
    fetchSurveys,
    fetchSurveyTypes,
    getSurvey,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    setCurrentSurvey,
    togglePreviewMode,
    resetSurveyForm,
  }
}
