// Interfaz base para todos los tipos de campo
export interface BaseFieldType {
  type: string
  validate?: (value: any) => boolean | string
  format?: (value: any) => any
  parse?: (value: any) => any
}

export type FieldType = 'text' | 'email' | 'password' | 'date' | 'time' | 'date-time' | 'enum' | 'number' | 'tel' | 'belongs'

export interface BaseFieldConfig {
  type?: string
  validate?: (value: any) => true | string
  format?: (value: any) => string
  parse?: (value: any) => any
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text'
}

export interface EmailFieldConfig extends BaseFieldConfig {
  type: 'email'
}

export interface PasswordFieldConfig extends BaseFieldConfig {
  type: 'password'
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date' | 'time' | 'date-time'
  config?: {
    enableTime?: boolean
    noCalendar?: boolean
    dateFormat?: string
  }
}

export interface EnumFieldConfig extends BaseFieldConfig {
  type: 'enum'
  items: Array<{
    title: string
    value: string | number
  }>
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number'
}

export interface TelFieldConfig extends BaseFieldConfig {
  type: 'tel'
}

export interface BelongsFieldConfig extends BaseFieldConfig {
  type: 'belongs'
  apiEndpoint: string
  items?: Array<{
    key: string | number
    value: string
  }>
}

export type FieldTypeConfig =
  | TextFieldConfig
  | EmailFieldConfig
  | PasswordFieldConfig
  | DateFieldConfig
  | EnumFieldConfig
  | NumberFieldConfig
  | TelFieldConfig
  | BelongsFieldConfig

// Clase para manejar el registro de tipos de campo
export class FieldTypeRegistry {
  private static types = new Map<FieldType, BaseFieldConfig>([
    ['text', {
      type: 'text',
      validate: (value: any) => typeof value === 'string' || 'Debe ser un texto',
      format: (value: any) => String(value),
      parse: (value: any) => value?.toString() || '',
    }],
    ['email', {
      type: 'email',
      validate: (value: any) => {
        if (typeof value !== 'string')
          return 'Debe ser un texto'
        if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value))
          return 'Debe ser un correo válido'

        return true
      },
    }],
    ['password', {
      type: 'password',
      validate: (value: any) => typeof value === 'string' || 'Debe ser un texto',
    }],
    ['date', {
      type: 'date',
      validate: (value: any) => {
        if (!value)
          return true
        if (typeof value !== 'string')
          return 'Debe ser una fecha'
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
          return 'Formato de fecha inválido (YYYY-MM-DD)'

        return true
      },
      format: (value: any) => {
        if (!value)
          return ''

        return new Date(value).toISOString().split('T')[0]
      },
    }],
    ['time', {
      type: 'time',
      validate: (value: any) => {
        if (!value)
          return true
        if (typeof value !== 'string')
          return 'Debe ser una hora'
        if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(value))
          return 'Formato de hora inválido (HH:mm)'

        return true
      },
    }],
    ['date-time', {
      type: 'date-time',
      validate: (value: any) => {
        if (!value)
          return true
        if (typeof value !== 'string')
          return 'Debe ser una fecha y hora'
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))
          return 'Formato de fecha y hora inválido (YYYY-MM-DD HH:mm)'

        return true
      },
      format: (value: any) => {
        if (!value)
          return ''

        return new Date(value).toISOString().replace('T', ' ').slice(0, 16)
      },
    }],
    ['enum', {
      type: 'enum',
      validate: (value: any) => value !== undefined || 'Debe seleccionar una opción',
    }],
    ['number', {
      type: 'number',
      validate: (value: any) => {
        if (typeof value !== 'string' && typeof value !== 'number')
          return 'Debe ser un número'
        if (Number.isNaN(Number(value)))
          return 'Debe ser un número válido'

        return true
      },
      parse: (value: any) => Number(value),
    }],
    ['tel', {
      type: 'tel',
      validate: (value: any) => {
        if (typeof value !== 'string')
          return 'Debe ser un número de teléfono'
        if (!/^\d+$/.test(value))
          return 'Solo debe contener números'

        return true
      },
    }],
  ])

  static register(name: FieldType, config: BaseFieldConfig) {
    this.types.set(name, config)
  }

  static get(name: string): BaseFieldConfig | undefined {
    return this.types.get(name as FieldType)
  }

  static getAll(): Map<FieldType, BaseFieldConfig> {
    return this.types
  }
}
