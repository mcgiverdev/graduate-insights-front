<script setup lang="ts">
import { SURVEY_TEMPLATES, type SurveyTemplate } from '../utils/surveyTemplates'

defineEmits<{
  select: [template: SurveyTemplate | null]
}>()

const templates = SURVEY_TEMPLATES
</script>

<template>
  <VCard class="mb-6">
    <VCardItem class="pb-2">
      <VCardTitle>
        <VIcon
          start
          icon="tabler-template"
        />
        Selecciona una plantilla
      </VCardTitle>
      <VCardSubtitle>
        Elige una plantilla predefinida o crea tu encuesta desde cero
      </VCardSubtitle>
    </VCardItem>
    <VDivider />

    <VCardText>
      <VRow>
        <!-- Opcion "En blanco" -->
        <VCol
          cols="12"
          md="6"
          lg="3"
        >
          <VCard
            variant="outlined"
            class="cursor-pointer h-100"
            hover
            @click="$emit('select', null)"
          >
            <VCardText class="d-flex flex-column align-center text-center ga-3 pa-6">
              <VAvatar
                size="56"
                color="grey"
                variant="tonal"
              >
                <VIcon
                  icon="tabler-file-plus"
                  size="28"
                />
              </VAvatar>
              <div class="text-h6">
                En blanco
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Crear encuesta desde cero
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Tarjetas de plantillas -->
        <VCol
          v-for="template in templates"
          :key="template.key"
          cols="12"
          md="6"
          lg="3"
        >
          <VCard
            variant="outlined"
            class="cursor-pointer h-100"
            hover
            @click="$emit('select', template)"
          >
            <VCardText class="d-flex flex-column align-center text-center ga-3 pa-6">
              <VAvatar
                size="56"
                :color="template.color"
                variant="tonal"
              >
                <VIcon
                  :icon="template.icon"
                  size="28"
                />
              </VAvatar>
              <div class="text-h6">
                {{ template.title }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ template.description }}
              </div>
              <VChip
                size="small"
                color="info"
                variant="tonal"
              >
                {{ template.questions.length }} preguntas
              </VChip>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
