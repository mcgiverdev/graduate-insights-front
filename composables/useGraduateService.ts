import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface Graduate {
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

const graduates = ref<Graduate[]>([])
const totalGraduates = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

function mapBackendGraduate(g: any): Graduate {
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
    const response = await useApi<ApiResponse<Graduate>>(
      `/graduate-insights/v1/api/graduate?page=${page}&size=${realSize}`,
      { method: 'GET' },
    )

    if (response && Array.isArray(response.data)) {
      graduates.value = response.data.map(mapBackendGraduate)
      totalGraduates.value = response.paginate?.totalElements || 0
    }
    else {
      console.warn('La respuesta no tiene el formato esperado:', response)
      graduates.value = []
      totalGraduates.value = 0
    }
  }
  catch (error) {
    console.error('Error fetching graduates:', error)
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
    const response = await useApi<{ data: Graduate }>(
      `/graduate-insights/v1/api/graduate/${id}`,
      { method: 'GET' },
    )

    return response.data
  }
  catch (error) {
    console.error('Error getting graduate:', error)

    return null
  }
  finally {
    loadingForm.value = false
  }
}

async function addGraduate(graduate: any) {
  loadingSave.value = true

  try {
    const response = await useApi<{ data: Graduate }>(
      '/graduate-insights/v1/api/graduate',
      {
        method: 'POST',
        body: graduate,
      },
    )

    return { data: response.data }
  }
  catch (error: any) {
    return { error: error.data || error }
  }
  finally {
    loadingSave.value = false
  }
}

async function updateGraduate(id: number, graduate: any) {
  loadingSave.value = true

  try {
    const response = await useApi<{ data: Graduate }>(
      `/graduate-insights/v1/api/graduate/${id}`,
      {
        method: 'PUT',
        body: graduate,
      },
    )

    return { data: response.data }
  }
  catch (error: any) {
    return { error: error.data || error }
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
  }
}
