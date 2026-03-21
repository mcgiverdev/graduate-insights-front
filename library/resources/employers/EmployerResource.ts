import { type ApiConfig, Resource } from '../../core/Resource'
import { Fields } from '../../fields'
import type { FormField } from '../../fields/FormField'

export interface Employer {
  employer_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: string
  correo: string
  estado: string
  dni: string
  celular: string
  ruc: string
  razon_social: string
  contrasena?: string
}

export class EmployerResource extends Resource {
  constructor() {
    super({
      name: 'employers',
      resourcePath: '/graduate-insights/v1/api/employer',
      idField: 'employer_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Empleador', 'Empleadores')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('employer_id')
        .label('ID')
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

      Fields.text('ruc')
        .label('RUC')
        .required()
        .numeric()
        .sortable()
        .searchable()
        .placeholder('Ingrese el RUC de la empresa'),

      Fields.text('razon_social')
        .label('Razón social')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese la razón social de la empresa'),

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

  public override configureApi(): Partial<ApiConfig> {
    return {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mapResponse: (d: any): Employer => ({
        employer_id: d.employer_id,
        user_id: d.user_id,
        nombres: d.nombres,
        apellidos: d.apellidos,
        fecha_nacimiento: d.fecha_nacimiento,
        genero: d.genero,
        correo: d.correo,
        estado: d.estado,
        dni: d.dni,
        celular: d.celular,
        ruc: d.ruc,
        razon_social: d.razon_social,
        contrasena: d.contrasena,
      }),
    }
  }
}
