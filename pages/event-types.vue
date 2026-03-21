<script setup lang="ts">
import { ref } from 'vue'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import EventTypeFormDialog from '@/modules/event-types/components/EventTypeFormDialog.vue'
import EventTypeTable from '@/modules/event-types/components/EventTypeTable.vue'
import { useEventTypeForm } from '@/modules/event-types/composables/useEventTypeForm'
import { useEventTypeList } from '@/modules/event-types/composables/useEventTypeList'
import type { EventType, EventTypeFormValues } from '@/modules/event-types/types'
import { toPayload } from '@/modules/event-types/utils/mappers'

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

const isFormVisible = ref(false)
const selectedEventType = ref<EventType | null>(null)
const isConfirmVisible = ref(false)
const eventTypeToDelete = ref<EventType | null>(null)

const openCreateForm = () => {
  selectedEventType.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = (eventType: EventType) => {
  selectedEventType.value = eventType
  clearServerErrors()
  isFormVisible.value = true
}

const handleFormSubmit = async (values: EventTypeFormValues) => {
  const payload = toPayload(values)
  const result = await saveEventType(payload, selectedEventType.value?.eventTypeId)

  if (result.success) {
    isFormVisible.value = false
    selectedEventType.value = null
    await fetchEventTypes()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedEventType.value = null
}

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
