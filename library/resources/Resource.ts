import type { ModelDefinition } from '../types/ModelDefinition'

export interface Field {
  name: string
  label: string
  component: string
  sortable?: boolean
  searchable?: boolean
  filterable?: boolean
  hidden?: boolean
  showOnIndex?: boolean
  showOnDetail?: boolean
  showOnCreate?: boolean
  showOnUpdate?: boolean
  rules?: any[]
  props?: Record<string, any>
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

export class Resource {
  protected model: ModelDefinition
  protected title: string
  protected singularLabel: string
  protected pluralLabel: string
  protected fields: Field[] = []
  protected actions: Action[] = []
  protected filters: Filter[] = []
  protected perPageOptions = [10, 25, 50, 100]
  protected defaultPerPage = 10
  protected searchable = true
  protected sortable = true

  constructor(model: ModelDefinition) {
    this.model = model
    this.title = `Administración de ${model.name}`
    this.singularLabel = model.name
    this.pluralLabel = `${model.name}s`
  }

  // Métodos para configurar el recurso
  public setTitle(title: string): this {
    this.title = title

    return this
  }

  public setLabels(singular: string, plural: string): this {
    this.singularLabel = singular
    this.pluralLabel = plural

    return this
  }

  public addField(field: Field): this {
    this.fields.push(field)

    return this
  }

  public addAction(action: Action): this {
    this.actions.push(action)

    return this
  }

  public addFilter(filter: Filter): this {
    this.filters.push(filter)

    return this
  }

  public setDefaultPerPage(value: number): this {
    this.defaultPerPage = value

    return this
  }

  public setSearchable(searchable: boolean): this {
    this.searchable = searchable

    return this
  }

  public setSortable(sortable: boolean): this {
    this.sortable = sortable

    return this
  }

  // Getters para acceder a la configuración
  public getModel(): ModelDefinition {
    // Convertimos los fields de array a objeto para mantener compatibilidad
    const fieldsObject: Record<string, any> = {}

    this.fields.forEach(field => {
      fieldsObject[field.name] = {
        type: this.getFieldType(field.component),
        label: field.label,
        required: field.rules?.includes('required'),
        placeholder: field.props?.placeholder,
        options: field.props?.items ? { items: field.props.items } : undefined,
        list: {
          visible: field.showOnIndex !== false,
        },
        create: {
          visible: field.showOnCreate !== false,
          rules: field.rules,
          defaultValue: field.props?.defaultValue,
        },
        edit: {
          visible: field.showOnUpdate !== false,
          rules: field.rules,
        },
      }
    })

    return {
      ...this.model,
      fields: fieldsObject,
    }
  }

  private getFieldType(component: string): string {
    switch (component) {
      case 'text-field':
        return 'text'
      case 'select-field':
        return 'enum'
      case 'date-field':
        return 'date'
      default:
        return 'text'
    }
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

  public getFields(): Field[] {
    return this.fields
  }

  public getActions(): Action[] {
    return this.actions
  }

  public getFilters(): Filter[] {
    return this.filters
  }

  public getPerPageOptions(): number[] {
    return this.perPageOptions
  }

  public getDefaultPerPage(): number {
    return this.defaultPerPage
  }

  public isSearchable(): boolean {
    return this.searchable
  }

  public isSortable(): boolean {
    return this.sortable
  }

  // Helpers para obtener campos según el contexto
  public getIndexFields(): Field[] {
    return this.fields.filter(field => field.showOnIndex !== false)
  }

  public getDetailFields(): Field[] {
    return this.fields.filter(field => field.showOnDetail !== false)
  }

  public getCreateFields(): Field[] {
    return this.fields.filter(field => field.showOnCreate !== false)
  }

  public getUpdateFields(): Field[] {
    return this.fields.filter(field => field.showOnUpdate !== false)
  }
}
