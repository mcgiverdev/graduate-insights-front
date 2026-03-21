import { useMockApi } from './useMockApi'

export interface ResourceApi {
  get: (url: string) => Promise<any>
  post: (url: string, data: any) => Promise<any>
  put: (url: string, data: any) => Promise<any>
  delete: (url: string) => Promise<any>
}

export const useResourceApi = (): ResourceApi => {
  const mockApi = useMockApi()

  // Inicializar con algunos datos de ejemplo para encuestas
  mockApi.initializeWithSampleData('surveys', [
    {
      survey_id: 1,
      title: 'Encuesta de Satisfacción',
      description: 'Encuesta para evaluar la satisfacción de los estudiantes',
      estado: 'published',
      questions: [
        {
          id: '1',
          type: 'text',
          title: '¿Qué aspectos del curso te gustaron más?',
          description: 'Describe los elementos que encontraste más valiosos',
          required: true,
        },
        {
          id: '2',
          type: 'rating',
          title: '¿Cómo calificarías al instructor?',
          required: true,
          validation: {
            max: 5,
          },
        },
        {
          id: '3',
          type: 'multiple_choice',
          title: '¿Recomendarías este curso a otros estudiantes?',
          required: true,
          options: [
            { value: 'definitely', label: 'Definitivamente sí' },
            { value: 'probably', label: 'Probablemente sí' },
            { value: 'maybe', label: 'Tal vez' },
            { value: 'no', label: 'No' },
          ],
        },
      ],
      settings: {
        allowAnonymous: true,
        showProgressBar: true,
        randomizeQuestions: false,
        limitOneResponse: true,
        showResultsToRespondents: false,
      },
    },
  ])

  const api: ResourceApi = {
    get: async (url: string) => {
      return await mockApi.get(url)
    },

    post: async (url: string, data: any) => {
      return await mockApi.post(url, data)
    },

    put: async (url: string, data: any) => {
      return await mockApi.put(url, data)
    },

    delete: async (url: string) => {
      return await mockApi.delete(url)
    },
  }

  return api
}
