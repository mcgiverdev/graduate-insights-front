import { defu } from 'defu'
import type { NitroFetchOptions } from 'nitropack'
import { useAuthService } from './useAuthService'

export const useApi = <T = any>(url: string, options: NitroFetchOptions<T, 'get'> = {}) => {
  const config = useRuntimeConfig()

  const accessToken = useCookie('accessToken', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  })

  const { handleAuthError } = useAuthService()

  const defaults: NitroFetchOptions<T, 'get'> = {
    baseURL: config.public.apiBaseUrl,
    headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {},
  }

  const params = defu(options, defaults)

  return $fetch<T>(url, params).catch(error => {
    // Intentar manejar el error de autenticación
    if (handleAuthError(error)) {
      // Si el error fue manejado, lanzar un error genérico para detener la ejecución
      throw new Error('Sesión expirada')
    }

    // Si no es un error de autenticación, propagar el error original
    throw error
  })
}
