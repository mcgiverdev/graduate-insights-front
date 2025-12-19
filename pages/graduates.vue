<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import GraduateFormDialog from '@/modules/graduates/components/GraduateFormDialog.vue'
import GraduateTable from '@/modules/graduates/components/GraduateTable.vue'
import { useGraduateForm } from '@/modules/graduates/composables/useGraduateForm'
import { useGraduateList } from '@/modules/graduates/composables/useGraduateList'
import type { Graduate, GraduateFormValues } from '@/modules/graduates/types'
import { toPayload } from '@/modules/graduates/utils/mappers'
import { graduateService } from '@/modules/graduates/services/GraduateService'

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

const isFormVisible = ref(false)
const selectedGraduate = ref<Graduate | null>(null)
const isConfirmVisible = ref(false)
const graduateIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const openCreateForm = () => {
  selectedGraduate.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (graduateId: number) => {
  clearServerErrors()
  selectedGraduate.value = null
  isFormVisible.value = true

  try {
    const graduate = await graduateService.getById(graduateId)

    if (!graduate) {
      showSnackbar({ text: 'No se encontró el graduado seleccionado', color: 'error' })
      isFormVisible.value = false
      return
    }

    selectedGraduate.value = graduate
  }
  catch (error) {
    console.error('Error al obtener el graduado', error)
    showSnackbar({ text: 'No se pudo cargar el graduado', color: 'error' })
    isFormVisible.value = false
  }
}

const handleFormSubmit = async (values: GraduateFormValues) => {
  const payload = toPayload(values)
  const result = await saveGraduate(payload, selectedGraduate.value?.graduateId)

  if (result.success) {
    isFormVisible.value = false
    selectedGraduate.value = null
    await fetchGraduates()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedGraduate.value = null
}

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
