import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface DirectorLegacy {
  director_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: string
  correo: string
  estado: string
  dni: string
  celular: string
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

const directors = ref<DirectorLegacy[]>([])
const totalDirectors = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

function mapBackendDirector(d: any): DirectorLegacy {
  return {
    director_id: d.director_id,
    user_id: d.user_id,
    nombres: d.nombres,
    apellidos: d.apellidos,
    fecha_nacimiento: d.fecha_nacimiento,
    genero: d.genero,
    correo: d.correo,
    estado: d.estado,
    dni: d.dni,
    celular: d.celular,
    contrasena: d.contrasena,
  }
}

async function fetchDirectors(page: number, size: number) {
  loadingList.value = true

  const realSize = size === -1 ? 1000 : size
  try {
    const response = await useApi<ApiResponse<DirectorLegacy>>(
      `/graduate-insights/v1/api/director?page=${page}&size=${realSize}`,
      { method: 'GET' },
    )

    if (response && Array.isArray(response.data)) {
      directors.value = response.data.map(mapBackendDirector)
      totalDirectors.value = response.paginate?.totalElements || 0
    }
    else {
      directors.value = []
      totalDirectors.value = 0
    }
  }
  catch {
    directors.value = []
    totalDirectors.value = 0
  }
  finally {
    loadingList.value = false
  }
}

async function getDirector(id: number) {
  loadingForm.value = true
  try {
    const response = await useApi<{ data: DirectorLegacy }>(
      `/graduate-insights/v1/api/director/${id}`,
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

async function addDirector(director: any) {
  loadingSave.value = true
  try {
    const response = await useApi<{ data: DirectorLegacy }>(
      '/graduate-insights/v1/api/director',
      {
        method: 'POST',
        body: director,
      },
    )

    return {
      success: true,
      message: 'Director creado exitosamente',
      data: response.data,
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al crear el director',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function updateDirector(id: number, director: any) {
  loadingSave.value = true
  try {
    await useApi<{ data: DirectorLegacy }>(
      `/graduate-insights/v1/api/director/${id}`,
      {
        method: 'PUT',
        body: director,
      },
    )

    return {
      success: true,
      message: 'Director actualizado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al actualizar el director',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function deleteDirector(id: number) {
  loadingSave.value = true
  try {
    await useApi<{ data: DirectorLegacy }>(
      `/graduate-insights/v1/api/director/${id}`,
      {
        method: 'DELETE',
      },
    )

    return {
      success: true,
      message: 'Director eliminado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al eliminar el director',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

export function useDirectorService() {
  return {
    directors,
    totalDirectors,
    loadingList,
    loadingForm,
    loadingSave,
    fetchDirectors,
    getDirector,
    addDirector,
    updateDirector,
    deleteDirector,
  }
}
