import { BaseApiService } from '@/infrastructure/http/BaseApiService'
import type { ApiEnvelope, ListResponse } from '@/infrastructure/http/types'
import type {
  CatalogOptionItem,
  FacultyCatalogItem,
  Graduate,
  GraduateApiResponse,
  GraduateCreateResponse,
  GraduateFilters,
  GraduatePayload,
  ProfessionalSchoolCatalogItem,
} from '../types'
import { toGraduate } from '../utils/mappers'

const BASE_ENDPOINT = '/graduate-insights/v1/api/graduate'

const parseCreatedGraduateId = (data: GraduateCreateResponse | null | undefined): number | null => {
  if (!data)
    return null

  const rawId = data.graduateId ?? data.graduate_id
  if (rawId === undefined || rawId === null)
    return null

  const numericId = Number(rawId)
  return Number.isFinite(numericId) ? numericId : null
}

class GraduateService extends BaseApiService {
  async fetchFaculties(): Promise<FacultyCatalogItem[]> {
    return this.get<FacultyCatalogItem[]>(`${BASE_ENDPOINT}/catalog/faculties`)
  }

  async fetchProfessionalSchools(facultyId?: number): Promise<ProfessionalSchoolCatalogItem[]> {
    const params: Record<string, number> = {}
    if (facultyId)
      params.facultyId = facultyId

    return this.get<ProfessionalSchoolCatalogItem[]>(`${BASE_ENDPOINT}/catalog/professional-schools`, {
      params,
    })
  }

  async fetchDegreeTypes(): Promise<CatalogOptionItem[]> {
    return this.get<CatalogOptionItem[]>(`${BASE_ENDPOINT}/catalog/degree-types`)
  }

  async fetchTitulationModes(): Promise<CatalogOptionItem[]> {
    return this.get<CatalogOptionItem[]>(`${BASE_ENDPOINT}/catalog/titulation-modes`)
  }

  async fetchLanguagesCatalog(): Promise<CatalogOptionItem[]> {
    return this.get<CatalogOptionItem[]>(`${BASE_ENDPOINT}/catalog/languages`)
  }

  async fetchUniversities(): Promise<CatalogOptionItem[]> {
    return this.get<CatalogOptionItem[]>(`${BASE_ENDPOINT}/catalog/universities`)
  }

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

  async create(payload: GraduatePayload): Promise<number | null> {
    const response = await this.post<ApiEnvelope<GraduateCreateResponse>>(BASE_ENDPOINT, { body: payload })

    return parseCreatedGraduateId(response.data)
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

  async fetchMyProfile(): Promise<Graduate> {
    const response = await this.get<ApiEnvelope<GraduateApiResponse>>(`${BASE_ENDPOINT}/me`)

    return toGraduate(response.data)
  }

  async updateMyProfile(payload: GraduatePayload): Promise<void> {
    await this.put(`${BASE_ENDPOINT}/me`, { body: payload })
  }
}

export const graduateService = new GraduateService()
