import { type ApiConfig, Resource } from '../../core/Resource'
import { Fields } from '../../fields'
import type { FormField } from '../../fields/FormField'

export interface Graduate {
  graduate_id: number
  user_id: number
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: string
  correo: string
  estado: string
  dni: string
  celular: string
  fecha_inicio: string
  fecha_fin: string
  cv: string
  cv_path?: File | null
  contrasena?: string
}

export class GraduateResource extends Resource {
  constructor() {
    super({
      name: 'graduates',
      resourcePath: '/graduate-insights/v1/api/graduate',
      idField: 'graduate_id',
      perPage: 10,
      sortable: true,
      filterable: true,
    })

    this.setLabels('Graduado', 'Graduados')
  }

  protected override form(): FormField[] {
    return [
      Fields.text('graduate_id')
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

      Fields.date('fecha_inicio')
        .label('Fecha de inicio')
        .required()
        .sortable(),

      Fields.date('fecha_fin')
        .label('Fecha de fin')
        .required()
        .sortable(),

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

      Fields.text('cv')
        .label('cv')
        .required()
        .placeholder('Ingrese CV')
        .hideOnIndex()
        .hideOnCreate(),

      Fields.file('cv_path')
        .label('Archivo CV')
        .accept(['.pdf', '.doc', '.docx'])
        .maxSize(5120) // 5MB
        .placeholder('Seleccionar archivo CV')
        .hideOnIndex()
        .hideOnCreate(),

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
      mapResponse: (d: any): Graduate => ({
        graduate_id: d.graduate_id,
        user_id: d.user_id,
        nombres: d.nombres,
        apellidos: d.apellidos,
        fecha_nacimiento: d.fecha_nacimiento,
        genero: d.genero,
        correo: d.correo,
        estado: d.estado,
        dni: d.dni,
        celular: d.celular,
        fecha_inicio: d.fecha_inicio,
        fecha_fin: d.fecha_fin,
        contrasena: d.contrasena,
        cv: d.cv,
        cv_path: d.cv_path, // El archivo no viene del servidor
      }),
    }
  }
}
