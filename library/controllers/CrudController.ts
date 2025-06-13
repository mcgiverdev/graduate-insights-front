import type { ModelDefinition } from '../types/ModelDefinition'
import { type ApiResponse, useApi } from '@/composables/useApi'

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
      throw new Error(error.message || `Error en la operación ${type}`)
    }
  }

  async list(page: number = 1, size: number = 10): Promise<{ data: any[]; total: number }> {
    const perPage = size || this.modelDefinition.options?.perPage || 10

    return await this.handleApiResponse('list', async () => {
      const apiResponse = await useApi<any>(
        `${this.getEndpoint('list')}?page=${page}&size=${perPage}`,
        {
          method: 'get',
          headers: this.modelDefinition.api.headers,
        },
      )

      // Si la respuesta viene en el formato { data: [], paginate: { totalElements, totalPages, currentPage } }
      if (apiResponse.data.data && apiResponse.data.paginate) {
        return {
          data: {
            data: apiResponse.data.data,
            total: apiResponse.data.paginate.totalElements,
          },
          status: apiResponse.status,
        }
      }

      // Si la respuesta es un array directo
      if (Array.isArray(apiResponse.data)) {
        return {
          data: {
            data: apiResponse.data,
            total: apiResponse.data.length,
          },
          status: apiResponse.status,
        }
      }

      // Si la respuesta es { data: [] } sin paginación
      if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
        return {
          data: {
            data: apiResponse.data.data,
            total: apiResponse.data.data.length,
          },
          status: apiResponse.status,
        }
      }

      // Si no reconocemos el formato, devolvemos un array vacío
      console.warn('Formato de respuesta no reconocido:', apiResponse)

      return {
        data: {
          data: [],
          total: 0,
        },
        status: apiResponse.status,
      }
    })
  }

  async create(data: Record<string, any>): Promise<any> {
    return this.handleApiResponse('create', () =>
      useApi<any>(this.getEndpoint('create'), {
        method: 'post',
        headers: {
          ...this.modelDefinition.api.headers,
          'Content-Type': 'application/json',
        },
        body: data,
      }),
    )
  }

  async update(id: string | number, data: Record<string, any>): Promise<any> {
    return this.handleApiResponse('update', () =>
      useApi<any>(
        this.getEndpoint('update').replace(':id', id.toString()),
        {
          method: 'put',
          headers: {
            ...this.modelDefinition.api.headers,
            'Content-Type': 'application/json',
          },
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
