<script setup lang="ts">
import { ref } from 'vue'
import type { Survey } from '@/library/resources/surveys/SurveyResource'
import { SurveyResource } from '@/library/resources/surveys/SurveyResource'

const surveyResource = new SurveyResource()
const surveys = ref<Survey[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const editingSurvey = ref<Survey | null>(null)

const loadSurveys = async () => {
  loading.value = true
  try {
    const response = await surveyResource.index()

    surveys.value = response.data
  }
  catch (error) {
    console.error('Error al cargar las encuestas:', error)
  }
  finally {
    loading.value = false
  }
}

const createSurvey = () => {
  editingSurvey.value = {
    survey_id: 0,
    title: '',
    description: '',
    estado: 'draft',
    questions: [],
    settings: {
      allowAnonymous: true,
      showProgressBar: true,
      randomizeQuestions: false,
      limitOneResponse: false,
      showResultsToRespondents: false,
    },
  }
  showCreateDialog.value = true
}

const editSurvey = (survey: Survey) => {
  editingSurvey.value = { ...survey }
  showCreateDialog.value = true
}

const saveSurvey = async () => {
  if (!editingSurvey.value)
    return

  try {
    if (editingSurvey.value.survey_id === 0)
      await surveyResource.store(editingSurvey.value)
    else
      await surveyResource.update(editingSurvey.value.survey_id.toString(), editingSurvey.value)

    await loadSurveys()
    showCreateDialog.value = false
  }
  catch (error) {
    console.error('Error al guardar la encuesta:', error)
  }
}

const deleteSurvey = async (survey: Survey) => {
  try {
    await surveyResource.destroy(survey.survey_id.toString())
    await loadSurveys()
  }
  catch (error) {
    console.error('Error al eliminar la encuesta:', error)
  }
}

// Cargar encuestas al montar el componente
loadSurveys()
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4">
            Encuestas
          </h1>
          <VBtn
            color="primary"
            prepend-icon="mdi-plus"
            @click="createSurvey"
          >
            Nueva encuesta
          </VBtn>
        </div>

        <VCard>
          <VCardText>
            <VTable>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Preguntas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="survey in surveys"
                  :key="survey.survey_id"
                >
                  <td>{{ survey.title }}</td>
                  <td>{{ survey.description }}</td>
                  <td>
                    <VChip
                      :color="survey.estado === 'published' ? 'success' : survey.estado === 'draft' ? 'warning' : 'error'"
                      size="small"
                    >
                      {{ survey.estado === 'published' ? 'Publicada' : survey.estado === 'draft' ? 'Borrador' : 'Cerrada' }}
                    </VChip>
                  </td>
                  <td>{{ survey.questions.length }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <VBtn
                        icon
                        variant="text"
                        color="primary"
                        @click="editSurvey(survey)"
                      >
                        <VIcon>mdi-pencil</VIcon>
                      </VBtn>
                      <VBtn
                        icon
                        variant="text"
                        color="error"
                        @click="deleteSurvey(survey)"
                      >
                        <VIcon>mdi-delete</VIcon>
                      </VBtn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Diálogo para crear/editar encuesta -->
    <VDialog
      v-model="showCreateDialog"
      persistent
      width="100%"
      scrollable
    >
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          {{ editingSurvey?.survey_id === 0 ? 'Nueva encuesta' : 'Editar encuesta' }}
          <VBtn
            icon
            variant="text"
            @click="showCreateDialog = false"
          >
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-4">
          <SurveyBuilder
            v-if="editingSurvey"
            v-model="editingSurvey"
          />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="outlined"
            class="mr-2"
            @click="showCreateDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            @click="saveSurvey"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
