import { GenericRepository } from './repository/GenericRepository'
import type { Director } from './resources/DirectorResource'

export class DirectorRepository extends GenericRepository<Director> {
  constructor() {
    super({
      name: 'Director',
      fields: {
        director_id: {
          type: 'text',
          label: 'ID',
          required: false,
          list: { visible: true },
          create: { visible: false },
          edit: { visible: false },
        },
        user_id: {
          type: 'text',
          label: 'ID Usuario',
          required: false,
          list: { visible: true },
          create: { visible: false },
          edit: { visible: false },
        },
        dni: {
          type: 'text',
          label: 'DNI',
          required: true,
          placeholder: 'Ingrese el DNI',
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        nombres: {
          type: 'text',
          label: 'Nombres',
          required: true,
          placeholder: 'Ingrese los nombres',
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        apellidos: {
          type: 'text',
          label: 'Apellidos',
          required: true,
          placeholder: 'Ingrese los apellidos',
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        correo: {
          type: 'text',
          label: 'Correo electrónico',
          required: true,
          placeholder: 'Ingrese el correo electrónico',
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        genero: {
          type: 'select',
          label: 'Género',
          required: true,
          options: {
            items: [
              { value: 'M', title: 'Masculino' },
              { value: 'F', title: 'Femenino' },
            ],
          },
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        fecha_nacimiento: {
          type: 'date',
          label: 'Fecha de nacimiento',
          required: true,
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        celular: {
          type: 'text',
          label: 'Celular',
          required: true,
          placeholder: 'Ingrese el número de celular',
          list: { visible: true },
          create: { visible: true },
          edit: { visible: true },
        },
        estado: {
          type: 'select',
          label: 'Estado',
          required: true,
          options: {
            items: [
              { value: '1', title: 'Activo' },
              { value: '0', title: 'Inactivo' },
            ],
          },
          list: { visible: false },
          create: { visible: false },
          edit: { visible: false },
        },
        contrasena: {
          type: 'text',
          label: 'Contraseña',
          required: true,
          placeholder: 'Ingrese la contraseña',
          list: { visible: false },
          create: { visible: true },
          edit: { visible: true },
        },
      },
      options: {
        perPage: 10,
        sortable: true,
        filterable: true,
        idField: 'director_id',
      },
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
      },
    })
  }
}

export function useDirectorRepository() {
  const repository = new DirectorRepository()

  return repository.getState()
}
