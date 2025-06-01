<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AddGraduateDialog from '@/components/dialogs/AddGraduateDialog.vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import { useGraduateService } from '@/composables/useGraduateService'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { graduates, totalGraduates, loadingList, loadingForm, loadingSave, fetchGraduates, addGraduate, getGraduate, updateGraduate, deleteGraduate } = useGraduateService()

const paginatedGraduates = computed(() => graduates.value)

const isAddGraduateDialogVisible = ref(false)
const graduateToEdit = ref<any>(null)

const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const isConfirmDialogVisible = ref(false)
const graduateToDelete = ref<number | null>(null)

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

watch([page, itemsPerPage], () => {
  fetchGraduates(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchGraduates(page.value, itemsPerPage.value)
})

const openAddGraduateDialog = () => {
  graduateToEdit.value = null
  isAddGraduateDialogVisible.value = true
}

const openEditGraduateDialog = async (id: number) => {
  const graduate = await getGraduate(id)

  graduateToEdit.value = graduate
  isAddGraduateDialogVisible.value = true
}

const confirmDelete = (id: number) => {
  graduateToDelete.value = id
  isConfirmDialogVisible.value = true
}

const handleDeleteGraduate = async () => {
  if (!graduateToDelete.value)
    return

  const result = await deleteGraduate(graduateToDelete.value)

  if (result.success) {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
    fetchGraduates(page.value, itemsPerPage.value)
  }
  else {
    snackbarMessage.value = result.message
    isSnackbarVisible.value = true
  }

  isConfirmDialogVisible.value = false
  graduateToDelete.value = null
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Administración de Graduados</VCardTitle>
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
            @click="openAddGraduateDialog"
          >
            Nuevo graduado
          </VBtn>
        </div>
      </VCardText>
      <VDivider />
      <div class="table-container">
        <VTable class="mb-4">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Género</th>
              <th>Fecha de nacimiento</th>
              <th>Celular</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>CV</th>
              <th>Estado</th>
              <th class="text-right fixed-column">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingList">
              <td
                colspan="11"
                class="text-center"
              >
                <VProgressCircular
                  indeterminate
                  color="primary"
                  size="32"
                  class="my-4"
                />
                <div class="mt-2">
                  Cargando graduados...
                </div>
              </td>
            </tr>
            <tr
              v-for="graduate in paginatedGraduates"
              v-else
              :key="graduate.graduate_id"
            >
              <td>{{ graduate.dni }}</td>
              <td>{{ graduate.nombres }} {{ graduate.apellidos }}</td>
              <td>{{ graduate.correo }}</td>
              <td>{{ graduate.genero === 'M' ? 'Masculino' : graduate.genero === 'F' ? 'Femenino' : graduate.genero }}</td>
              <td>{{ graduate.fecha_nacimiento }}</td>
              <td>{{ graduate.celular }}</td>
              <td>{{ graduate.fecha_inicio }}</td>
              <td>{{ graduate.fecha_fin }}</td>
              <td>{{ graduate.cv }}</td>
              <td>{{ graduate.estado === '1' ? 'Activo' : 'Inactivo' }}</td>
              <td class="text-right fixed-column">
                <div class="d-flex align-center justify-end">
                  <VBtn
                    icon
                    size="small"
                    color="primary"
                    @click="openEditGraduateDialog(graduate.graduate_id)"
                  >
                    <VIcon icon="tabler-edit" />
                  </VBtn>
                  <VBtn
                    icon
                    size="small"
                    color="error"
                    class="ms-2"
                    @click="confirmDelete(graduate.graduate_id)"
                  >
                    <VIcon icon="tabler-trash" />
                  </VBtn>
                </div>
              </td>
            </tr>
            <tr v-if="!loadingList && paginatedGraduates.length === 0">
              <td
                colspan="11"
                class="text-center"
              >
                No hay graduados para mostrar.
              </td>
            </tr>
          </tbody>
        </VTable>
      </div>
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalGraduates"
        @update:page="handlePageChange"
      />
      <AddGraduateDialog
        v-model:is-dialog-open="isAddGraduateDialogVisible"
        :graduate-to-edit="graduateToEdit"
        @success="() => { fetchGraduates(page, itemsPerPage); isAddGraduateDialogVisible = false }"
        @update:is-dialog-open="val => isAddGraduateDialogVisible = val"
      />
      <VSnackbar v-model="isSnackbarVisible">
        {{ snackbarMessage }}
      </VSnackbar>

      <VConfirmDialog
        v-model="isConfirmDialogVisible"
        title="Confirmar eliminación"
        text="¿Estás seguro que deseas eliminar este graduado? Esta acción no se puede deshacer."
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        @confirm="handleDeleteGraduate"
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
