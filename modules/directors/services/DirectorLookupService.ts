import type { Director } from '../types'
import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope } from '@/infrastructure/http/types'
import type { KeyValueOption } from '@/modules/shared/types/keyValue'

const BASE_ENDPOINT = '/graduate-insights/v1/api/directors'

class DirectorLookupService extends BaseApiService {
  async fetchAll(): Promise<KeyValueOption[]> {
    const response = await this.get<ApiEnvelope<Director[]>>(BASE_ENDPOINT)

    return (response.data || []).map(director => ({
      key: director.directorId,
      value: director.nombre,
    }))
  }
}

export const directorLookupService = new DirectorLookupService()
