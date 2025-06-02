import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface Employer {
  employer_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: string
  correo: string
  estado: string
  dni: string
  celular: string
  ruc: string
  razon_social: string
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

const employers = ref<Employer[]>([])
const totalEmployers = ref(0)
const loadingList = ref(false)
const loadingForm = ref(false)
const loadingSave = ref(false)

function mapBackendEmployer(e: any): Employer {
  return {
    employer_id: e.employer_id,
    user_id: e.user_id,
    nombres: e.nombres,
    apellidos: e.apellidos,
    fecha_nacimiento: e.fecha_nacimiento,
    genero: e.genero,
    correo: e.correo,
    estado: e.estado,
    dni: e.dni,
    celular: e.celular,
    ruc: e.ruc,
    razon_social: e.razon_social,
    contrasena: e.contrasena,
  }
}

async function fetchEmployers(page: number, size: number) {
  loadingList.value = true

  const realSize = size === -1 ? 1000 : size
  try {
    const response = await useApi<ApiResponse<Employer>>(
      `/graduate-insights/v1/api/employer?page=${page}&size=${realSize}`,
      { method: 'GET' },
    )

    if (response && Array.isArray(response.data)) {
      employers.value = response.data.map(mapBackendEmployer)
      totalEmployers.value = response.paginate?.totalElements || 0
    }
    else {
      employers.value = []
      totalEmployers.value = 0
    }
  }
  catch (error) {
    employers.value = []
    totalEmployers.value = 0
  }
  finally {
    loadingList.value = false
  }
}

async function getEmployer(id: number) {
  loadingForm.value = true
  try {
    const response = await useApi<{ data: Employer }>(
      `/graduate-insights/v1/api/employer/${id}`,
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

async function addEmployer(employer: any) {
  loadingSave.value = true
  try {
    const response = await useApi<{ data: Employer }>(
      '/graduate-insights/v1/api/employer',
      {
        method: 'POST',
        body: employer,
      },
    )

    return {
      success: true,
      message: 'Empleador creado exitosamente',
      data: response.data,
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al crear el empleador',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function updateEmployer(id: number, employer: any) {
  loadingSave.value = true
  try {
    await useApi<{ data: Employer }>(
      `/graduate-insights/v1/api/employer/${id}`,
      {
        method: 'PUT',
        body: employer,
      },
    )

    return {
      success: true,
      message: 'Empleador actualizado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al actualizar el empleador',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

async function deleteEmployer(id: number) {
  loadingSave.value = true
  try {
    await useApi<{ data: Employer }>(
      `/graduate-insights/v1/api/employer/${id}`,
      {
        method: 'DELETE',
      },
    )

    return {
      success: true,
      message: 'Empleador eliminado exitosamente',
    }
  }
  catch (error: any) {
    return {
      success: false,
      message: error.data?.message || 'Error al eliminar el empleador',
      error: error.data || error,
    }
  }
  finally {
    loadingSave.value = false
  }
}

export function useEmployerService() {
  return {
    employers,
    totalEmployers,
    loadingList,
    loadingForm,
    loadingSave,
    fetchEmployers,
    getEmployer,
    addEmployer,
    updateEmployer,
    deleteEmployer,
  }
}
