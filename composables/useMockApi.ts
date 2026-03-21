interface MockStorage {
  [key: string]: {
    items: any[]
    lastId: number
  }
}

export interface MockApiResponse<T> {
  data: T
  status: number
}

const storage: MockStorage = {}

const initializeCollection = (collection: string) => {
  if (!storage[collection]) {
    storage[collection] = {
      items: [],
      lastId: 0,
    }
  }
}

const getNextId = (collection: string): number => {
  storage[collection].lastId += 1

  return storage[collection].lastId
}

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

const getCollectionFromPath = (url: string): string => {
  // Siempre extraer el nombre de la colección base
  // Por ejemplo: '/graduate-insights/v1/api/surveys' -> 'surveys'
  const segments = url.split('/').filter(Boolean)

  // Si es una ruta de API, el último segmento no numérico es la colección
  for (let i = segments.length - 1; i >= 0; i--) {
    if (!segments[i].match(/^\d+$/))
      return segments[i]
  }

  // Si no hay segmentos no numéricos, usar el último segmento
  return segments[segments.length - 1]
}

const getIdFromPath = (url: string): string | null => {
  const segments = url.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  // Si el último segmento parece ser un ID, devolverlo
  if (lastSegment.match(/^\d+$/))
    return lastSegment

  return null
}

export const useMockApi = () => {
  const api = {
    get: async (url: string): Promise<MockApiResponse<any>> => {
      await delay()

      const collection = getCollectionFromPath(url)
      const id = getIdFromPath(url)

      initializeCollection(collection)

      if (id) {
        const foundItem = storage[collection].items.find(item => String(item.id) === id || String(item.survey_id) === id)
        if (!foundItem)
          throw new Error(`Item with id ${id} not found`)

        return {
          data: foundItem,
          status: 200,
        }
      }

      return {
        data: storage[collection].items,
        status: 200,
      }
    },

    post: async (url: string, data: any): Promise<MockApiResponse<any>> => {
      await delay()

      const collection = getCollectionFromPath(url)

      initializeCollection(collection)

      const newItem = {
        ...data,
        id: getNextId(collection),
        survey_id: getNextId(collection), // Mantener ambos IDs para compatibilidad
      }

      storage[collection].items.push(newItem)

      return {
        data: newItem,
        status: 201,
      }
    },

    put: async (url: string, data: any): Promise<MockApiResponse<any>> => {
      await delay()

      const collection = getCollectionFromPath(url)
      const id = getIdFromPath(url)

      initializeCollection(collection)

      const index = storage[collection].items.findIndex(
        item => String(item.id) === id || String(item.survey_id) === id,
      )

      if (index === -1)
        throw new Error(`Item with id ${id} not found`)

      const updatedItem = {
        ...storage[collection].items[index],
        ...data,
        id: Number(id),
        survey_id: Number(id), // Mantener ambos IDs para compatibilidad
      }

      storage[collection].items[index] = updatedItem

      return {
        data: updatedItem,
        status: 200,
      }
    },

    delete: async (url: string): Promise<MockApiResponse<void>> => {
      await delay()

      const collection = getCollectionFromPath(url)
      const id = getIdFromPath(url)

      initializeCollection(collection)

      const index = storage[collection].items.findIndex(
        item => String(item.id) === id || String(item.survey_id) === id,
      )

      if (index === -1)
        throw new Error(`Item with id ${id} not found`)

      storage[collection].items.splice(index, 1)

      return {
        data: undefined,
        status: 204,
      }
    },

    // Métodos adicionales para el mock
    clearStorage: () => {
      Object.keys(storage).forEach(key => delete storage[key])
    },

    // Persistir en localStorage
    persistToLocalStorage: () => {
      localStorage.setItem('mockApiStorage', JSON.stringify(storage))
    },

    // Cargar desde localStorage
    loadFromLocalStorage: () => {
      const savedStorage = localStorage.getItem('mockApiStorage')
      if (savedStorage) {
        const parsed = JSON.parse(savedStorage)

        Object.assign(storage, parsed)
      }
    },

    // Inicializar con datos de ejemplo
    initializeWithSampleData: (collection: string, sampleData: any[]) => {
      initializeCollection(collection)
      storage[collection].items = sampleData.map((item, index) => ({
        ...item,
        id: index + 1,
        survey_id: index + 1, // Mantener ambos IDs para compatibilidad
      }))
      storage[collection].lastId = sampleData.length
    },
  }

  // Cargar datos guardados al inicializar
  api.loadFromLocalStorage()

  return api
}
