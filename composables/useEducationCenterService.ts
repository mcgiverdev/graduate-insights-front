import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface EducationCenter {
  education_center_id: number
  nombre: string
  direccion: string
  estado: string
}

interface ApiResponse<T> {
  data: T[]
  paginate: {
    totalElements: number
    totalPages: number
    currentPage: number
  }
}

const educationCenters = ref<EducationCenter[]>([])
const totalEducationCenters = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

function mapBackendEducationCenter(e: any): EducationCenter {
  return {
    education_center_id: e.education_center_id,
    nombre: e.nombre,
    direccion: e.direccion,
    estado: e.estado,
  }
}

async function fetchEducationCenters(page: number, size: number) {
  loadingList.value = true

  const realSize = size === -1 ? 1000 : size
  try {
    const response = await useApi<ApiResponse<EducationCenter>>(
      `/graduate-insights/v1/api/education_center?page=${page}&size=${realSize}`,
      { method: 'GET' },
    )

    if (response && Array.isArray(response.data)) {
      educationCenters.value = response.data.map(mapBackendEducationCenter)
      totalEducationCenters.value = response.paginate?.totalElements || 0
    }
    else {
      educationCenters.value = []
      totalEducationCenters.value = 0
    }
  }
  catch (error) {
    educationCenters.value = []
    totalEducationCenters.value = 0
  }
  finally {
    loadingList.value = false
  }
}

async function getEducationCenter(id: number) {
  loadingForm.value = true
  try {
    const response = await useApi<{ data: EducationCenter }>(
      `/graduate-insights/v1/api/education_center/${id}`,
      { method: 'GET' },
    )

    return response.data
  }
  catch (error) {
    return null
  }
  finally {
    loadingForm.value = false
  }
}

async function addEducationCenter(center: any) {
  loadingSave.value = true
  try {
    const response = await useApi<{ data: EducationCenter }>(
      '/graduate-insights/v1/api/education_center',
      {
        method: 'POST',
        body: center,
      },
    )

    return {
      success: true,
      message: 'Centro educativo creado exitosamente',
      data: response.data,
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al crear el centro educativo',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function updateEducationCenter(id: number, center: any) {
  loadingSave.value = true
  try {
    await useApi<{ data: EducationCenter }>(
      `/graduate-insights/v1/api/education_center/${id}`,
      {
        method: 'PUT',
        body: center,
      },
    )

    return {
      success: true,
      message: 'Centro educativo actualizado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al actualizar el centro educativo',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function deleteEducationCenter(id: number) {
  loadingSave.value = true
  try {
    await useApi<{ data: EducationCenter }>(
      `/graduate-insights/v1/api/education_center/${id}`,
      {
        method: 'DELETE',
      },
    )

    return {
      success: true,
      message: 'Centro educativo eliminado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al eliminar el centro educativo',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

export function useEducationCenterService() {
  return {
    educationCenters,
    totalEducationCenters,
    loadingList,
    loadingForm,
    loadingSave,
    fetchEducationCenters,
    getEducationCenter,
    addEducationCenter,
    updateEducationCenter,
    deleteEducationCenter,
  }
}
