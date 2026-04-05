import type { FeedItem, FeedListParams, FeedListResult } from '../types'
import { $api } from '@/utils/api'

interface FeedApiPaginate {
  total_pages?: number
  current_page?: number
  total_elements?: number
  totalPages?: number
  currentPage?: number
  totalElements?: number
}

interface FeedApiResponse {
  success: boolean
  data?: FeedItem[]
  paginate?: FeedApiPaginate
}

const DEFAULT_PAGE_SIZE = 10

const normalizePaginate = (paginate: FeedApiPaginate | undefined, fallbackLength: number) => {
  const totalPages = paginate?.total_pages ?? paginate?.totalPages ?? 0
  const currentPage = paginate?.current_page ?? paginate?.currentPage ?? 1
  const totalElements = paginate?.total_elements ?? paginate?.totalElements ?? fallbackLength

  return {
    totalPages,
    currentPage,
    totalElements,
  }
}

class FeedService {
  async fetchFeed(params: FeedListParams = {}): Promise<FeedListResult> {
    const response = await $api<FeedApiResponse>(
      '/graduate-insights/v1/api/home/feed',
      {
        method: 'GET',
        params: {
          page: params.page ?? 1,
          size: params.size ?? DEFAULT_PAGE_SIZE,
        },
      },
    )

    const items = response.data ?? []

    return {
      items,
      paginate: normalizePaginate(response.paginate, items.length),
    }
  }
}

export const feedService = new FeedService()
