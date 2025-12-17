<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import EducationCenterFormDialog from '@/modules/education-centers/components/EducationCenterFormDialog.vue'
import EducationCenterTable from '@/modules/education-centers/components/EducationCenterTable.vue'
import { useEducationCenterForm } from '@/modules/education-centers/composables/useEducationCenterForm'
import { useEducationCenterList } from '@/modules/education-centers/composables/useEducationCenterList'
import type { EducationCenter, EducationCenterFormValues } from '@/modules/education-centers/types'
import { toPayload } from '@/modules/education-centers/utils/mappers'
import { educationCenterService } from '@/modules/education-centers/services/EducationCenterService'

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

const isFormVisible = ref(false)
const selectedEducationCenter = ref<EducationCenter | null>(null)
const isConfirmVisible = ref(false)
const educationCenterIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const openCreateForm = () => {
  selectedEducationCenter.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (educationCenterId: number) => {
  clearServerErrors()
  selectedEducationCenter.value = null
  isFormVisible.value = true

  try {
    const center = await educationCenterService.getById(educationCenterId)

    if (!center) {
      showSnackbar({ text: 'No se encontró el centro educativo seleccionado', color: 'error' })
      isFormVisible.value = false
      return
    }

    selectedEducationCenter.value = center
  }
  catch (error) {
    console.error('Error al obtener centro educativo', error)
    showSnackbar({ text: 'No se pudo cargar el centro educativo', color: 'error' })
    isFormVisible.value = false
  }
}

const handleFormSubmit = async (values: EducationCenterFormValues) => {
  const payload = toPayload(values)
  const result = await saveEducationCenter(payload, selectedEducationCenter.value?.educationCenterId)

  if (result.success) {
    isFormVisible.value = false
    selectedEducationCenter.value = null
    await fetchEducationCenters()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedEducationCenter.value = null
}

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
