import { defu } from 'defu'
import { useAuthService } from './useAuthService'

export interface ApiResponse<T> {
  data: T
  status: number
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
      data: response._data,
      status: response.status,
    }
  }
  catch (error: any) {
    // Intentar manejar el error de autenticación
    if (handleAuthError(error)) {
      // Si el error fue manejado, lanzar un error genérico para detener la ejecución
      throw new Error('Sesión expirada')
    }

    // Si es un error de la API, incluir el status code
    if (error.response) {
      throw {
        ...error,
        status: error.response.status,
        message: error.message || 'Error en la petición',
      }
    }

    // Si no es un error de la API, propagar el error original
    throw error
  }
}
