import type { FieldType } from './FieldType'

export interface FieldOptions {
  items?: Array<{
    title: string
    value: string | number
  }>
}

export interface DisplayConfig {
  visible?: boolean
  defaultValue?: any
  rules?: string[]
}

export interface FieldDefinition {
  type: FieldType
  label: string
  required?: boolean
  placeholder?: string
  options?: FieldOptions
  list?: DisplayConfig
  create?: DisplayConfig
  edit?: DisplayConfig
}

export interface ApiConfig {
  baseURL: string
  resourcePath: string
  headers?: Record<string, string>
  mapResponse?: (data: any) => any
  mapRequest?: (data: any) => any
  successCodes?: {
    list?: number[]
    create?: number[]
    update?: number[]
    delete?: number[]
    get?: number[]
  }
  endpoints?: {
    list?: string
    create?: string
    update?: string
    delete?: string
    get?: string
  }
  extraParams?: Record<string, any>
}

export interface ApiSuccessCodes {
  list?: number[]
  create?: number[]
  update?: number[]
  delete?: number[]
  get?: number[]
}

export interface ModelDefinition {
  name: string
  fields: Record<string, {
    type: string
    label: string
    required?: boolean
    placeholder?: string
    options?: {
      items: Array<{ value: any; title: string }>
    }
    list: {
      visible: boolean
    }
    create: {
      visible: boolean
      rules?: string[]
      defaultValue?: any
    }
    edit: {
      visible: boolean
      rules?: string[]
    }
  }>
  api: {
    baseURL: string
    resourcePath: string
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
  options: {
    perPage: number
    sortable: boolean
    filterable: boolean
    idField: string
  }
}
