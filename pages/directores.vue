<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  DirectorFormDialog,
  DirectorTable,
  useDirectorEditor,
  useDirectorForm,
  useDirectorList,
} from '@/src/features/directors'

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

const isConfirmVisible = ref(false)
const directorIdToDelete = ref<number | null>(null)
const {
  isFormVisible,
  selectedDirector,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useDirectorEditor({
  fetchDirectors,
  saveDirector,
  clearServerErrors,
})

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
