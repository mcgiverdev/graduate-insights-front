<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyService } from '@/composables/useSurveyService'
import type { Survey } from '@/modules/surveys/types'
import { SurveyType } from '@/modules/surveys/types'

// Emits
defineEmits<{
  createSurvey: []
  viewSurvey: [survey: Survey]
  editSurvey: [survey: Survey]
  duplicateSurvey: [survey: Survey]
}>()

// Composables
const {
  surveys,
  totalSurveys,
  loadingList,
  loadingSave,
  fetchSurveys,
  deleteSurvey,
} = useSurveyService()

const { showSnackbar } = useSnackbar()

// Estado local
const searchQuery = ref('')
const selectedType = ref()
const selectedStatus = ref()
const currentPage = ref(1)
const itemsPerPage = ref(10)
const deleteDialog = ref(false)
const selectedSurvey = ref<Survey | null>(null)

// Headers de la tabla
const headers = [
  { title: 'Título', key: 'title', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Tipo', key: 'survey_type', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Preguntas', key: 'questions', sortable: false },
  { title: 'Fecha', key: 'created_at', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '150px' },
]

// Opciones para los filtros
const surveyTypeOptions = computed(() => [
  { title: 'Estado Laboral', value: SurveyType.EMPLOYMENT_STATUS },
  { title: 'Satisfacción', value: SurveyType.SATISFACTION },
  { title: 'Retroalimentación', value: SurveyType.FEEDBACK },
  { title: 'Evaluación', value: SurveyType.EVALUATION },
  { title: 'Personalizada', value: SurveyType.CUSTOM },
])

const statusOptions = [
  { title: 'Borrador', value: 'DRAFT' },
  { title: 'Publicada', value: 'PUBLISHED' },
  { title: 'Archivada', value: 'ARCHIVED' },
]

// Métodos para formatear datos
function getSurveyTypeColor(type: string) {
  const colors = {
    [SurveyType.EMPLOYMENT_STATUS]: 'primary',
    [SurveyType.SATISFACTION]: 'success',
    [SurveyType.FEEDBACK]: 'info',
    [SurveyType.EVALUATION]: 'warning',
    [SurveyType.CUSTOM]: 'secondary',
  }

  return colors[type as SurveyType] || 'grey'
}

function getSurveyTypeLabel(type: string) {
  const labels = {
    [SurveyType.EMPLOYMENT_STATUS]: 'Estado Laboral',
    [SurveyType.SATISFACTION]: 'Satisfacción',
    [SurveyType.FEEDBACK]: 'Retroalimentación',
    [SurveyType.EVALUATION]: 'Evaluación',
    [SurveyType.CUSTOM]: 'Personalizada',
  }

  return labels[type as SurveyType] || type
}

function getStatusColor(status?: string) {
  const colors = {
    DRAFT: 'warning',
    PUBLISHED: 'success',
    ARCHIVED: 'error',
  }

  return colors[status as keyof typeof colors] || 'grey'
}

function getStatusLabel(status?: string) {
  const labels = {
    DRAFT: 'Borrador',
    PUBLISHED: 'Publicada',
    ARCHIVED: 'Archivada',
  }

  return labels[status as keyof typeof labels] || 'Sin estado'
}

function formatDate(dateString?: string) {
  if (!dateString)
    return '-'

  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Manejadores de eventos
function handleSearch() {
  currentPage.value = 1
  loadSurveys()
}

function handleFilter() {
  currentPage.value = 1
  loadSurveys()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadSurveys()
}

function handleItemsPerPageChange(items: number) {
  itemsPerPage.value = items
  currentPage.value = 1
  loadSurveys()
}

function handleDelete(survey: Survey) {
  selectedSurvey.value = survey
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedSurvey.value?.id)
    return

  const result = await deleteSurvey(selectedSurvey.value.id)

  if (result.success) {
    showSnackbar(result.message, 'success')
    loadSurveys()
  }
  else {
    showSnackbar(result.message, 'error')
  }

  deleteDialog.value = false
  selectedSurvey.value = null
}

async function loadSurveys() {
  await fetchSurveys(currentPage.value, itemsPerPage.value)
}

// Cargar datos al montar el componente
onMounted(() => {
  loadSurveys()
})
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Gestión de Encuestas</span>
      <VBtn
        color="primary"
        @click="$emit('createSurvey')"
      >
        <VIcon start>
          mdi-plus
        </VIcon>
        Crear Encuesta
      </VBtn>
    </VCardTitle>

    <VDivider />

    <!-- Filtros y búsqueda -->
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="searchQuery"
            label="Buscar encuestas..."
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="handleSearch"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VSelect
            v-model="selectedType"
            :items="surveyTypeOptions"
            label="Tipo de encuesta"
            clearable
            @update:model-value="handleFilter"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <VSelect
            v-model="selectedStatus"
            :items="statusOptions"
            label="Estado"
            clearable
            @update:model-value="handleFilter"
          />
        </VCol>
      </VRow>
    </VCardText>

    <!-- Tabla de encuestas -->
    <VDataTable
      :headers="headers"
      :items="surveys"
      :loading="loadingList"
      :server-items-length="totalSurveys"
      :items-per-page="itemsPerPage"
      :page="currentPage"
      @update:items-per-page="handleItemsPerPageChange"
      @update:page="handlePageChange"
    >
      <!-- Tipo de encuesta -->
      <template #item.survey_type="{ item }">
        <VChip
          :color="getSurveyTypeColor(item.survey_type)"
          variant="tonal"
          size="small"
        >
          {{ getSurveyTypeLabel(item.survey_type) }}
        </VChip>
      </template>

      <!-- Estado -->
      <template #item.status="{ item }">
        <VChip
          :color="getStatusColor(item.status)"
          variant="tonal"
          size="small"
        >
          {{ getStatusLabel(item.status) }}
        </VChip>
      </template>

      <!-- Número de preguntas -->
      <template #item.questions="{ item }">
        <VChip
          color="info"
          variant="outlined"
          size="small"
        >
          {{ item.questions?.length || 0 }} preguntas
        </VChip>
      </template>

      <!-- Fecha de creación -->
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VTooltip text="Ver detalles">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                icon="mdi-eye"
                size="small"
                variant="text"
                color="info"
                @click="$emit('viewSurvey', item)"
              />
            </template>
          </VTooltip>

          <VTooltip text="Editar">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="$emit('editSurvey', item)"
              />
            </template>
          </VTooltip>

          <VTooltip text="Duplicar">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                icon="mdi-content-copy"
                size="small"
                variant="text"
                color="secondary"
                @click="$emit('duplicateSurvey', item)"
              />
            </template>
          </VTooltip>

          <VTooltip text="Eliminar">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(item)"
              />
            </template>
          </VTooltip>
        </div>
      </template>

      <!-- Estado vacío -->
      <template #no-data>
        <div class="text-center py-8">
          <VIcon
            size="64"
            color="grey-lighten-2"
          >
            mdi-clipboard-text-outline
          </VIcon>
          <p class="text-h6 mt-4 mb-2">
            No hay encuestas disponibles
          </p>
          <p class="text-body-2 text-medium-emphasis">
            Comienza creando tu primera encuesta
          </p>
        </div>
      </template>
    </VDataTable>

    <!-- Diálogo de confirmación para eliminar -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle>
          <VIcon
            color="error"
            start
          >
            mdi-alert-circle
          </VIcon>
          Confirmar eliminación
        </VCardTitle>

        <VCardText>
          ¿Estás seguro de que deseas eliminar la encuesta "{{ selectedSurvey?.title }}"?
          Esta acción no se puede deshacer.
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            text="Cancelar"
            @click="deleteDialog = false"
          />
          <VBtn
            color="error"
            text="Eliminar"
            :loading="loadingSave"
            @click="confirmDelete"
          />
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<style scoped>
:deep(.v-data-table-footer) {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
