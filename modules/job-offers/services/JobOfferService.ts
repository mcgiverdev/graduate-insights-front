import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  JobOffer,
  JobOfferApiResponse,
  JobOfferFilters,
  JobOfferPayload,
} from '../types'
import { toJobOffer } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/job-offers'

class JobOfferService extends BaseApiService {
  async fetchList(filters: JobOfferFilters = {}): Promise<ListResponse<JobOffer>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<JobOfferApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toJobOffer)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<JobOffer | null> {
    const response = await this.get<ApiEnvelope<JobOfferApiResponse>>(`${BASE_ENDPOINT}/${id}`)
    return response.data ? toJobOffer(response.data) : null
  }

  async create(payload: JobOfferPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: JobOfferPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const jobOfferService = new JobOfferService()
