<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import {
  EventFormDialog,
  EventTable,
  useEventEditor,
  useEventForm,
  useEventList,
  useEventOptions,
} from '@/src/features/events'

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
  deleteEvent,
  fetchEvents,
} = useEventList()

const { submitting, serverErrors, saveEvent, clearServerErrors } = useEventForm()
const { directorOptions, eventTypeOptions, loadingOptions, loadOptions } = useEventOptions()

const isConfirmVisible = ref(false)
const eventIdToDelete = ref<number | null>(null)

const {
  isFormVisible,
  selectedEvent,
  openCreateForm,
  openEditForm,
  handleFormSubmit,
  handleDialogClosed,
} = useEventEditor({
  fetchEvents,
  saveEvent,
  clearServerErrors,
  directorOptionsCount: () => directorOptions.value.length,
  eventTypeOptionsCount: () => eventTypeOptions.value.length,
  loadOptions,
})

const requestDelete = (eventId: number) => {
  eventIdToDelete.value = eventId
  isConfirmVisible.value = true
}

const confirmDelete = async () => {
  if (eventIdToDelete.value === null)
    return

  await deleteEvent(eventIdToDelete.value)
  isConfirmVisible.value = false
  eventIdToDelete.value = null
}
</script>

<template>
  <section>
    <EventTable
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

    <EventFormDialog
      v-model="isFormVisible"
      :event="selectedEvent"
      :director-options="directorOptions"
      :event-type-options="eventTypeOptions"
      :options-loading="loadingOptions"
      :submitting="submitting"
      :server-errors="serverErrors"
      @submit="handleFormSubmit"
      @closed="handleDialogClosed"
    />

    <VConfirmDialog
      v-model="isConfirmVisible"
      title="Eliminar evento"
      text="¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>
