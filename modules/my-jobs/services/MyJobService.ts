import type {
  MyJob,
  MyJobApiResponse,
  MyJobFilters,
  MyJobPayload,
} from '../types'
import { toMyJob } from '../utils/mappers'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'

const BASE_ENDPOINT = '/graduate-insights/v1/api/jobs'

class MyJobService extends BaseApiService {
  async fetchList(filters: MyJobFilters = {}): Promise<ListResponse<MyJob>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<MyJobApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toMyJob)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<MyJob | null> {
    const response = await this.get<ApiEnvelope<MyJobApiResponse>>(`${BASE_ENDPOINT}/${id}`)

    return response.data ? toMyJob(response.data) : null
  }

  async create(payload: MyJobPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: MyJobPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const myJobService = new MyJobService()
