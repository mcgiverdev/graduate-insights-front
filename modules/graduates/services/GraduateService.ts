import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  Graduate,
  GraduateApiResponse,
  GraduateFilters,
  GraduatePayload,
} from '../types'
import { toGraduate } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/graduate'

class GraduateService extends BaseApiService {
  async fetchList(filters: GraduateFilters = {}): Promise<ListResponse<Graduate>> {
    const params: Record<string, string | number | boolean> = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    if (filters.validated !== undefined)
      params.validated = filters.validated

    const response = await this.get<ApiEnvelope<GraduateApiResponse[]>>(BASE_ENDPOINT, { params })

    const items = (response.data || []).map(toGraduate)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<Graduate | null> {
    const response = await this.get<ApiEnvelope<GraduateApiResponse>>(`${BASE_ENDPOINT}/${id}`)

    return response.data ? toGraduate(response.data) : null
  }

  async create(payload: GraduatePayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: GraduatePayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }

  async activate(id: number) {
    return this.patch<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}/activate`)
  }
}

export const graduateService = new GraduateService()
