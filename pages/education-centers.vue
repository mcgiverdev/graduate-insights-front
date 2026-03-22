<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  EducationCenterFormDialog,
  EducationCenterTable,
  useEducationCenterEditor,
  useEducationCenterForm,
  useEducationCenterList,
} from '@/src/features/education-centers'

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
  deleteEducationCenter,
  fetchEducationCenters,
} = useEducationCenterList()

const { submitting, serverErrors, saveEducationCenter, clearServerErrors } = useEducationCenterForm()

const isConfirmVisible = ref(false)
const educationCenterIdToDelete = ref<number | null>(null)
const {
  isFormVisible,
  selectedEducationCenter,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useEducationCenterEditor({
  fetchEducationCenters,
  saveEducationCenter,
  clearServerErrors,
})

const requestDelete = (educationCenterId: number) => {
  educationCenterIdToDelete.value = educationCenterId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (educationCenterIdToDelete.value === null)
    return

  await deleteEducationCenter(educationCenterIdToDelete.value)
  isConfirmVisible.value = false
  educationCenterIdToDelete.value = null
}
</script>

<template>
  <section>
    <EducationCenterTable
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

    <EducationCenterFormDialog
      v-model="isFormVisible"
      :education-center="selectedEducationCenter"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar centro educativo"
      text="¿Seguro que deseas eliminar este centro educativo? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
