import { type ApiConfig, Resource } from '../../core/Resource'
import { Fields } from '../../fields'
import type { FormField } from '../../fields/FormField'

export interface MyJob {
  job_id: number
  compania: string
  estado: string
  cargo: string
  modalidad: string
  fecha_inicio: string
  fecha_fin: string
}

export class MyJobResource extends Resource {
  constructor() {
    super({
      name: 'mis-empleos',
      resourcePath: '/graduate-insights/v1/api/jobs',
      idField: 'job_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Mi Trabajo', 'Mis Trabajos')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('job_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('compania')
        .label('Compañía')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el nombre de la compañía'),

      Fields.text('cargo')
        .label('Cargo')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el cargo'),

      Fields.select('modalidad')
        .label('Modalidad')
        .required()
        .sortable()
        .options([
          { value: 'Presencial', title: 'Presencial' },
          { value: 'Remoto', title: 'Remoto' },
          { value: 'Híbrido', title: 'Híbrido' },
        ]),

      Fields.date('fecha_inicio')
        .label('Fecha de inicio')
        .required()
        .sortable(),

      Fields.date('fecha_fin')
        .label('Fecha de fin')
        .sortable(),

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
      mapResponse: (d: any): MyJob => ({
        job_id: d.job_id,
        compania: d.compania,
        estado: d.estado,
        cargo: d.cargo,
        modalidad: d.modalidad,
        fecha_inicio: d.fecha_inicio,
        fecha_fin: d.fecha_fin,
      }),
    }
  }
}
