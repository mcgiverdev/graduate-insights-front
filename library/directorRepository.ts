import { BaseRepository } from './baseRepository'
import { CrudController } from './controllers/CrudController'
import { DirectorModel } from './models/DirectorModel'
import type { Director } from '@/composables/useDirectorService'
import { useApi } from '@/composables/useApi'

export class DirectorRepository extends BaseRepository<Director> {
  private crudController: CrudController

  constructor() {
    super(
      {
        baseURL: '',
        resourcePath: '/graduate-insights/v1/api/director',
        mapFunction: (d: any): Director => ({
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
      useApi,
    )

    this.crudController = new CrudController(DirectorModel, '/graduate-insights/v1/api')
  }

  override async fetchItems({ page }: { page: number; size: number }) {
    this.loadingList.value = true
    try {
      const response = await this.crudController.list(page)

      this.items.value = response.data.map(this.options.mapFunction!)
      this.totalItems.value = response.total
    }
    catch (error) {
      this.items.value = []
      this.totalItems.value = 0
      throw error
    }
    finally {
      this.loadingList.value = false
    }
  }

  override async getItem(id: number): Promise<Director | null> {
    this.loadingForm.value = true
    try {
      const response = await this.crudController.get(id)

      return this.options.mapFunction!(response)
    }
    catch (error) {
      return null
    }
    finally {
      this.loadingForm.value = false
    }
  }

  override async addItem(item: Partial<Director>) {
    this.loadingSave.value = true
    try {
      const response = await this.crudController.create(item)

      return {
        success: true,
        message: 'Director creado exitosamente',
        data: this.options.mapFunction!(response),
      }
    }
    catch (error: any) {
      return this.handleError(error, 'Error al crear el director')
    }
    finally {
      this.loadingSave.value = false
    }
  }

  override async updateItem(id: number, item: Partial<Director>) {
    this.loadingSave.value = true
    try {
      const response = await this.crudController.update(id, item)

      return {
        success: true,
        message: 'Director actualizado exitosamente',
        data: this.options.mapFunction!(response),
      }
    }
    catch (error: any) {
      return this.handleError(error, 'Error al actualizar el director')
    }
    finally {
      this.loadingSave.value = false
    }
  }

  override async deleteItem(id: number) {
    this.loadingSave.value = true
    try {
      await this.crudController.delete(id)

      return {
        success: true,
        message: 'Director eliminado exitosamente',
      }
    }
    catch (error: any) {
      return this.handleError(error, 'Error al eliminar el director')
    }
    finally {
      this.loadingSave.value = false
    }
  }
}

// Composable para usar el repositorio
export function useDirectorRepository() {
  const repository = new DirectorRepository()

  return {
    ...repository.getState(),
    fetchDirectors: repository.fetchItems.bind(repository),
    getDirector: repository.getItem.bind(repository),
    addDirector: repository.addItem.bind(repository),
    updateDirector: repository.updateItem.bind(repository),
    deleteDirector: repository.deleteItem.bind(repository),
  }
}
