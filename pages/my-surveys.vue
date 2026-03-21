<script setup lang="ts">
import { ref } from 'vue'
import RoleGuard from '@/components/RoleGuard.vue'
import { ROLES } from '@/composables/useRoles'
import { useSnackbar } from '@/composables/useSnackbar'
import GraduateSurveyList from '@/modules/graduate-surveys/components/GraduateSurveyList.vue'
import SurveyForm from '@/modules/graduate-surveys/components/SurveyForm.vue'
import SurveyResults from '@/modules/graduate-surveys/components/SurveyResults.vue'
import type { GraduateSurveyListItem } from '@/modules/graduate-surveys/types'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

// Composables
const { snackbar } = useSnackbar()

// Estado de la página
const currentView = ref<'list' | 'take' | 'results'>('list')
const selectedSurvey = ref<GraduateSurveyListItem | null>(null)

// Navegación entre vistas
function showSurveyForm(survey: GraduateSurveyListItem) {
  selectedSurvey.value = survey
  currentView.value = 'take'
}

function showSurveyResults(survey: GraduateSurveyListItem) {
  selectedSurvey.value = survey
  currentView.value = 'results'
}

function backToList() {
  currentView.value = 'list'
  selectedSurvey.value = null
}

function handleSurveyCompleted() {
  // El composable ya actualiza el estado automáticamente después del submit
  // Solo necesitamos volver a la vista de lista
  backToList()
}
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
