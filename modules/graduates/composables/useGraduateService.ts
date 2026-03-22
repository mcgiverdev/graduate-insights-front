import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface GraduateLegacy {
  graduate_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: string
  correo: string
  estado: string
  dni: string
  celular: string
  fecha_inicio: string
  fecha_fin: string
  cv: string
  contrasena?: string
}

interface ApiResponse<T> {
  data: T[]
  paginate: {
    totalElements: number
    totalPages: number
    currentPage: number
  }
}

const graduates = ref<GraduateLegacy[]>([])
const totalGraduates = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

function mapBackendGraduate(g: any): GraduateLegacy {
  return {
    graduate_id: g.graduate_id,
    user_id: g.user_id,
    nombres: g.nombres,
    apellidos: g.apellidos,
    fecha_nacimiento: g.fecha_nacimiento,
    genero: g.genero,
    correo: g.correo,
    estado: g.estado,
    dni: g.dni,
    celular: g.celular,
    fecha_inicio: g.fecha_inicio,
    fecha_fin: g.fecha_fin,
    cv: g.cv,
    contrasena: g.contrasena,
  }
}

async function fetchGraduates(page: number, size: number) {
  loadingList.value = true

  const realSize = size === -1 ? 1000 : size

  try {
    const response = await useApi<ApiResponse<GraduateLegacy>>(
      `/graduate-insights/v1/api/graduate?page=${page}&size=${realSize}`,
      { method: 'GET' },
    )

    if (response && Array.isArray(response.data)) {
      graduates.value = response.data.map(mapBackendGraduate)
      totalGraduates.value = response.paginate?.totalElements || 0
    }
    else {
      graduates.value = []
      totalGraduates.value = 0
    }
  }
  catch {
    graduates.value = []
    totalGraduates.value = 0
  }
  finally {
    loadingList.value = false
  }
}

async function getGraduate(id: number) {
  loadingForm.value = true

  try {
    const response = await useApi<{ data: GraduateLegacy }>(
      `/graduate-insights/v1/api/graduate/${id}`,
      { method: 'GET' },
    )

    return response.data
  }
  catch {
    return null
  }
  finally {
    loadingForm.value = false
  }
}

async function addGraduate(graduate: any) {
  loadingSave.value = true

  try {
    const response = await useApi<{ data: GraduateLegacy }>(
      '/graduate-insights/v1/api/graduate',
      {
        method: 'POST',
        body: graduate,
      },
    )

    return {
      success: true,
      message: 'Graduado creado exitosamente',
      data: response.data,
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al crear el graduado',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function updateGraduate(id: number, graduate: any) {
  loadingSave.value = true

  try {
    await useApi<{ data: GraduateLegacy }>(
      `/graduate-insights/v1/api/graduate/${id}`,
      {
        method: 'PUT',
        body: graduate,
      },
    )

    return {
      success: true,
      message: 'Graduado actualizado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al actualizar el graduado',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function deleteGraduate(id: number) {
  loadingSave.value = true

  try {
    await useApi<{ data: GraduateLegacy }>(
      `/graduate-insights/v1/api/graduate/${id}`,
      {
        method: 'DELETE',
      },
    )

    return {
      success: true,
      message: 'Graduado eliminado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al eliminar el graduado',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

export function useGraduateService() {
  return {
    graduates,
    totalGraduates,
    loadingList,
    loadingForm,
    loadingSave,
    fetchGraduates,
    getGraduate,
    addGraduate,
    updateGraduate,
    deleteGraduate,
  }
}
