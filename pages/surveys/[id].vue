<script setup lang="ts">
import { ref } from 'vue'
import type { Survey } from '@/library/resources/surveys/SurveyResource'
import { SurveyResource } from '@/library/resources/surveys/SurveyResource'

const route = useRoute()
const router = useRouter()

const surveyResource = new SurveyResource()
const survey = ref<Survey | null>(null)
const loading = ref(true)
const submitted = ref(false)
const error = ref<string | null>(null)

const loadSurvey = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await surveyResource.show(route.params.id as string)

    survey.value = response.data

    // Verificar si la encuesta está publicada
    if (survey.value.estado !== 'published') {
      error.value = 'Esta encuesta no está disponible actualmente.'

      return
    }

    // Verificar fechas si están configuradas
    if (survey.value.settings.startDate && new Date(survey.value.settings.startDate) > new Date()) {
      error.value = 'Esta encuesta aún no está disponible.'

      return
    }

    if (survey.value.settings.endDate && new Date(survey.value.settings.endDate) < new Date())
      error.value = 'Esta encuesta ya ha finalizado.'
  }
  catch (e) {
    error.value = 'No se pudo cargar la encuesta.'
    console.error('Error al cargar la encuesta:', e)
  }
  finally {
    loading.value = false
  }
}

const handleSubmit = async (answers: Record<string, any>) => {
  try {
    // Aquí se enviarían las respuestas al backend
    console.log('Respuestas:', answers)
    submitted.value = true
  }
  catch (e) {
    console.error('Error al enviar las respuestas:', e)
  }
}

// Cargar la encuesta al montar el componente
loadSurvey()
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <!-- Estado de carga -->
        <VProgressCircular
          v-if="loading"
          indeterminate
          class="ma-4"
        />

        <!-- Error -->
        <VAlert
          v-else-if="error"
          type="error"
          class="mb-4"
        >
          {{ error }}
        </VAlert>

        <!-- Mensaje de éxito después de enviar -->
        <VCard
          v-else-if="submitted"
          class="text-center pa-4"
        >
          <VIcon
            icon="mdi-check-circle"
            color="success"
            size="64"
            class="mb-4"
          />
          <h2 class="text-h5 mb-2">
            ¡Gracias por completar la encuesta!
          </h2>
          <p class="mb-4">
            Tus respuestas han sido registradas correctamente.
          </p>
          <VBtn
            color="primary"
            @click="router.push('/surveys')"
          >
            Volver al inicio
          </VBtn>
        </VCard>

        <!-- Visualizador de encuesta -->
        <SurveyViewer
          v-else-if="survey"
          :survey="survey"
          @submit="handleSubmit"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>
