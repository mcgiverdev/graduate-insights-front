import { type ApiConfig, Resource } from '../../core/Resource'
import type { FormField } from '@/library'
import { Fields } from '@/library'

export interface EventType {
  event_type_id: number
  nombre: number
}

export class EventTypeResource extends Resource {
  constructor() {
    super({
      name: 'event_types',
      resourcePath: '/graduate-insights/v1/api/event_types',
      idField: 'event_type_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Tipo de evento', 'Tipo de evento')
  }

  protected form(): FormField[] {
    return [
      Fields.text('event_type_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),
      Fields.text('nombre')
        .label('Nombre')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el Nombre'),
      Fields.select('estado')
        .label('Estado')
        .required()
        .sortable()
        .options([
          { value: '1', title: 'Activo' },
          { value: '0', title: 'Inactivo' },
        ])
        .default('1'),
    ]
  }

  public override configureApi(): Partial<ApiConfig> {
    return {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mapResponse: (d: any): EventType => ({
        event_type_id: d.event_type_id,
        nombre: d.nombre,
      }),
    }
  }
}
