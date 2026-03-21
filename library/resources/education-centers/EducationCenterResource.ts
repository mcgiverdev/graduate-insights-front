import { type ApiConfig, Resource } from '../../core/Resource'
import type { FormField } from '@/library'
import { Fields } from '@/library'

export interface EducationCenter {
  education_center_id: number
  nombre: string
  direccion: string
  estado: string
}

export class EducationCenterResource extends Resource {
  constructor() {
    super({
      name: 'education-centers',
      resourcePath: '/graduate-insights/v1/api/education_center',
      idField: 'education_center_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Centro de Estudios', 'Centros de Estudios')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('education_center_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('nombre')
        .label('Nombre')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el nombre del centro de estudios'),

      Fields.text('direccion')
        .label('Dirección')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese la dirección'),

      Fields.select('estado')
        .label('Estado')
        .hideOnCreate()
        .hideOnUpdate()
        .hideOnIndex()
        .sortable()
        .required()
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
      mapResponse: (d: any): EducationCenter => ({
        education_center_id: d.education_center_id,
        nombre: d.nombre,
        direccion: d.direccion,
        estado: d.estado,
      }),
    }
  }
}
