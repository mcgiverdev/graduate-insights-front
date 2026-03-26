import { defu } from 'defu'
import { useAuthService } from './useAuthService'
import { useSnackbar } from './useSnackbar'

export interface ApiResponse<T> {
  data: T
  status: number
}

export interface ApiError extends Error {
  data?: any
  status?: number
}

export const useApi = async <T = any>(url: string, options: any = {}): Promise<ApiResponse<T>> => {
  const config = useRuntimeConfig()

  const accessToken = useCookie('accessToken')

  const { handleAuthError } = useAuthService()
  const { showSnackbar } = useSnackbar()

  const headers = options.headers ? { ...options.headers } : {}

  if (accessToken.value && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${accessToken.value}`
  }

  const defaults = {
    baseURL: config.public.apiBaseUrl,
    credentials: 'include' as RequestCredentials,
  }

  const params = defu({ ...options, headers }, defaults)

  try {
    const response = await $fetch.raw<T>(url, params)

    return {
      data: response._data as T,
      status: response.status,
    }
  }
  catch (error: any) {
    // Intentar manejar el error de autenticación
    if (error.response?.status === 401 && handleAuthError(error)) {
      const authError = new Error('Sesión expirada') as ApiError

      authError.status = 401
      throw authError
    }

    // Si es un error de la API, incluir el status code y los datos de error
    if (error.response) {
      const payload = error.response._data

      if (payload?.errors?.length) {
        showSnackbar({ text: payload.errors[0], color: 'error' })
      }
      else if (payload?.message) {
        showSnackbar({ text: payload.message, color: 'error' })
      }

      const apiError = new Error(error.message || 'Error en la petición') as ApiError

      apiError.data = payload
      apiError.status = error.response.status
      throw apiError
    }

    // Sin respuesta del servidor (red caída, CORS, timeout, etc.)
    showSnackbar({ text: 'Ocurrió un problema. Vuelva a intentarlo en unos minutos.', color: 'error' })
    throw error
  }
}
