import type {
  Job,
  JobApiResponse,
  JobFilters,
  JobPayload,
} from '../types'
import { toJob } from '../utils/mappers'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'

const BASE_ENDPOINT = '/graduate-insights/v1/api/jobs'

class JobService extends BaseApiService {
  async fetchList(filters: JobFilters = {}): Promise<ListResponse<Job>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<JobApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toJob)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<Job | null> {
    const response = await this.get<ApiEnvelope<JobApiResponse>>(`${BASE_ENDPOINT}/${id}`)

    return response.data ? toJob(response.data) : null
  }

  async create(payload: JobPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: JobPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const jobService = new JobService()
