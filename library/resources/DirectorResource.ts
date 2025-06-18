import { Fields } from './components/fields'
import type { FormField } from './components/FormField'
import { type ApiConfig, Resource } from './Resource'

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
      resourcePath: '/graduate-insights/v1/api/director',
      idField: 'director_id',
    })

    this.setLabels('Director', 'Directores')
  }

  protected form(): FormField[] {
    return [
      Fields.text('director_id')
        .label('ID')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('user_id')
        .label('ID Usuario')
        .hideOnCreate()
        .hideOnUpdate()
        .sortable(),

      Fields.text('dni')
        .label('DNI')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el DNI'),

      Fields.text('nombres')
        .label('Nombres')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese los nombres'),

      Fields.text('apellidos')
        .label('Apellidos')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese los apellidos'),

      Fields.text('correo')
        .label('Correo electrónico')
        .required()
        .email()
        .sortable()
        .searchable()
        .placeholder('Ingrese el correo electrónico'),

      Fields.select('genero')
        .label('Género')
        .required()
        .sortable()
        .options([
          { value: 'M', title: 'Masculino' },
          { value: 'F', title: 'Femenino' },
        ]),

      Fields.date('fecha_nacimiento')
        .label('Fecha de nacimiento')
        .required()
        .sortable(),

      Fields.text('celular')
        .label('Celular')
        .required()
        .numeric()
        .sortable()
        .placeholder('Ingrese el número de celular'),

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

      Fields.text('contrasena')
        .label('Contraseña')
        .required()
        .min(8)
        .hideOnIndex()
        .password()
        .placeholder('Ingrese la contraseña'),
    ]
  }

  protected configureApi(): Partial<ApiConfig> {
    return {
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
    }
  }
}
