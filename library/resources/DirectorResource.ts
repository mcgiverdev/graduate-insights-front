import { DirectorModel } from '../models/DirectorModel'
import { Resource } from './Resource'

export class DirectorResource extends Resource {
  constructor() {
    super(DirectorModel)

    this
      .setLabels('Director', 'Directores')
      .setSearchable(true)
      .addField({
        name: 'director_id',
        label: 'ID',
        component: 'text-field',
        showOnCreate: false,
        showOnUpdate: false,
      })
      .addField({
        name: 'name',
        label: 'Nombre',
        component: 'text-field',
        sortable: true,
        searchable: true,
        rules: ['required'],
      })
      .addField({
        name: 'email',
        label: 'Correo electrónico',
        component: 'text-field',
        sortable: true,
        searchable: true,
        rules: ['required', 'email'],
      })
      .addField({
        name: 'phone',
        label: 'Teléfono',
        component: 'text-field',
        rules: ['required'],
      })
      .addField({
        name: 'status',
        label: 'Estado',
        component: 'select-field',
        sortable: true,
        props: {
          items: [
            { value: 'active', title: 'Activo' },
            { value: 'inactive', title: 'Inactivo' },
          ],
        },
      })
  }
}
