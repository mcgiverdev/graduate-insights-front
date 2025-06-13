import { type Ref, ref } from 'vue'
import { CrudController } from '../controllers/CrudController'
import type { ModelDefinition } from '../types/ModelDefinition'

export interface RepositoryState<T> {
  items: Ref<T[]>
  totalItems: Ref<number>
  loadingList: Ref<boolean>
  loadingForm: Ref<boolean>
  loadingSave: Ref<boolean>
  fetchItems: (options: { page: number; size: number }) => Promise<void>
  getItem: (id: number) => Promise<T | null>
  addItem: (item: Partial<T>) => Promise<any>
  updateItem: (id: number, item: Partial<T>) => Promise<any>
  deleteItem: (id: number) => Promise<any>
}

export class GenericRepository<T> {
  private crudController: CrudController
  protected items = ref<T[]>([])
  protected totalItems = ref(0)
  protected loadingList = ref(false)
  protected loadingForm = ref(false)
  protected loadingSave = ref(false)

  constructor(private modelDefinition: ModelDefinition) {
    this.crudController = new CrudController(
      modelDefinition,
      modelDefinition.api.baseURL || '',
    )
  }

  async fetchItems({ page, size }: { page: number; size: number }) {
    this.loadingList.value = true
    try {
      const response = await this.crudController.list(page, size)

      console.log('Response from API:', response)

      this.items.value = response.data.map(item =>
        this.modelDefinition.api.mapResponse
          ? this.modelDefinition.api.mapResponse(item)
          : item,
      )
      this.totalItems.value = response.total
      console.log('Updated state:', this.getState())
    }
    catch (error) {
      console.error('Error fetching items:', error)
      this.items.value = []
      this.totalItems.value = 0
      throw error
    }
    finally {
      this.loadingList.value = false
    }
  }

  async getItem(id: number): Promise<T | null> {
    this.loadingForm.value = true
    try {
      const response = await this.crudController.get(id)

      if (!response)
        return null

      if (this.modelDefinition.api.mapResponse)
        return this.modelDefinition.api.mapResponse(response)

      return response
    }
    catch (error) {
      console.error('Error al obtener el item:', error)

      return null
    }
    finally {
      this.loadingForm.value = false
    }
  }

  async addItem(item: Partial<T>) {
    this.loadingSave.value = true
    try {
      const dataToSend = this.modelDefinition.api.mapRequest
        ? this.modelDefinition.api.mapRequest(item)
        : item

      await this.crudController.create(dataToSend)

      return true
    }
    catch (error: any) {
      console.error('Error al crear el item:', error)
      throw new Error(error.message || `Error al crear ${this.modelDefinition.name}`)
    }
    finally {
      this.loadingSave.value = false
    }
  }

  async updateItem(id: number, item: Partial<T>) {
    this.loadingSave.value = true
    try {
      const dataToSend = this.modelDefinition.api.mapRequest
        ? this.modelDefinition.api.mapRequest(item)
        : item

      await this.crudController.update(id, dataToSend)

      return true
    }
    catch (error: any) {
      console.error('Error al actualizar el item:', error)
      throw new Error(error.message || `Error al actualizar ${this.modelDefinition.name}`)
    }
    finally {
      this.loadingSave.value = false
    }
  }

  async deleteItem(id: number) {
    this.loadingSave.value = true
    try {
      await this.crudController.delete(id)

      return true
    }
    catch (error: any) {
      console.error('Error al eliminar el item:', error)
      throw new Error(error.message || `Error al eliminar ${this.modelDefinition.name}`)
    }
    finally {
      this.loadingSave.value = false
    }
  }

  getState(): RepositoryState<T> {
    return {
      items: this.items,
      totalItems: this.totalItems,
      loadingList: this.loadingList,
      loadingForm: this.loadingForm,
      loadingSave: this.loadingSave,
      fetchItems: this.fetchItems.bind(this),
      getItem: this.getItem.bind(this),
      addItem: this.addItem.bind(this),
      updateItem: this.updateItem.bind(this),
      deleteItem: this.deleteItem.bind(this),
    }
  }
}

// Hook composable para crear un repositorio genérico
export function useGenericRepository<T>(modelDefinition: ModelDefinition) {
  const repository = new GenericRepository<T>(modelDefinition)

  return repository.getState()
}
