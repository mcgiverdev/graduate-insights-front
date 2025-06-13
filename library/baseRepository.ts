import { ref } from 'vue'

export interface ApiResponse<T> {
  data: T[]
  paginate: {
    totalElements: number
    totalPages: number
    currentPage: number
  }
}

export interface SingleApiResponse<T> {
  data: T
}

export interface ApiError {
  success: false
  message: string
  error?: any
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data?: T
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

export interface BaseRepositoryOptions {
  baseURL: string
  resourcePath: string
  mapFunction?: (item: any) => any
}

export interface PaginationOptions {
  page: number
  size: number
}

export type ApiMethod = 'get' | 'post' | 'put' | 'delete'

export type ApiFunction = (url: string, options?: any) => Promise<any>

export class BaseRepository<T> {
  protected items = ref<T[]>([])
  protected totalItems = ref(0)
  protected loadingList = ref(false)
  protected loadingForm = ref(false)
  protected loadingSave = ref(false)

  constructor(
    protected options: BaseRepositoryOptions,
    private useApi: ApiFunction,
  ) {}

  protected getFullPath(suffix = '') {
    return `${this.options.baseURL}${this.options.resourcePath}${suffix}`
  }

  protected handleError(error: any, defaultMessage: string): ApiError {
    return {
      success: false,
      message: error.data?.message || defaultMessage,
      error: error.data || error,
    }
  }

  async fetchItems({ page, size }: PaginationOptions) {
    this.loadingList.value = true

    const realSize = size === -1 ? 1000 : size

    try {
      const response = await this.useApi(
        this.getFullPath(`?page=${page}&size=${realSize}`),
        { method: 'get' },
      )

      if (response && Array.isArray(response.data)) {
        this.items.value = this.options.mapFunction
          ? response.data.map(this.options.mapFunction)
          : response.data
        this.totalItems.value = response.paginate?.totalElements || 0
      }
      else {
        this.items.value = []
        this.totalItems.value = 0
      }
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

  async getItem(id: number): Promise<T | null> {
    this.loadingForm.value = true
    try {
      const response = await this.useApi(
        this.getFullPath(`/${id}`),
        { method: 'get' },
      )

      return this.options.mapFunction
        ? this.options.mapFunction(response.data)
        : response.data
    }
    catch (error) {
      return null
    }
    finally {
      this.loadingForm.value = false
    }
  }

  async addItem(item: Partial<T>): Promise<ApiResult<T>> {
    this.loadingSave.value = true
    try {
      return await this.useApi(
        this.getFullPath(),
        {
          method: 'post',
          body: item,
        },
      )
    }
    catch (error: any) {
      return this.handleError(error, 'Error al guardar')
    }
    finally {
      this.loadingSave.value = false
    }
  }

  async updateItem(id: number, item: Partial<T>): Promise<ApiResult<T>> {
    this.loadingSave.value = true
    try {
      return await this.useApi(
        this.getFullPath(`/${id}`),
        {
          method: 'put',
          body: item,
        },
      )
    }
    catch (error: any) {
      return this.handleError(error, 'Error al actualizar')
    }
    finally {
      this.loadingSave.value = false
    }
  }

  async deleteItem(id: number): Promise<ApiResult<void>> {
    this.loadingSave.value = true
    try {
      return await this.useApi(
        this.getFullPath(`/${id}`),
        { method: 'delete' },
      )
    }
    catch (error: any) {
      return this.handleError(error, 'Error al eliminar')
    }
    finally {
      this.loadingSave.value = false
    }
  }

  getState() {
    return {
      items: this.items,
      totalItems: this.totalItems,
      loadingList: this.loadingList,
      loadingForm: this.loadingForm,
      loadingSave: this.loadingSave,
    }
  }
}
