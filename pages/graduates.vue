<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  GraduateFormDialog,
  GraduateTable,
  useGraduateEditor,
  useGraduateForm,
  useGraduateList,
} from '@/src/features/graduates'

definePageMeta({
  middleware: ['auth', 'role'],
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
  showOnlyPending,
  setShowOnlyPending,
  deleteGraduate,
  activateGraduate,
  fetchGraduates,
} = useGraduateList()

const { submitting, serverErrors, saveGraduate, clearServerErrors } = useGraduateForm()

const isConfirmVisible = ref(false)
const graduateIdToDelete = ref<number | null>(null)
const {
  isFormVisible,
  selectedGraduate,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useGraduateEditor({
  fetchGraduates,
  saveGraduate,
  clearServerErrors,
})

const requestDelete = (graduateId: number) => {
  graduateIdToDelete.value = graduateId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (graduateIdToDelete.value === null)
    return

  await deleteGraduate(graduateIdToDelete.value)
  isConfirmVisible.value = false
  graduateIdToDelete.value = null
}
</script>

<template>
  <section>
    <GraduateTable
      :items="items"
      :loading="loading"
      :page="pagination.page"
      :items-per-page="pagination.itemsPerPage"
      :total-items="pagination.totalItems"
      :search="search"
      :show-only-pending="showOnlyPending"
      @update:page="setPage"
      @update:items-per-page="setItemsPerPage"
      @update:search="setSearch"
      @update:show-only-pending="setShowOnlyPending"
      @create="openCreateForm"
      @edit="openEditForm"
      @delete="requestDelete"
      @activate="activateGraduate"
    />

    <GraduateFormDialog
      v-model="isFormVisible"
      :graduate="selectedGraduate"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar graduado"
      text="¿Seguro que deseas eliminar este graduado? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
