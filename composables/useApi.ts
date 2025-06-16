import { defu } from 'defu'
import { useAuthService } from './useAuthService'

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

  const accessToken = useCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  })

  const { handleAuthError } = useAuthService()

  const defaults = {
    baseURL: config.public.apiBaseUrl,
    headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {},
  }

  const params = defu(options, defaults)

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
      const apiError = new Error(error.message || 'Error en la petición') as ApiError

      apiError.data = error.response._data
      apiError.status = error.response.status
      throw apiError
    }

    // Si no es un error de la API, propagar el error original
    throw error
  }
}
