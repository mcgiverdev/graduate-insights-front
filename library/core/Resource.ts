import type { FormField } from '../fields/FormField'
import type { ModelDefinition } from '../types/ModelDefinition'

export interface ResourceConfig {
  name: string
  resourcePath: string
  idField: string
  perPage?: number
  sortable?: boolean
  filterable?: boolean
}

export interface Action {
  name: string
  label: string
  icon?: string
  color?: string
  showOnTableRow?: boolean
  showOnToolbar?: boolean
  confirmationTitle?: string
  confirmationText?: string
  handler: (item: any) => Promise<void>
}

export interface Filter {
  name: string
  label: string
  type: string
  options?: any[]
}

export interface ApiConfig {
  baseURL?: string
  headers?: Record<string, string>
  mapResponse?: (data: any) => any
  mapRequest?: (data: any) => any
  successCodes?: {
    create?: number[]
    update?: number[]
    delete?: number[]
    list?: number[]
    get?: number[]
  }
}

export abstract class Resource {
  protected config: Required<ResourceConfig>
  protected title: string
  protected singularLabel: string
  protected pluralLabel: string
  protected fields: FormField[] = []
  protected actions: Action[] = []
  protected filters: Filter[] = []
  protected perPageOptions = [10, 25, 50, 100]
  protected defaultPerPage = 10
  protected searchable = true
  protected sortable = true
  protected apiConfig: Required<ApiConfig>

  constructor(config: ResourceConfig) {
    // Aseguramos que config tenga todos los campos requeridos
    this.config = {
      ...config,
      perPage: config.perPage ?? 10,
      sortable: config.sortable ?? true,
      filterable: config.filterable ?? true,
    }

    this.title = `Administración de ${config.name}`
    this.singularLabel = config.name
    this.pluralLabel = `${config.name}s`

    // Inicializamos la configuración de la API usando el template method
    this.apiConfig = this.initializeApiConfig()

    // Inicializamos los campos
    this.fields = this.form()
  }

  // Método abstracto que las subclases deben implementar para definir sus campos
  protected abstract form(): FormField[]

  // Template method para inicializar la configuración de la API
  protected initializeApiConfig(): Required<ApiConfig> {
    const defaultConfig: Required<ApiConfig> = {
      baseURL: '',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mapResponse: (data: any) => data,
      mapRequest: (data: any) => data,
      successCodes: {
        create: [201],
        update: [204],
        delete: [204],
        list: [200],
        get: [200],
      },
    }

    // Llamamos al hook que las subclases pueden sobrescribir
    const customConfig = this.configureApi()

    return {
      ...defaultConfig,
      ...customConfig,

      // Aseguramos que los códigos de éxito siempre tengan valores por defecto
      successCodes: {
        ...defaultConfig.successCodes,
        ...customConfig?.successCodes,
      },
    }
  }

  // Hook que las subclases pueden sobrescribir para personalizar la configuración de la API
  public configureApi(): Partial<ApiConfig> {
    return {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mapResponse: (data: any): any => {
        // Creamos un objeto con todas las propiedades de la interfaz generica
        const mappedData: Partial<any> = {}

        // Iteramos sobre las propiedades de la interfaz generica
        const genericKeys = Object.keys(this.getModel().fields) as Array<keyof any>

        genericKeys.forEach(key => {
          if (key in data)
            mappedData[key as string] = data[key as string]
        })

        return mappedData
      },
      mapRequest: (data: any): any => {
        // Verificar si hay archivos en los datos
        const hasFiles = this.hasFileFields(data)

        if (hasFiles) {
          // Crear FormData para manejar archivos
          const formData = new FormData()

          Object.keys(data).forEach(key => {
            const value = data[key]
            if (value instanceof File)
              formData.append(key, value)
            else if (value !== null && value !== undefined)
              formData.append(key, String(value))
          })

          return formData
        }

        return data
      },
    }
  }

  // Método para verificar si hay campos de archivo en los datos
  private hasFileFields(data: any): boolean {
    return Object.values(data).some(value => value instanceof File)
  }

  // Método para obtener los headers correctos según el tipo de datos
  public getRequestHeaders(data: any): Record<string, string> {
    const baseHeaders = { ...this.apiConfig.headers }

    if (this.hasFileFields(data)) {
      // Para FormData, el navegador debe establecer el Content-Type automáticamente
      // para incluir el boundary correcto
      delete baseHeaders['Content-Type']
    }

    return baseHeaders
  }

  public getModel(): ModelDefinition {
    const fieldsObject: Record<string, any> = {}

    this.fields.forEach(field => {
      const fieldData = field.toField()

      // Configurar opciones basadas en el tipo de campo
      let fieldOptions: any

      if (fieldData.component === 'select-field' && fieldData.props?.items) {
        fieldOptions = { items: fieldData.props.items }
      }
      else if (fieldData.component === 'belongs-field') {
        fieldOptions = {
          apiEndpoint: fieldData.props?.apiEndpoint,
          displayField: fieldData.props?.displayField || 'value',
          valueField: fieldData.props?.valueField || 'key',
        }
      }

      fieldsObject[fieldData.name] = {
        type: this.getFieldType(fieldData.component) as import('../types/FieldType').FieldType,
        label: fieldData.label,
        required: fieldData.rules?.includes('required'),
        placeholder: fieldData.props?.placeholder,
        options: fieldOptions,
        list: {
          visible: fieldData.showOnIndex !== false,
        },
        create: {
          visible: fieldData.showOnCreate !== false,
          rules: fieldData.rules,
          defaultValue: fieldData.props?.defaultValue,
        },
        edit: {
          visible: fieldData.showOnUpdate !== false,
          rules: fieldData.rules,
        },
      }
    })

    return {
      name: this.config.name,
      fields: fieldsObject,
      api: {
        baseURL: this.apiConfig.baseURL,
        resourcePath: this.config.resourcePath,
        headers: this.apiConfig.headers,
        mapResponse: this.apiConfig.mapResponse,
        mapRequest: this.apiConfig.mapRequest,
        successCodes: this.apiConfig.successCodes,
      },
      options: {
        perPage: this.config.perPage,
        sortable: this.config.sortable,
        filterable: this.config.filterable,
        idField: this.config.idField,
      },
    }
  }

  protected getFieldType(component: string): string {
    const typeMap: Record<string, string> = {
      'text-field': 'text',
      'select-field': 'enum',
      'date-field': 'date',
      'textarea-field': 'text',
      'file-field': 'file',
      'belongs-field': 'belongs',
    }

    return typeMap[component] || 'text'
  }

  public getTitle(): string {
    return this.title
  }

  public getSingularLabel(): string {
    return this.singularLabel
  }

  public getPluralLabel(): string {
    return this.pluralLabel
  }

  public setLabels(singular: string, plural: string): this {
    this.singularLabel = singular
    this.pluralLabel = plural

    return this
  }

  public getDefaultPerPage(): number {
    return this.defaultPerPage
  }

  public getPerPageOptions(): number[] {
    return this.perPageOptions
  }

  public isSearchable(): boolean {
    return this.searchable
  }

  public isSortable(): boolean {
    return this.sortable
  }

  public getActions(): Action[] {
    return this.actions
  }

  public getFilters(): Filter[] {
    return this.filters
  }

  public getIndexFields(): FormField[] {
    return this.fields.filter(field => {
      const fieldData = field.toField()

      return fieldData.showOnIndex !== false
    })
  }

  public getDetailFields(): FormField[] {
    return this.fields.filter(field => {
      const fieldData = field.toField()

      return fieldData.showOnDetail !== false
    })
  }

  public getCreateFields(): FormField[] {
    return this.fields.filter(field => {
      const fieldData = field.toField()

      return fieldData.showOnCreate !== false
    })
  }

  public getUpdateFields(): FormField[] {
    return this.fields.filter(field => {
      const fieldData = field.toField()

      return fieldData.showOnUpdate !== false
    })
  }
}
