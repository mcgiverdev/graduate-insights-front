<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import VConfirmDialog from '@/components/dialogs/VConfirmDialog.vue'
import EventFormDialog from '@/modules/events/components/EventFormDialog.vue'
import EventTable from '@/modules/events/components/EventTable.vue'
import { useEventForm } from '@/modules/events/composables/useEventForm'
import { useEventList } from '@/modules/events/composables/useEventList'
import { useEventOptions } from '@/modules/events/composables/useEventOptions'
import type { Event, EventFormValues } from '@/modules/events/types'
import { toPayload } from '@/modules/events/utils/mappers'
import { eventService } from '@/modules/events/services/EventService'

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

const isFormVisible = ref(false)
const selectedEvent = ref<Event | null>(null)
const isConfirmVisible = ref(false)
const eventIdToDelete = ref<number | null>(null)
const { showSnackbar } = useSnackbar()

const ensureOptionsLoaded = async () => {
  if (!directorOptions.value.length || !eventTypeOptions.value.length)
    await loadOptions()
}

const openCreateForm = async () => {
  await ensureOptionsLoaded()
  selectedEvent.value = null
  clearServerErrors()
  isFormVisible.value = true
}

const openEditForm = async (eventId: number) => {
  await ensureOptionsLoaded()
  clearServerErrors()
  selectedEvent.value = null
  isFormVisible.value = true

  try {
    const event = await eventService.getById(eventId)

    if (!event) {
      showSnackbar({ text: 'No se encontró el evento seleccionado', color: 'error' })
      isFormVisible.value = false
      return
    }

    selectedEvent.value = event
  }
  catch (error) {
    console.error('Error al obtener evento', error)
    showSnackbar({ text: 'No se pudo cargar el evento', color: 'error' })
    isFormVisible.value = false
  }
}

const handleFormSubmit = async (values: EventFormValues) => {
  const payload = toPayload(values)
  const result = await saveEvent(payload, selectedEvent.value?.eventId)

  if (result.success) {
    isFormVisible.value = false
    selectedEvent.value = null
    await fetchEvents()
  }
}

const handleDialogClosed = () => {
  clearServerErrors()
  selectedEvent.value = null
}

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
