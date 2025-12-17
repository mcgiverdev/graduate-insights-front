import type { FetchOptions } from 'ofetch'
import { useApi } from '@/composables/useApi'

export abstract class BaseApiService {
  protected async get<T>(url: string, options: FetchOptions<'json'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'get' })
  }

  protected async post<T>(url: string, options: FetchOptions<'json'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'post' })
  }

  protected async put<T>(url: string, options: FetchOptions<'json'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'put' })
  }

  protected async delete<T>(url: string, options: FetchOptions<'json'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'delete' })
  }

  private async request<T>(url: string, options: FetchOptions<'json'>): Promise<T> {
    const { data } = await useApi<T>(url, options)

    return data
  }
}
