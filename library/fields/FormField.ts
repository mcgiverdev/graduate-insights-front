export class FormField {
  protected _name: string
  protected _label: string
  protected _component: string = ''
  protected _showOnCreate = true
  protected _showOnUpdate = true
  protected _showOnIndex = true
  protected _sortable = false
  protected _searchable = false
  protected _rules: string[] = []
  protected _props: Record<string, any> = {}

  constructor(name: string) {
    this._name = name
    this._label = name
  }

  public static make(name: string): FormField {
    return new this(name)
  }

  public label(label: string): this {
    this._label = label

    return this
  }

  public hideOnCreate(): this {
    this._showOnCreate = false

    return this
  }

  public hideOnUpdate(): this {
    this._showOnUpdate = false

    return this
  }

  public hideOnIndex(): this {
    this._showOnIndex = false

    return this
  }

  public sortable(): this {
    this._sortable = true

    return this
  }

  public searchable(): this {
    this._searchable = true

    return this
  }

  public required(): this {
    this._rules.push('required')

    return this
  }

  public rules(rules: string[]): this {
    this._rules = rules

    return this
  }

  public placeholder(text: string): this {
    this._props.placeholder = text

    return this
  }

  public default(value: any): this {
    this._props.defaultValue = value

    return this
  }

  public toField(): any {
    return {
      name: this._name,
      label: this._label,
      component: this._component,
      showOnCreate: this._showOnCreate,
      showOnUpdate: this._showOnUpdate,
      showOnIndex: this._showOnIndex,
      sortable: this._sortable,
      searchable: this._searchable,
      rules: this._rules,
      props: this._props,
    }
  }
}
