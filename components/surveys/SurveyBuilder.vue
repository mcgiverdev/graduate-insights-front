<!-- eslint-disable vue/no-v-model-argument -->
<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { computed } from 'vue'
import type { Question, Survey } from '@/library/resources/surveys/SurveyResource'

const props = defineProps<{
  modelValue: Survey
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Survey): void
}>()

const survey = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const questionTypes = [
  { value: 'text', label: 'Texto', icon: 'mdi-text' },
  { value: 'multiple_choice', label: 'Opción múltiple', icon: 'mdi-radiobox-marked' },
  { value: 'checkbox', label: 'Casillas de verificación', icon: 'mdi-checkbox-marked' },
  { value: 'rating', label: 'Calificación', icon: 'mdi-star' },
  { value: 'date', label: 'Fecha', icon: 'mdi-calendar' },
  { value: 'time', label: 'Hora', icon: 'mdi-clock' },
  { value: 'file', label: 'Archivo', icon: 'mdi-file' },
  { value: 'matrix', label: 'Matriz', icon: 'mdi-grid' },
]

const addQuestion = () => {
  const newQuestion: Question = {
    id: uuidv4(),
    type: 'text',
    title: '',
    required: false,
  }

  survey.value.questions.push(newQuestion)
}

const removeQuestion = (index: number) => {
  survey.value.questions.splice(index, 1)
}

const addOption = (question: Question) => {
  if (!question.options)
    question.options = []

  question.options.push({
    value: uuidv4(),
    label: `Opción ${question.options.length + 1}`,
  })
}

const removeOption = (question: Question, index: number) => {
  if (question.options)
    question.options.splice(index, 1)
}

const addMatrixRow = (question: Question) => {
  if (!question.matrix) {
    question.matrix = {
      rows: [],
      columns: [],
    }
  }
  question.matrix.rows.push(`Fila ${question.matrix.rows.length + 1}`)
}

const addMatrixColumn = (question: Question) => {
  if (!question.matrix) {
    question.matrix = {
      rows: [],
      columns: [],
    }
  }
  question.matrix.columns.push(`Columna ${question.matrix.columns.length + 1}`)
}

const removeMatrixRow = (question: Question, index: number) => {
  if (question.matrix)
    question.matrix.rows.splice(index, 1)
}

const removeMatrixColumn = (question: Question, index: number) => {
  if (question.matrix)
    question.matrix.columns.splice(index, 1)
}

const moveQuestion = (fromIndex: number, toIndex: number) => {
  const questions = survey.value.questions
  const element = questions[fromIndex]

  questions.splice(fromIndex, 1)
  questions.splice(toIndex, 0, element)
}
</script>

<template>
  <div class="survey-builder">
    <!-- Configuración general de la encuesta -->
    <VCard class="mb-6">
      <VCardTitle>Configuración de la encuesta</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="survey.title"
              label="Título de la encuesta"
              placeholder="Ingrese el título de su encuesta"
              variant="outlined"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="survey.description"
              label="Descripción"
              placeholder="Describa el propósito de su encuesta"
              variant="outlined"
              rows="3"
            />
          </VCol>
        </VRow>

        <VExpansionPanels
          variant="accordion"
          class="mt-4"
        >
          <VExpansionPanel>
            <VExpansionPanelTitle>
              Configuración avanzada
            </VExpansionPanelTitle>
            <VExpansionPanelText>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSwitch
                    v-model="survey.settings.allowAnonymous"
                    label="Permitir respuestas anónimas"
                  />
                  <VSwitch
                    v-model="survey.settings.showProgressBar"
                    label="Mostrar barra de progreso"
                  />
                  <VSwitch
                    v-model="survey.settings.randomizeQuestions"
                    label="Aleatorizar preguntas"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSwitch
                    v-model="survey.settings.limitOneResponse"
                    label="Limitar a una respuesta por persona"
                  />
                  <VSwitch
                    v-model="survey.settings.showResultsToRespondents"
                    label="Mostrar resultados a los encuestados"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="survey.settings.startDate"
                    type="date"
                    label="Fecha de inicio"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="survey.settings.endDate"
                    type="date"
                    label="Fecha de fin"
                  />
                </VCol>
              </VRow>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCardText>
    </VCard>

    <!-- Lista de preguntas -->
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        Preguntas
        <VBtn
          color="primary"
          prepend-icon="mdi-plus"
          @click="addQuestion"
        >
          Agregar pregunta
        </VBtn>
      </VCardTitle>
      <VCardText>
        <VList class="question-list">
          <Draggable
            v-model="survey.questions"
            item-key="id"
            handle=".drag-handle"
            @end="moveQuestion"
          >
            <template #item="{ element: question, index }">
              <VListItem>
                <VCard
                  width="100%"
                  class="mb-4"
                >
                  <VCardText>
                    <div class="d-flex align-center mb-4">
                      <VIcon
                        class="drag-handle mr-2 cursor-move"
                        icon="mdi-drag"
                      />
                      <VSelect
                        v-model="question.type"
                        :items="questionTypes"
                        item-title="label"
                        item-value="value"
                        label="Tipo de pregunta"
                        class="flex-grow-1"
                      >
                        <template #item="{ props, item }">
                          <VListItem v-bind="props">
                            <template #prepend>
                              <VIcon :icon="item.raw.icon" />
                            </template>
                            <VListItemTitle>{{ item.raw.label }}</VListItemTitle>
                          </VListItem>
                        </template>
                      </VSelect>
                      <VBtn
                        icon
                        variant="text"
                        color="error"
                        class="ml-2"
                        @click="removeQuestion(index)"
                      >
                        <VIcon>mdi-delete</VIcon>
                      </VBtn>
                    </div>

                    <VTextField
                      v-model="question.title"
                      label="Pregunta"
                      placeholder="Escriba su pregunta"
                      variant="outlined"
                      class="mb-4"
                    />

                    <VTextField
                      v-model="question.description"
                      label="Descripción (opcional)"
                      placeholder="Agregue una descripción o instrucciones adicionales"
                      variant="outlined"
                      class="mb-4"
                    />

                    <!-- Opciones para preguntas de opción múltiple y casillas -->
                    <template v-if="['multiple_choice', 'checkbox'].includes(question.type)">
                      <div
                        v-for="(option, optionIndex) in question.options"
                        :key="option.value"
                        class="d-flex align-center mb-2"
                      >
                        <VIcon
                          :icon="question.type === 'multiple_choice' ? 'mdi-radiobox-marked' : 'mdi-checkbox-marked'"
                          class="mr-2"
                        />
                        <VTextField
                          v-model="option.label"
                          placeholder="Opción"
                          variant="outlined"
                          density="compact"
                          class="flex-grow-1"
                        />
                        <VBtn
                          icon
                          variant="text"
                          color="error"
                          @click="removeOption(question, optionIndex)"
                        >
                          <VIcon>mdi-delete</VIcon>
                        </VBtn>
                      </div>
                      <VBtn
                        variant="text"
                        prepend-icon="mdi-plus"
                        @click="addOption(question)"
                      >
                        Agregar opción
                      </VBtn>
                    </template>

                    <!-- Configuración para pregunta tipo matriz -->
                    <template v-if="question.type === 'matrix'">
                      <div class="matrix-config">
                        <div class="mb-4">
                          <div class="d-flex justify-space-between align-center mb-2">
                            <div class="text-subtitle-1">
                              Filas
                            </div>
                            <VBtn
                              variant="text"
                              density="compact"
                              prepend-icon="mdi-plus"
                              @click="addMatrixRow(question)"
                            >
                              Agregar fila
                            </VBtn>
                          </div>
                          <div
                            v-for="(row, rowIndex) in question.matrix?.rows"
                            :key="rowIndex"
                            class="d-flex align-center mb-2"
                          >
                            <VTextField
                              v-model="question.matrix!.rows[rowIndex]"
                              placeholder="Etiqueta de fila"
                              variant="outlined"
                              density="compact"
                              class="flex-grow-1"
                            />
                            <VBtn
                              icon
                              variant="text"
                              color="error"
                              @click="removeMatrixRow(question, rowIndex)"
                            >
                              <VIcon>mdi-delete</VIcon>
                            </VBtn>
                          </div>
                        </div>

                        <div class="mb-4">
                          <div class="d-flex justify-space-between align-center mb-2">
                            <div class="text-subtitle-1">
                              Columnas
                            </div>
                            <VBtn
                              variant="text"
                              density="compact"
                              prepend-icon="mdi-plus"
                              @click="addMatrixColumn(question)"
                            >
                              Agregar columna
                            </VBtn>
                          </div>
                          <div
                            v-for="(column, columnIndex) in question.matrix?.columns"
                            :key="columnIndex"
                            class="d-flex align-center mb-2"
                          >
                            <VTextField
                              v-model="question.matrix!.columns[columnIndex]"
                              placeholder="Etiqueta de columna"
                              variant="outlined"
                              density="compact"
                              class="flex-grow-1"
                            />
                            <VBtn
                              icon
                              variant="text"
                              color="error"
                              @click="removeMatrixColumn(question, columnIndex)"
                            >
                              <VIcon>mdi-delete</VIcon>
                            </VBtn>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Configuración para pregunta tipo calificación -->
                    <template v-if="question.type === 'rating'">
                      <div class="d-flex align-center">
                        <VSelect
                          v-model="question.validation!.max"
                          :items="[5, 10]"
                          label="Escala máxima"
                          variant="outlined"
                          density="compact"
                          class="max-width-100 mr-4"
                        />
                      </div>
                    </template>

                    <VDivider class="my-4" />

                    <VSwitch
                      v-model="question.required"
                      label="Respuesta requerida"
                      color="primary"
                    />
                  </VCardText>
                </VCard>
              </VListItem>
            </template>
          </Draggable>
        </VList>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.survey-builder {
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 800px;
}

.cursor-move {
  cursor: move;
}

.max-width-100 {
  max-inline-size: 100px;
}

.matrix-config {
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}
</style>
