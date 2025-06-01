import { defu } from 'defu'
import type { NitroFetchOptions } from 'nitropack'

export const useApi = <T>(url: string, options: NitroFetchOptions<T> = {}) => {
  const config = useRuntimeConfig()
  const accessToken = useCookie('accessToken')

  const defaults: NitroFetchOptions<T> = {
    baseURL: config.public.apiBaseUrl,
    headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {},
  }

  const params = defu(options, defaults)

  return $fetch<T>(url, params)
}
