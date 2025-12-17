import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  MyJobOffer,
  MyJobOfferApiResponse,
  MyJobOfferFilters,
  MyJobOfferPayload,
} from '../types'
import { toMyJobOffer } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/job-offers'

class MyJobOfferService extends BaseApiService {
  async fetchList(filters: MyJobOfferFilters = {}): Promise<ListResponse<MyJobOffer>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<MyJobOfferApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toMyJobOffer)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<MyJobOffer | null> {
    const response = await this.get<ApiEnvelope<MyJobOfferApiResponse>>(`${BASE_ENDPOINT}/${id}`)
    return response.data ? toMyJobOffer(response.data) : null
  }

  async create(payload: MyJobOfferPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: MyJobOfferPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const myJobOfferService = new MyJobOfferService()
