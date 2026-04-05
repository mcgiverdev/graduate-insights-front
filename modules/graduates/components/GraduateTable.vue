<script setup lang="ts">
import type { Graduate } from '../types'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

interface Props {
  items: Graduate[]
  loading: boolean
  page: number
  itemsPerPage: number
  totalItems: number
  search: string
  showOnlyPending: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:items-per-page', value: number): void
  (e: 'update:search', value: string): void
  (e: 'update:show-only-pending', value: boolean): void
  (e: 'create'): void
  (e: 'view', graduateId: number): void
  (e: 'edit', graduateId: number): void
  (e: 'delete', graduateId: number): void
  (e: 'activate', graduateId: number): void
}>()

const headers = [
  { title: 'DNI', key: 'dni' },
  { title: 'Nombre completo', key: 'nombreCompleto' },
  { title: 'Correo', key: 'correo' },
  { title: 'Celular', key: 'celular' },
  { title: 'Ingreso', key: 'anioIngreso' },
  { title: 'Egreso', key: 'anioEgreso' },
  { title: 'Fec. nacimiento', key: 'fechaNacimiento' },
  { title: 'Estado', key: 'validated' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const perPageOptions = [10, 25, 50]

const onSearchInput = (value: string) => {
  emit('update:search', value)
}

const formatDate = (value?: string | null) => {
  if (!value)
    return '-'

  const normalized = value.trim()
  if (!normalized)
    return '-'

  const [datePart] = normalized.split(/[T ]/)
  if (!datePart)
    return normalized

  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day)
    return datePart

  return `${day}/${month}/${year}`
}

const getRowGraduateId = (tableItem: { raw?: Graduate | null } | Graduate | null): number | null => {
  const rawEntry = (tableItem && 'raw' in (tableItem as any) ? (tableItem as any).raw : tableItem) as
    | Graduate
    | undefined
    | null

  const rawValue = rawEntry?.graduateId ?? (tableItem as any)?.graduateId
  if (rawValue === undefined || rawValue === null)
    return null

  const numericValue = Number(rawValue)

  return Number.isFinite(numericValue) ? numericValue : null
}

const handleEditClick = (tableItem: any) => {
  const graduateId = getRowGraduateId(tableItem)
  if (graduateId !== null)
    emit('edit', graduateId)
}

const handleViewClick = (tableItem: any) => {
  const graduateId = getRowGraduateId(tableItem)
  if (graduateId !== null)
    emit('view', graduateId)
}

const handleDeleteClick = (tableItem: any) => {
  const graduateId = getRowGraduateId(tableItem)
  if (graduateId !== null)
    emit('delete', graduateId)
}

const handleActivateClick = (tableItem: any) => {
  const graduateId = getRowGraduateId(tableItem)
  if (graduateId !== null)
    emit('activate', graduateId)
}

const isPending = (tableItem: any) => {
  const rawEntry = (tableItem && 'raw' in (tableItem as any) ? (tableItem as any).raw : tableItem) as
    | Graduate
    | undefined
    | null

  return Boolean(rawEntry && rawEntry.validated === false)
}

const onTogglePending = (value: boolean) => {
  emit('update:show-only-pending', value)
}

const getStatusProps = (validated: boolean) => ({
  color: validated ? 'success' : 'warning',
  text: validated ? 'Activo' : 'Pendiente',
})
</script>

<template>
  <VCard>
    <VCardItem>
      <template #title>
        Administración de Graduados
      </template>
    </VCardItem>

    <VDivider />

    <VCardText class="d-flex flex-wrap gap-4 align-center">
      <AppTextField
        :model-value="props.search"
        placeholder="Buscar graduados"
        prepend-inner-icon="tabler-search"
        class="flex-grow-1"
        @update:model-value="onSearchInput"
      />

      <VSelect
        :model-value="props.itemsPerPage"
        :items="perPageOptions"
        label="Por página"
        style="max-inline-size: 8.75rem;"
        @update:model-value="value => emit('update:items-per-page', Number(value))"
      />

      <VSwitch
        :model-value="props.showOnlyPending"
        label="Solo no activos"
        inset
        hide-details
        @update:model-value="value => onTogglePending(Boolean(value))"
      />

      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="emit('create')"
      >
        Nuevo Graduado
      </VBtn>
    </VCardText>

    <VDivider />

    <VDataTableServer
      :headers="headers"
      :items="props.items"
      :items-length="props.totalItems"
      :loading="props.loading"
      :items-per-page="props.itemsPerPage"
      :page="props.page"
      class="text-no-wrap"
      @update:page="page => emit('update:page', page)"
      @update:items-per-page="value => emit('update:items-per-page', Number(value))"
    >
      <template #item.nombreCompleto="{ item }">
        <span class="text-body-2 font-weight-medium">
          {{ item.nombres }} {{ item.apellidos }}
        </span>
      </template>

      <template #item.anioIngreso="{ value }">
        {{ value || '-' }}
      </template>

      <template #item.anioEgreso="{ value }">
        {{ value || '-' }}
      </template>

      <template #item.fechaNacimiento="{ value }">
        {{ formatDate(value as string) }}
      </template>

      <template #item.validated="{ value }">
        <VChip
          :color="getStatusProps(Boolean(value)).color"
          variant="tonal"
          size="small"
        >
          {{ getStatusProps(Boolean(value)).text }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            v-if="isPending(item)"
            variant="tonal"
            size="small"
            color="success"
            prepend-icon="tabler-check"
            :disabled="getRowGraduateId(item) === null"
            @click="handleActivateClick(item)"
          >
            Activar
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="primary"
            :disabled="getRowGraduateId(item) === null"
            @click="handleViewClick(item)"
          >
            <VIcon icon="tabler-eye" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            :disabled="getRowGraduateId(item) === null"
            @click="handleEditClick(item)"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            :disabled="getRowGraduateId(item) === null"
            @click="handleDeleteClick(item)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </div>
      </template>
    </VDataTableServer>
  </VCard>
</template>
