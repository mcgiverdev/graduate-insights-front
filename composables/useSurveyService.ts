import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import type {
  CreateSurveyRequest,
  Survey,
  SurveyListResponse,
  SurveyResponse,
} from '@/modules/surveys/types'

const surveys = ref<Survey[]>([])
const totalSurveys = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

// Estado para el formulario de creación/edición
const currentSurvey = ref<Survey | null>(null)
const previewMode = ref(false)

async function fetchSurveys(page: number = 1, size: number = 10) {
  loadingList.value = true

  try {
    const response = await useApi<SurveyListResponse>(
      `/graduate-insights/v1/api/survey?page=${page}&size=${size}`,
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
    return {
      success: false,
      message: error.data?.message || 'Error al crear la encuesta',
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
    console.error('Error updating survey:', error)

    return {
      success: false,
      message: error.data?.message || 'Error al actualizar la encuesta',
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

// Funciones para manejar el estado del formulario
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
    // Estado
    surveys,
    totalSurveys,
    loadingList,
    loadingForm,
    loadingSave,
    currentSurvey,
    previewMode,

    // Métodos CRUD
    fetchSurveys,
    getSurvey,
    createSurvey,
    updateSurvey,
    deleteSurvey,

    // Métodos de estado
    setCurrentSurvey,
    togglePreviewMode,
    resetSurveyForm,
  }
}
