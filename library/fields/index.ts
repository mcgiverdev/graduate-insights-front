import { FormField } from './FormField'

export class TextField extends FormField {
  constructor(name: string) {
    super(name)
    this._component = 'text-field'
  }

  public email(): this {
    this._rules.push('email')

    return this
  }

  public min(value: number): this {
    this._rules.push(`min:${value}`)

    return this
  }

  public numeric(): this {
    this._rules.push('numeric')

    return this
  }

  public password(): this {
    this._props.type = 'password'

    return this
  }
}

export class SelectField extends FormField {
  constructor(name: string) {
    super(name)
    this._component = 'select-field'
  }

  public options(items: Array<{ value: any; title: string }>): this {
    this._props.items = items

    return this
  }
}

export class DateField extends FormField {
  constructor(name: string) {
    super(name)
    this._component = 'date-field'
  }

  public format(format: string): this {
    this._props.format = format

    return this
  }
}

export class TextareaField extends FormField {
  constructor(name: string) {
    super(name)
    this._component = 'textarea-field'
  }

  public rows(value: number): this {
    this._props.rows = value

    return this
  }
}

export class FileField extends FormField {
  constructor(name: string) {
    super(name)
    this._component = 'file-field'
    this._props.fileType = 'CV' // Valor por defecto

    // Agregar el manejador de errores por defecto
    this._props.onError = (error: string) => {
      console.error(`Error en campo ${name}:`, error)
    }
  }

  public accept(mimeTypes: string[]): this {
    this._props.accept = mimeTypes.join(',')

    return this
  }

  public maxSize(sizeInKB: number): this {
    this._props.maxSize = sizeInKB

    return this
  }

  public graduateId(id: number): this {
    this._props.graduateId = id

    return this
  }

  public fileType(type: string): this {
    this._props.fileType = type

    return this
  }

  public onError(handler: (error: string) => void): this {
    this._props.onError = handler

    return this
  }
}

export class BelongsField extends FormField {
  constructor(name: string) {
    super(name)
    this._component = 'belongs-field'
  }

  public apiEndpoint(endpoint: string): this {
    this._props.apiEndpoint = endpoint

    return this
  }

  public displayField(field: string): this {
    this._props.displayField = field

    return this
  }

  public valueField(field: string): this {
    this._props.valueField = field

    return this
  }
}

export class Fields {
  public static text(name: string): TextField {
    return new TextField(name)
  }

  public static select(name: string): SelectField {
    return new SelectField(name)
  }

  public static date(name: string): DateField {
    return new DateField(name)
  }

  public static textarea(name: string): TextareaField {
    return new TextareaField(name)
  }

  public static file(name: string): FileField {
    return new FileField(name)
  }

  public static belongs(name: string): BelongsField {
    return new BelongsField(name)
  }
}
