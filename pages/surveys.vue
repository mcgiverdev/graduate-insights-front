<script setup lang="ts">
import { ref } from 'vue'
import SurveyBuilder from '@/modules/surveys/components/SurveyBuilder.vue'
import SurveyList from '@/modules/surveys/components/SurveyList.vue'
import type { Survey } from '@/modules/surveys/types'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

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

function handleSurveySaved(survey: Survey) {
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
</template>

<style scoped>
.surveys-page {
  padding: 24px;
}
</style>
