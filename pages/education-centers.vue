<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AddEducationCenterDialog from '@/components/dialogs/AddEducationCenterDialog.vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import DataTable from '@/components/tables/DataTable.vue'
import { useEducationCenterService } from '@/composables/useEducationCenterService'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { educationCenters, totalEducationCenters, loadingList, fetchEducationCenters, getEducationCenter, deleteEducationCenter } = useEducationCenterService()

const paginatedEducationCenters = computed(() => educationCenters.value)

const isAddEducationCenterDialogVisible = ref(false)
const educationCenterToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const educationCenterToDelete = ref<number | null>(null)

const columns = [
  { key: 'nombre', label: 'Nombre', width: '300px' },
  { key: 'direccion', label: 'Dirección', width: '300px' },
  {
    key: 'estado',
    label: 'Estado',
    formatter: (item: any) => item.estado === '1' ? 'Activo' : 'Inactivo',
  },
]

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

watch([page, itemsPerPage], () => {
  fetchEducationCenters(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchEducationCenters(page.value, itemsPerPage.value)
})

const openAddEducationCenterDialog = () => {
  educationCenterToEdit.value = null
  isAddEducationCenterDialogVisible.value = true
}

const openEditEducationCenterDialog = async (id: number) => {
  const center = await getEducationCenter(id)

  educationCenterToEdit.value = center
  isAddEducationCenterDialogVisible.value = true
}

const confirmDelete = (item: any) => {
  educationCenterToDelete.value = item.education_center_id
  isConfirmDialogVisible.value = true
}

const handleDeleteEducationCenter = async () => {
  if (!educationCenterToDelete.value)
    return

  const result = await deleteEducationCenter(educationCenterToDelete.value)

  if (result.success) {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
    fetchEducationCenters(page.value, itemsPerPage.value)
  }
  else {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
  }

  isConfirmDialogVisible.value = false
  educationCenterToDelete.value = null
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Administración de Centros Educativos</VCardTitle>
      </VCardItem>
      <VDivider />
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'Todos' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />
        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <VBtn
            prepend-icon="tabler-plus"
            color="primary"
            @click="openAddEducationCenterDialog"
          >
            Nuevo centro educativo
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <DataTable
        :columns="columns"
        :items="paginatedEducationCenters"
        :loading="loadingList"
        :actions="{
          edit: (item) => openEditEducationCenterDialog(item.education_center_id),
          delete: confirmDelete,
        }"
      />
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalEducationCenters"
        @update:page="handlePageChange"
      />
      <AddEducationCenterDialog
        v-model:is-dialog-open="isAddEducationCenterDialogVisible"
        :education-center-to-edit="educationCenterToEdit"
        @success="() => { fetchEducationCenters(page, itemsPerPage); isAddEducationCenterDialogVisible = false }"
        @update:is-dialog-open="val => isAddEducationCenterDialogVisible = val"
      />
      <VSnackbar v-model="isSnackbarVisible">
        {{ snackbarMessage }}
      </VSnackbar>

      <VConfirmDialog
        v-model="isConfirmDialogVisible"
        title="Confirmar eliminación"
        text="¿Estás seguro que deseas eliminar este centro educativo? Esta acción no se puede deshacer."
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        @confirm="handleDeleteEducationCenter"
      />
    </VCard>
  </section>
</template>

<style scoped>
.table-container {
  position: relative;
  overflow-x: auto;
}

.fixed-column {
  position: sticky !important;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
  box-shadow: -2px 0 4px rgba(0, 0, 0, 10%);
  inset-inline-end: 0;
}

:deep(.v-table) {
  inline-size: 100%;
}

:deep(.v-table .v-table__wrapper) {
  overflow-x: auto;
}

:deep(.v-table th),
:deep(.v-table td) {
  padding-block: 0;
  padding-inline: 16px;
}
</style>
