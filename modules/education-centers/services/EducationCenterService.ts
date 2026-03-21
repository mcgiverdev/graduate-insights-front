import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  EducationCenter,
  EducationCenterApiResponse,
  EducationCenterFilters,
  EducationCenterPayload,
} from '../types'
import { toEducationCenter } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/education_center'

class EducationCenterService extends BaseApiService {
  async fetchList(filters: EducationCenterFilters = {}): Promise<ListResponse<EducationCenter>> {
    const params = {
      search: filters.search ?? '',
      page: filters.page ?? 1,
      size: filters.size ?? 10,
    }

    const response = await this.get<ApiEnvelope<EducationCenterApiResponse[]>>(BASE_ENDPOINT, { params })
    const items = (response.data || []).map(toEducationCenter)

    return {
      items,
      paginate: response.paginate,
    }
  }

  async getById(id: number): Promise<EducationCenter | null> {
    const response = await this.get<ApiEnvelope<EducationCenterApiResponse>>(`${BASE_ENDPOINT}/${id}`)
    return response.data ? toEducationCenter(response.data) : null
  }

  async create(payload: EducationCenterPayload) {
    return this.post<ApiEnvelope<void>>(BASE_ENDPOINT, { body: payload })
  }

  async update(id: number, payload: EducationCenterPayload) {
    return this.put<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`, { body: payload })
  }

  async remove(id: number) {
    return this.delete<ApiEnvelope<void>>(`${BASE_ENDPOINT}/${id}`)
  }
}

export const educationCenterService = new EducationCenterService()
