<script setup lang="ts">
import type { SurveyStatistics } from '@/composables/useSurveyStatisticsService'

interface Props {
  statistics: SurveyStatistics | null
}

defineProps<Props>()

function getStatusColor(responseRate: number): string {
  if (responseRate >= 80)
    return 'success'
  if (responseRate >= 60)
    return 'warning'

  return 'error'
}

function formatDate(dateString: string | undefined): string {
  if (!dateString)
    return 'N/A'

  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusDisplayColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'COMPLETED': return 'info'
    case 'DRAFT': return 'warning'
    case 'CANCELLED': return 'error'
    default: return 'default'
  }
}
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-6">
        <VCardTitle class="pa-0">
          {{ statistics?.survey_title }}
        </VCardTitle>
        <div class="d-flex gap-2">
          <VChip
            :color="getStatusColor(statistics?.response_rate || 0)"
            size="small"
          >
            {{ Math.round(statistics?.response_rate || 0) }}% de respuesta
          </VChip>
          <VChip
            :color="getStatusDisplayColor(statistics?.status || '')"
            size="small"
            variant="outlined"
          >
            {{ statistics?.status }}
          </VChip>
        </div>
      </div>

      <VRow>
        <VCol
          cols="12"
          md="3"
        >
          <div class="d-flex flex-column">
            <span class="text-h4 font-weight-bold text-primary">
              {{ statistics?.total_responses }}
            </span>
            <span class="text-body-2 text-medium-emphasis">
              Total de Respuestas
            </span>
          </div>
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <div class="d-flex flex-column">
            <span class="text-h4 font-weight-bold text-success">
              {{ statistics?.total_graduates }}
            </span>
            <span class="text-body-2 text-medium-emphasis">
              Total de Egresados
            </span>
          </div>
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <div class="d-flex flex-column">
            <span class="text-h4 font-weight-bold text-warning">
              {{ statistics?.pending_responses }}
            </span>
            <span class="text-body-2 text-medium-emphasis">
              Respuestas Pendientes
            </span>
          </div>
        </VCol>

        <VCol
          cols="12"
          md="3"
        >
          <div class="d-flex flex-column">
            <span class="text-h4 font-weight-bold text-info">
              {{ Math.round(statistics?.completion_rate || 0) }}%
            </span>
            <span class="text-body-2 text-medium-emphasis">
              Tasa de Completitud
            </span>
          </div>
        </VCol>
      </VRow>

      <VDivider class="my-6" />

      <div class="d-flex justify-space-between">
        <div>
          <div class="text-body-2 text-medium-emphasis">
            Tipo de Encuesta
          </div>
          <div class="font-weight-medium">
            {{ statistics?.survey_type?.name }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ statistics?.survey_type?.description }}
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis">
            Fecha de Inicio
          </div>
          <div class="font-weight-medium">
            {{ formatDate(statistics?.start_date) }}
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis">
            Fecha de Fin
          </div>
          <div class="font-weight-medium">
            {{ formatDate(statistics?.end_date) }}
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis">
            Datos Generados
          </div>
          <div class="font-weight-medium">
            {{ formatDate(statistics?.data_generated_at) }}
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
