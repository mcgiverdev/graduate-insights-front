import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  Director,
  DirectorApiResponse,
  DirectorFilters,
  DirectorPayload,
} from '../types'
import { toDirector } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/director'

class DirectorService extends BaseApiService {
  async fetchList(filters: DirectorFilters = {}): Promise<ListResponse<Director>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<DirectorApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toDirector)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<Director | null> {
    const response = await this.get<ApiEnvelope<DirectorApiResponse>>(`${BASE_ENDPOINT}/${id}`)
    return response.data ? toDirector(response.data) : null
  }

  async create(payload: DirectorPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: DirectorPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const directorService = new DirectorService()
