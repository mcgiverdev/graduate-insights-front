import { type ApiConfig, Resource } from '../../core/Resource'
import { Fields } from '../../fields'
import type { FormField } from '../../fields/FormField'
import { useResourceApi } from '@/composables/useResourceApi'

export interface Question {
  id: string
  type: 'text' | 'multiple_choice' | 'checkbox' | 'rating' | 'date' | 'time' | 'file' | 'matrix'
  title: string
  description?: string
  required: boolean
  options?: Array<{
    value: string
    label: string
  }>
  matrix?: {
    rows: string[]
    columns: string[]
  }
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface Survey {
  survey_id: number
  title: string
  description: string
  estado: string
  questions: Question[]
  settings: {
    allowAnonymous: boolean
    showProgressBar: boolean
    randomizeQuestions: boolean
    limitOneResponse: boolean
    showResultsToRespondents: boolean
    startDate?: string
    endDate?: string
  }
}

export class SurveyResource extends Resource {
  private api = useResourceApi()
  private static useMockApi = true // Configuración para usar el mock API

  constructor() {
    super({
      name: 'surveys',
      resourcePath: '/graduate-insights/v1/api/surveys', // Mantener la ruta real del backend
      idField: 'survey_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Encuesta', 'Encuestas')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('survey_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('title')
        .label('Título')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el título de la encuesta'),

      Fields.text('description')
        .label('Descripción')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese la descripción de la encuesta'),

      Fields.select('estado')
        .label('Estado')
        .sortable()
        .required()
        .options([
          { value: 'draft', title: 'Borrador' },
          { value: 'published', title: 'Publicada' },
          { value: 'closed', title: 'Cerrada' },
        ])
        .default('draft'),
    ]
  }

  public override configureApi(): Partial<ApiConfig> {
    return {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mapResponse: (d: any): Survey => ({
        survey_id: d.survey_id,
        title: d.title,
        description: d.description,
        estado: d.estado,
        questions: d.questions || [],
        settings: d.settings || {
          allowAnonymous: true,
          showProgressBar: true,
          randomizeQuestions: false,
          limitOneResponse: false,
          showResultsToRespondents: false,
        },
      }),
    }
  }

  // Métodos CRUD
  public async index() {
    const model = this.getModel()
    const response = await this.api.get(model.api.resourcePath)

    return {
      data: response.data.map((item: any) => model.api.mapResponse!(item)),
    }
  }

  public async show(id: string) {
    const model = this.getModel()
    const response = await this.api.get(`${model.api.resourcePath}/${id}`)

    return {
      data: model.api.mapResponse!(response.data),
    }
  }

  public async store(data: Partial<Survey>) {
    const model = this.getModel()
    const response = await this.api.post(model.api.resourcePath, data)

    return {
      data: model.api.mapResponse!(response.data),
    }
  }

  public async update(id: string, data: Partial<Survey>) {
    const model = this.getModel()
    const response = await this.api.put(`${model.api.resourcePath}/${id}`, data)

    return {
      data: model.api.mapResponse!(response.data),
    }
  }

  public async destroy(id: string) {
    const model = this.getModel()

    await this.api.delete(`${model.api.resourcePath}/${id}`)
  }

  // Método estático para configurar el uso del mock API
  public static setUseMockApi(value: boolean) {
    SurveyResource.useMockApi = value
  }

  // Método para verificar si se está usando el mock API
  public static isUsingMockApi(): boolean {
    return SurveyResource.useMockApi
  }
}
