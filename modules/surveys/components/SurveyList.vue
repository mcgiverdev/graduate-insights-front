<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useSurveyService } from '@/composables/useSurveyService'
import StatisticsButton from '@/modules/survey-statistics/components/StatisticsButton.vue'
import type { Survey } from '@/modules/surveys/types'
import { SurveyStatus, SurveyType } from '@/modules/surveys/types'
import { formatDate } from '@/utils/dateUtils'

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
  { title: 'Tipo', key: 'survey_type', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Fecha Inicio', key: 'start_date', sortable: true },
  { title: 'Fecha Fin', key: 'end_date', sortable: true },
  { title: 'Preguntas', key: 'questions', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, width: '200px' },
]

// Opciones para los filtros (basado en los tipos disponibles en la nueva API)
const surveyTypeOptions = computed(() => [
  { title: 'Empleo', value: SurveyType.EMPLOYMENT },
  { title: 'Académico', value: SurveyType.ACADEMIC },
  { title: 'Habilidades', value: SurveyType.SKILLS },
  { title: 'Emprendimiento', value: SurveyType.ENTREPRENEURSHIP },
])

const statusOptions = [
  { title: 'Borrador', value: SurveyStatus.DRAFT },
  { title: 'Activa', value: SurveyStatus.ACTIVE },
  { title: 'Pausada', value: SurveyStatus.PAUSED },
  { title: 'Cerrada', value: SurveyStatus.CLOSED },
  { title: 'Completada', value: SurveyStatus.COMPLETED },
]

function getStatusColor(status?: SurveyStatus) {
  const colors: Record<string, string> = {
    [SurveyStatus.DRAFT]: 'warning',
    [SurveyStatus.ACTIVE]: 'success',
    [SurveyStatus.PAUSED]: 'info',
    [SurveyStatus.CLOSED]: 'error',
    [SurveyStatus.COMPLETED]: 'secondary',
  }

  return colors[status as SurveyStatus] || 'grey'
}

function getStatusLabel(status?: SurveyStatus) {
  const labels: Record<string, string> = {
    [SurveyStatus.DRAFT]: 'Borrador',
    [SurveyStatus.ACTIVE]: 'Activa',
    [SurveyStatus.PAUSED]: 'Pausada',
    [SurveyStatus.CLOSED]: 'Cerrada',
    [SurveyStatus.COMPLETED]: 'Completada',
  }

  return labels[status as SurveyStatus] || 'Sin estado'
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
  const filters = {
    searchQuery: searchQuery.value || undefined,
    surveyType: selectedType.value || undefined,
    status: selectedStatus.value || undefined,
  }

  await fetchSurveys(currentPage.value, itemsPerPage.value, filters)
}

// Cargar datos al montar el componente
onMounted(() => {
  loadSurveys()
})
</script>

<template>
  <VCard class="mb-6">
    <VCardItem class="pb-4">
      <VCardTitle>Gestión de Encuestas</VCardTitle>
    </VCardItem>
    <VDivider />
    <VCardText class="d-flex flex-wrap gap-4">
      <div class="me-3 d-flex gap-3">
        <AppSelect
          :model-value="itemsPerPage"
          :items="[10, 25, 50, 100].map(value => ({ value, title: String(value) }))"
          style="inline-size: 6.25rem;"
          @update:model-value="itemsPerPage = parseInt($event, 10)"
        />
      </div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <!-- Búsqueda -->
        <div style="inline-size: 10rem;">
          <AppTextField
            v-model="searchQuery"
            placeholder="Buscar..."
            prepend-inner-icon="tabler-search"
            @input="handleSearch"
          />
        </div>

        <!-- Filtros -->
        <AppSelect
          v-model="selectedType"
          :items="[{ title: 'Todos los tipos', value: null }, ...surveyTypeOptions]"
          placeholder="Tipo"
          clearable
          style="inline-size: 8rem;"
          @update:model-value="handleFilter"
        />

        <AppSelect
          v-model="selectedStatus"
          :items="[{ title: 'Todos los estados', value: null }, ...statusOptions]"
          placeholder="Estado"
          clearable
          style="inline-size: 8rem;"
          @update:model-value="handleFilter"
        />

        <!-- Botón crear -->
        <VBtn
          prepend-icon="tabler-plus"
          color="primary"
          @click="$emit('createSurvey')"
        >
          Crear Encuesta
        </VBtn>
      </div>
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
          color="primary"
          variant="tonal"
          size="small"
        >
          {{ item.survey_type.name }}
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

      <!-- Fecha de inicio -->
      <template #item.start_date="{ item }">
        {{ formatDate(item.start_date) }}
      </template>

      <!-- Fecha de fin -->
      <template #item.end_date="{ item }">
        {{ item.end_date ? formatDate(item.end_date) : '-' }}
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

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-1">
          <VBtn
            size="small"
            color="info"
            icon
            @click="$emit('viewSurvey', item)"
          >
            <VTooltip activator="parent">
              Ver detalles
            </VTooltip>
            <VIcon icon="tabler-eye" />
          </VBtn>

          <StatisticsButton
            v-if="item.id && item.status === SurveyStatus.ACTIVE"
            :survey-id="item.id"
            variant="outlined"
            size="small"
            icon-only
            color="success"
          >
            <VTooltip activator="parent">
              Ver Estadísticas
            </VTooltip>
          </StatisticsButton>

          <VBtn
            size="small"
            color="primary"
            icon
            @click="$emit('editSurvey', item)"
          >
            <VTooltip activator="parent">
              Editar
            </VTooltip>
            <VIcon icon="tabler-edit" />
          </VBtn>

          <VBtn
            size="small"
            color="secondary"
            icon
            @click="$emit('duplicateSurvey', item)"
          >
            <VTooltip activator="parent">
              Duplicar
            </VTooltip>
            <VIcon icon="tabler-copy" />
          </VBtn>

          <VBtn
            size="small"
            color="error"
            icon
            @click="handleDelete(item)"
          >
            <VTooltip activator="parent">
              Eliminar
            </VTooltip>
            <VIcon icon="tabler-trash" />
          </VBtn>
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

<style>
.v-data-table-footer {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
