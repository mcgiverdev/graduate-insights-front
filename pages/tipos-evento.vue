<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  EventTypeFormDialog,
  EventTypeTable,
  useEventTypeEditor,
  useEventTypeForm,
  useEventTypeList,
} from '@/src/features/event-types'

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
  deleteEventType,
  fetchEventTypes,
} = useEventTypeList()

const { submitting, serverErrors, saveEventType, clearServerErrors } = useEventTypeForm()

const isConfirmVisible = ref(false)
const eventTypeToDelete = ref<EventType | null>(null)

const {
  isFormVisible,
  selectedEventType,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useEventTypeEditor({
  fetchEventTypes,
  saveEventType,
  clearServerErrors,
})

const requestDelete = (eventType: EventType) => {
  eventTypeToDelete.value = eventType
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (!eventTypeToDelete.value)
    return

  await deleteEventType(eventTypeToDelete.value.eventTypeId)
  isConfirmVisible.value = false
  eventTypeToDelete.value = null
}
</script>

<template>
  <section>
    <EventTypeTable
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

    <EventTypeFormDialog
      v-model="isFormVisible"
      :event-type="selectedEventType"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar tipo de evento"
      text="¿Seguro que deseas eliminar este tipo de evento? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
