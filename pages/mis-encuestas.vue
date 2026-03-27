<script setup lang="ts">
import RoleGuard from '@/components/RoleGuard.vue'
import { ROLES } from '@/composables/useRoles'
import { useSnackbar } from '@/composables/useSnackbar'
import {
  GraduateSurveyList,
  SurveyForm,
  SurveyResults,
  useMySurveysPage,
} from '@/src/features/graduate-surveys'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

// Composables
const { snackbar } = useSnackbar()
const {
  currentView,
  selectedSurvey,
  showSurveyForm,
  showSurveyResults,
  backToList,
  handleSurveyCompleted,
} = useMySurveysPage()
</script>

<template>
  <RoleGuard
    :roles="[ROLES.GRADUADO]"
    fallback
  >
    <div class="graduate-surveys-page">
      <!-- Vista de listado -->
      <GraduateSurveyList
        v-if="currentView === 'list'"
        @take-survey="showSurveyForm"
        @view-results="showSurveyResults"
      />

      <!-- Vista de resultados -->
      <SurveyResults
        v-else-if="currentView === 'results' && selectedSurvey"
        :survey-id="selectedSurvey.survey_id"
        @back="backToList"
      />

      <!-- Vista para responder encuesta -->
      <SurveyForm
        v-else-if="currentView === 'take' && selectedSurvey"
        :survey-id="selectedSurvey.survey_id"
        @completed="handleSurveyCompleted"
        @cancel="backToList"
      />
    </div>

    <template #fallback>
      <VCard>
        <VCardText class="text-center py-8">
          <VIcon
            size="64"
            color="warning"
            icon="tabler-user-x"
          />
          <h3 class="text-h5 mt-4 mb-2">
            Acceso Restringido
          </h3>
          <p class="text-body-1 mb-4">
            Esta sección es exclusiva para graduados. Solo los graduados pueden acceder a sus encuestas personales.
          </p>
        </VCardText>
      </VCard>
    </template>
  </RoleGuard>

  <!-- Notificaciones -->
  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
  >
    {{ snackbar.text }}
  </VSnackbar>
</template>

<style scoped>
.graduate-surveys-page {
  padding: 24px;
}
</style>
