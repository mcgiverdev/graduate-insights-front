<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import DirectorFormDialog from '@/modules/directors/components/DirectorFormDialog.vue'
import DirectorTable from '@/modules/directors/components/DirectorTable.vue'
import { useDirectorForm } from '@/modules/directors/composables/useDirectorForm'
import { useDirectorList } from '@/modules/directors/composables/useDirectorList'
import type { Director, DirectorFormValues } from '@/modules/directors/types'
import { toPayload } from '@/modules/directors/utils/mappers'
import { directorService } from '@/modules/directors/services/DirectorService'

definePageMeta({
  layout: 'default',
})

const {
  items,
  loading,
  search,
  pagination,
  setPage,
  setItemsPerPage,
  setSearch,
  deleteDirector,
  fetchDirectors,
} = useDirectorList()

const { submitting, serverErrors, saveDirector, clearServerErrors } = useDirectorForm()

const isFormVisible = ref(false)
const selectedDirector = ref<Director | null>(null)
const isConfirmVisible = ref(false)
const directorIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const openCreateForm = () => {
  selectedDirector.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (directorId: number) => {
  clearServerErrors()
  selectedDirector.value = null
  isFormVisible.value = true

  try {
    const director = await directorService.getById(directorId)

    if (!director) {
      showSnackbar({ text: 'No se encontró el director seleccionado', color: 'error' })
      isFormVisible.value = false
      return
    }

    selectedDirector.value = director
  }
  catch (error) {
    console.error('Error al obtener director', error)
    showSnackbar({ text: 'No se pudo cargar el director', color: 'error' })
    isFormVisible.value = false
  }
}

const handleFormSubmit = async (values: DirectorFormValues) => {
  const payload = toPayload(values)
  const result = await saveDirector(payload, selectedDirector.value?.directorId)

  if (result.success) {
    isFormVisible.value = false
    selectedDirector.value = null
    await fetchDirectors()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedDirector.value = null
}

const requestDelete = (directorId: number) => {
  directorIdToDelete.value = directorId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (directorIdToDelete.value === null)
    return

  await deleteDirector(directorIdToDelete.value)
  isConfirmVisible.value = false
  directorIdToDelete.value = null
}
</script>

<template>
  <section>
    <DirectorTable
      :items="items"
      :loading="loading"
      :page="pagination.page"
      :items-per-page="pagination.itemsPerPage"
      :total-items="pagination.totalItems"
      :search="search"
      @update:page="setPage"
      @update:items-per-page="setItemsPerPage"
      @update:search="setSearch"
      @create="openCreateForm"
      @edit="openEditForm"
      @delete="requestDelete"
    />

    <DirectorFormDialog
      v-model="isFormVisible"
      :director="selectedDirector"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar director"
      text="¿Seguro que deseas eliminar este director? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
