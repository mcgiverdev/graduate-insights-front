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
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-center mb-6">
        <VCardTitle class="pa-0">
          {{ statistics?.survey_title }}
        </VCardTitle>
        <VChip
          :color="getStatusColor(statistics?.response_rate || 0)"
          size="small"
        >
          {{ Math.round(statistics?.response_rate || 0) }}% de respuesta
        </VChip>
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
            Centro Educativo
          </div>
          <div class="font-weight-medium">
            {{ statistics?.education_center_name }}
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis">
            Año de Graduación
          </div>
          <div class="font-weight-medium">
            {{ statistics?.graduation_year }}
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis">
            Última Respuesta
          </div>
          <div class="font-weight-medium">
            {{ formatDate(statistics?.last_response_at) }}
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
