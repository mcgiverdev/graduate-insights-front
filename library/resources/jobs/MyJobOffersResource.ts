import { type ApiConfig, Resource } from '../../core/Resource'
import { Fields } from '../../fields'
import type { FormField } from '../../fields/FormField'

export interface MyJobOffers {
  job_offers_id: number
  titulo: string
  link: string
  descripcion: string
  estado: string
}

export class MyJobOffersResource extends Resource {
  constructor() {
    super({
      name: 'mis-ofertas-empleo',
      resourcePath: '/graduate-insights/v1/api/job-offers',
      idField: 'job_offers_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Mi Oferta Laboral', 'Mis Ofertas Laborales')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('job_offers_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('titulo')
        .label('Título')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el título de la oferta laboral'),

      Fields.text('link')
        .label('Enlace')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el enlace de la oferta'),

      Fields.textarea('descripcion')
        .label('Descripción')
        .required()
        .searchable()
        .placeholder('Ingrese la descripción de la oferta laboral'),

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
      mapResponse: (d: any): MyJobOffers => ({
        job_offers_id: d.job_offers_id,
        titulo: d.titulo,
        link: d.link,
        descripcion: d.descripcion,
        estado: d.estado,
      }),
    }
  }
}
