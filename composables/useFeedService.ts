import { $api } from '@/utils/api'

export interface FeedItem {
  id: number
  tipo: 'EVENT' | 'JOB_OFFER'
  titulo: string
  descripcion: string
  contenido: string
  fecha_creacion: string
  fuente: string
  estado: string
  tipo_evento?: string
  empresa?: string
}

interface FeedResponse {
  success: boolean
  data: FeedItem[]
  paginate: {
    totalElements: number
    totalPages: number
    currentPage: number
  }
}

export const useFeedService = () => {
  const getFeed = async (page = 1, size = 10) => {
    try {
      return await $api<FeedResponse>('/graduate-insights/v1/api/home/feed', {
        method: 'GET',
        params: {
          page,
          size,
        },
      })
    }
    catch (error) {
      console.error('Error al obtener el feed:', error)
      throw error
    }
  }

  return {
    getFeed,
  }
}
