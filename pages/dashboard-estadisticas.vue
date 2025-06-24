<script setup lang="ts">
import DashboardOverview from '@/modules/survey-statistics/components/DashboardOverview.vue'
import SurveyComparison from '@/modules/survey-statistics/components/SurveyComparison.vue'

// Configuración de la página
definePageMeta({
  title: 'Dashboard de Estadísticas',
  requiresAuth: true,
})

// Head configuration
useHead({
  title: 'Dashboard de Estadísticas - Graduate Insights',
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Dashboard de Estadísticas
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Vista general de todas las encuestas y estadísticas del sistema
        </p>
      </div>
    </div>

    <!-- Dashboard Overview -->
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon
          icon="mdi-view-dashboard"
          class="me-2"
        />
        Resumen General
      </VCardTitle>
      <VCardText>
        <DashboardOverview />
      </VCardText>
    </VCard>

    <!-- Survey Comparison -->
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon
          icon="mdi-compare"
          class="me-2"
        />
        Comparación de Encuestas
      </VCardTitle>
      <VCardText>
        <SurveyComparison />
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
/* Estilos personalizados si es necesario */
</style>
