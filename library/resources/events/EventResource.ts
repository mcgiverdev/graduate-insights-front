import { type ApiConfig, Resource } from '../../core/Resource'
import { Fields } from '../../fields'
import type { FormField } from '../../fields/FormField'

export interface Event {
  event_id: number
  nombre: string
  contenido: string
  estado: string
  director_id: number
  director_nombre: string
  event_type_id: number
  event_type_nombre: string
}

export class EventResource extends Resource {
  constructor() {
    super({
      name: 'eventos',
      resourcePath: '/graduate-insights/v1/api/event',
      idField: 'event_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Evento', 'Eventos')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('event_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('nombre')
        .label('Nombre')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el nombre del evento'),

      Fields.textarea('contenido')
        .label('Contenido')
        .required()
        .searchable()
        .placeholder('Ingrese el contenido del evento'),

      Fields.belongs('director_id')
        .label('Director')
        .required()
        .sortable()
        .hideOnIndex()
        .apiEndpoint('/graduate-insights/v1/api/director/list')
        .displayField('value')
        .valueField('key'),

      Fields.belongs('event_type_id')
        .label('Tipo de Evento')
        .required()
        .sortable()
        .apiEndpoint('/graduate-insights/v1/api/event_types/list')
        .displayField('value')
        .valueField('key'),

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
      mapResponse: (d: any): Event => ({
        event_id: d.event_id,
        nombre: d.nombre,
        contenido: d.contenido,
        estado: d.estado,
        director_id: d.director_id,
        director_nombre: d.director_nombre,
        event_type_id: d.event_type_id,
        event_type_nombre: d.event_type_nombre,
      }),
    }
  }
}
