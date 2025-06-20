<script setup lang="ts">
import { ref } from 'vue'
import RoleGuard from '@/components/RoleGuard.vue'
import { ROLES } from '@/composables/useRoles'
import { useSnackbar } from '@/composables/useSnackbar'
import SurveyBuilder from '@/modules/surveys/components/SurveyBuilder.vue'
import SurveyList from '@/modules/surveys/components/SurveyList.vue'
import type { Survey } from '@/modules/surveys/types'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

// Composables
const { snackbar } = useSnackbar()

// Estado de la página
const currentView = ref<'list' | 'create' | 'edit'>('list')
const editingSurvey = ref<Survey | null>(null)

// Navegación entre vistas
function showCreateForm() {
  editingSurvey.value = null
  currentView.value = 'create'
}

function showEditForm(survey: Survey) {
  editingSurvey.value = survey
  currentView.value = 'edit'
}

function backToList() {
  currentView.value = 'list'
  editingSurvey.value = null
}

function handleSurveySaved() {
  backToList()
}

function handleViewSurvey(survey: Survey) {
  // Por ahora redirige a editar, pero podrías crear una vista de solo lectura
  showEditForm(survey)
}

function handleDuplicateSurvey(survey: Survey) {
  // Crear una copia del survey sin ID para duplicar
  const duplicatedSurvey: Survey = {
    ...survey,
    id: undefined,
    title: `${survey.title} (Copia)`,
    questions: survey.questions.map(q => ({
      ...q,
      id: undefined,
      options: q.options.map(opt => ({ ...opt, id: undefined })),
    })),
  }

  editingSurvey.value = duplicatedSurvey
  currentView.value = 'create'
}
</script>

<template>
  <RoleGuard
    :roles="[ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR]"
    fallback
  >
    <div class="surveys-page">
      <!-- Vista de listado -->
      <SurveyList
        v-if="currentView === 'list'"
        @create-survey="showCreateForm"
        @view-survey="handleViewSurvey"
        @edit-survey="showEditForm"
        @duplicate-survey="handleDuplicateSurvey"
      />

      <!-- Vista de creación/edición -->
      <SurveyBuilder
        v-else
        :editing-survey="editingSurvey"
        @save="handleSurveySaved"
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
            Esta sección es para la gestión de encuestas por parte de empleadores, directores y administradores.
          </p>
          <p class="text-body-2 text-medium-emphasis">
            Si eres graduado, puedes acceder a "Mis Encuestas" para responder las encuestas asignadas.
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
.surveys-page {
  padding: 24px;
}
</style>
