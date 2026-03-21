import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  Employer,
  EmployerApiResponse,
  EmployerFilters,
  EmployerPayload,
} from '../types'
import { toEmployer } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/employer'

class EmployerService extends BaseApiService {
  async fetchList(filters: EmployerFilters = {}): Promise<ListResponse<Employer>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<EmployerApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toEmployer)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<Employer | null> {
    const response = await this.get<ApiEnvelope<EmployerApiResponse>>(`${BASE_ENDPOINT}/${id}`)
    return response.data ? toEmployer(response.data) : null
  }

  async create(payload: EmployerPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: EmployerPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const employerService = new EmployerService()
