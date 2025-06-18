import { Resource } from './Resource'

export interface Director {
  director_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: string
  correo: string
  estado: string
  dni: string
  celular: string
  contrasena?: string
}

export class DirectorResource extends Resource {
  constructor() {
    super({
      name: 'directors',
      api: {
        baseURL: '',
        resourcePath: '/graduate-insights/v1/api/director',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mapResponse: (d: any): Director => ({
          director_id: d.director_id,
          user_id: d.user_id,
          nombres: d.nombres,
          apellidos: d.apellidos,
          fecha_nacimiento: d.fecha_nacimiento,
          genero: d.genero,
          correo: d.correo,
          estado: d.estado,
          dni: d.dni,
          celular: d.celular,
          contrasena: d.contrasena,
        }),
        successCodes: {
          create: [201],
          update: [204],
          delete: [204],
          list: [200],
          get: [200],
        },
      },
      options: {
        perPage: 10,
        sortable: true,
        filterable: true,
        idField: 'director_id',
      },
    })

    this
      .setLabels('Director', 'Directores')
      .setSearchable(true)
      .addField({
        name: 'director_id',
        label: 'ID',
        component: 'text-field',
        showOnCreate: false,
        showOnUpdate: false,
        showOnIndex: true,
      })
      .addField({
        name: 'user_id',
        label: 'ID Usuario',
        component: 'text-field',
        showOnCreate: false,
        showOnUpdate: false,
        showOnIndex: true,
      })
      .addField({
        name: 'dni',
        label: 'DNI',
        component: 'text-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        searchable: true,
        rules: ['required'],
        props: {
          placeholder: 'Ingrese el DNI',
        },
      })
      .addField({
        name: 'nombres',
        label: 'Nombres',
        component: 'text-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        searchable: true,
        rules: ['required'],
        props: {
          placeholder: 'Ingrese los nombres',
        },
      })
      .addField({
        name: 'apellidos',
        label: 'Apellidos',
        component: 'text-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        searchable: true,
        rules: ['required'],
        props: {
          placeholder: 'Ingrese los apellidos',
        },
      })
      .addField({
        name: 'correo',
        label: 'Correo electrónico',
        component: 'text-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        searchable: true,
        rules: ['required', 'email'],
        props: {
          placeholder: 'Ingrese el correo electrónico',
        },
      })
      .addField({
        name: 'genero',
        label: 'Género',
        component: 'select-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        rules: ['required'],
        props: {
          items: [
            { value: 'M', title: 'Masculino' },
            { value: 'F', title: 'Femenino' },
          ],
        },
      })
      .addField({
        name: 'fecha_nacimiento',
        label: 'Fecha de nacimiento',
        component: 'date-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        rules: ['required', 'date'],
      })
      .addField({
        name: 'celular',
        label: 'Celular',
        component: 'text-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: true,
        sortable: true,
        rules: ['required', 'numeric'],
        props: {
          placeholder: 'Ingrese el número de celular',
        },
      })
      .addField({
        name: 'estado',
        label: 'Estado',
        component: 'select-field',
        showOnCreate: false,
        showOnUpdate: false,
        showOnIndex: false,
        sortable: true,
        rules: ['required'],
        props: {
          items: [
            { value: '1', title: 'Activo' },
            { value: '0', title: 'Inactivo' },
          ],
          defaultValue: '1',
        },
      })
      .addField({
        name: 'contrasena',
        label: 'Contraseña',
        component: 'text-field',
        showOnCreate: true,
        showOnUpdate: true,
        showOnIndex: false,
        rules: ['required', 'min:8'],
        props: {
          placeholder: 'Ingrese la contraseña',
          type: 'password',
        },
      })
  }
}
