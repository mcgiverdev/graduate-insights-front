import type { ModelDefinition } from '../types/ModelDefinition'
import { type ApiResponse, useApi } from '@/composables/useApi'

interface ListParams {
  page: number
  size: number
  search?: string
}

export class CrudController {
  private modelDefinition: ModelDefinition
  private baseUrl: string

  constructor(modelDefinition: ModelDefinition, baseUrl: string) {
    this.modelDefinition = modelDefinition
    this.baseUrl = baseUrl || this.modelDefinition.api.baseURL || ''
  }

  private getEndpoint(type: 'list' | 'create' | 'update' | 'delete' | 'get'): string {
    const endpoint = this.modelDefinition.api.endpoints?.[type]
    if (!endpoint)
      return `${this.baseUrl}${this.modelDefinition.api.resourcePath}${this.getDefaultEndpoint(type)}`

    return `${this.baseUrl}${endpoint}`
  }

  private getDefaultEndpoint(type: 'list' | 'create' | 'update' | 'delete' | 'get'): string {
    switch (type) {
      case 'list':
        return ''
      case 'create':
        return ''
      case 'update':
        return '/:id'
      case 'delete':
        return '/:id'
      case 'get':
        return '/:id'
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
  }

  private isSuccessCode(type: 'list' | 'create' | 'update' | 'delete' | 'get', statusCode: number): boolean {
    const defaultCodes = {
      list: [200],
      create: [200, 201],
      update: [200, 204],
      delete: [200, 204],
      get: [200],
    }

    const customCodes = this.modelDefinition.api.successCodes?.[type]
    const validCodes = customCodes || defaultCodes[type]

    return validCodes.includes(statusCode)
  }

  private async handleApiResponse<T>(
    type: 'list' | 'create' | 'update' | 'delete' | 'get',
    apiCall: () => Promise<ApiResponse<T>>,
  ): Promise<T> {
    try {
      const { data, status } = await apiCall()

      if (!this.isSuccessCode(type, status))
        throw new Error(`Código de estado inesperado: ${status}`)

      return data
    }
    catch (error: any) {
      console.error(`Error en ${type}:`, error)
      throw error
    }
  }

  async list({ page = 1, size = 10, search }: ListParams): Promise<{ data: any[]; total: number }> {
    const perPage = size || this.modelDefinition.options?.perPage || 10

    const queryParams = {
      page: page + 1,
      size: perPage,
      ...(search ? { search } : {}),
      ...(this.modelDefinition.api.extraParams || {}),
    }

    const queryString = this.buildQueryString(queryParams)
    const endpoint = this.getEndpoint('list')
    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`

    try {
      const apiResponse = await useApi<any>(url, {
        method: 'get',
        headers: this.modelDefinition.api.headers,
      })

      if (!this.isSuccessCode('list', apiResponse.status))
        throw new Error(`Código de estado inesperado: ${apiResponse.status}`)

      // Extraer datos y total de manera segura
      let data: any[] = []
      let total = 0

      if (apiResponse.data.data && apiResponse.data.paginate) {
        data = apiResponse.data.data
        total = apiResponse.data.paginate.totalElements
      }
      else if (Array.isArray(apiResponse.data)) {
        data = apiResponse.data
        total = apiResponse.data.length
      }
      else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
        data = apiResponse.data.data
        total = apiResponse.data.data.length
      }
      else {
        console.warn('Formato de respuesta no estándar:', apiResponse)
        data = Array.isArray(apiResponse.data)
          ? apiResponse.data
          : apiResponse.data?.data && Array.isArray(apiResponse.data.data)
            ? apiResponse.data.data
            : []
        total = typeof apiResponse.data?.total === 'number'
          ? apiResponse.data.total
          : typeof apiResponse.data?.paginate?.totalElements === 'number'
            ? apiResponse.data.paginate.totalElements
            : data.length
      }

      console.log('Datos procesados:', { data, total, page: queryParams.page })

      return { data, total }
    }
    catch (error) {
      console.error('Error en list:', error)

      return { data: [], total: 0 }
    }
  }

  async create(data: Record<string, any>): Promise<any> {
    // Determinar si los datos contienen archivos
    const hasFiles = data instanceof FormData || Object.values(data).some(value => value instanceof File)

    console.log('CrudController - Datos recibidos:', data)
    console.log('CrudController - Tiene archivos:', hasFiles)
    console.log('CrudController - Es FormData:', data instanceof FormData)

    const headers = { ...this.modelDefinition.api.headers }

    // Solo establecer Content-Type si no hay archivos
    if (!hasFiles)
      headers['Content-Type'] = 'application/json'

    console.log('CrudController - Headers finales:', headers)

    return this.handleApiResponse('create', () =>
      useApi<any>(this.getEndpoint('create'), {
        method: 'post',
        headers,
        body: data,
      }),
    )
  }

  async update(id: string | number, data: Record<string, any>): Promise<any> {
    // Determinar si los datos contienen archivos
    const hasFiles = data instanceof FormData || Object.values(data).some(value => value instanceof File)

    const headers = { ...this.modelDefinition.api.headers }

    // Solo establecer Content-Type si no hay archivos
    if (!hasFiles)
      headers['Content-Type'] = 'application/json'

    return this.handleApiResponse('update', () =>
      useApi<any>(
        this.getEndpoint('update').replace(':id', id.toString()),
        {
          method: 'put',
          headers,
          body: data,
        },
      ),
    )
  }

  async delete(id: string | number): Promise<void> {
    return this.handleApiResponse('delete', () =>
      useApi<any>(
        this.getEndpoint('delete').replace(':id', id.toString()),
        {
          method: 'delete',
          headers: this.modelDefinition.api.headers,
        },
      ),
    )
  }

  async get(id: string | number): Promise<any> {
    return this.handleApiResponse('get', async () => {
      const response = await useApi<any>(
        this.getEndpoint('get').replace(':id', id.toString()),
        {
          method: 'get',
          headers: this.modelDefinition.api.headers,
        },
      )

      // Si la respuesta viene en el formato { data: { ... } }
      if (response.data && typeof response.data === 'object') {
        return {
          data: response.data.data || response.data,
          status: response.status,
        }
      }

      return response
    })
  }
}
