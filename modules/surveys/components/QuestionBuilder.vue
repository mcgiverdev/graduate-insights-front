<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QuestionType, type SurveyOption, type SurveyQuestion } from '@/modules/surveys/types'

interface Props {
  question?: SurveyQuestion | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [question: Omit<SurveyQuestion, 'id'>]
  cancel: []
}>()

// Estado del formulario
const questionForm = ref({
  question_text: '',
  question_type: QuestionType.TEXT,
  required: false,
  options: [] as Omit<SurveyOption, 'id'>[],
})

// Opciones de tipos de pregunta
const questionTypeOptions = [
  { title: 'Sí/No', value: QuestionType.YES_NO, description: 'Pregunta de respuesta binaria' },
  { title: 'Opción única', value: QuestionType.SINGLE_CHOICE, description: 'Seleccionar una opción' },
  { title: 'Opción múltiple', value: QuestionType.MULTIPLE_CHOICE, description: 'Seleccionar múltiples opciones' },
  { title: 'Texto', value: QuestionType.TEXT, description: 'Respuesta de texto libre' },
  { title: 'Número', value: QuestionType.NUMBER, description: 'Respuesta numérica' },
  { title: 'Fecha', value: QuestionType.DATE, description: 'Seleccionar fecha' },
  { title: 'Email', value: QuestionType.EMAIL, description: 'Dirección de correo electrónico' },
  { title: 'Teléfono', value: QuestionType.PHONE, description: 'Número de teléfono' },
]

// Validaciones
const isValidQuestion = computed(() => {
  const hasText = questionForm.value.question_text.trim() !== ''
  const hasOptionsIfNeeded = !needsOptions.value || questionForm.value.options.length > 0

  return hasText && hasOptionsIfNeeded
})

// Verificar si el tipo de pregunta necesita opciones
const needsOptions = computed(() => {
  return [
    QuestionType.YES_NO,
    QuestionType.SINGLE_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
  ].includes(questionForm.value.question_type)
})

// Inicializar formulario si hay una pregunta para editar
if (props.question) {
  questionForm.value = {
    question_text: props.question.question_text,
    question_type: props.question.question_type,
    required: props.question.required,
    options: props.question.options.map(opt => ({
      option_text: opt.option_text,
      order_number: opt.order_number,
    })),
  }
}

// Watch para manejar cambios en el tipo de pregunta
watch(() => questionForm.value.question_type, (newType, oldType) => {
  // Si cambia de un tipo que necesita opciones a uno que no, limpiar opciones
  if (!needsOptions.value && questionForm.value.options.length > 0)
    questionForm.value.options = []

  // Si cambia a YES_NO, crear opciones predeterminadas
  if (newType === QuestionType.YES_NO && oldType !== QuestionType.YES_NO) {
    questionForm.value.options = [
      { option_text: 'Sí', order_number: 1 },
      { option_text: 'No', order_number: 2 },
    ]
  }
})

// Métodos para manejar opciones
function addOption() {
  const newOrder = questionForm.value.options.length + 1

  questionForm.value.options.push({
    option_text: '',
    order_number: newOrder,
  })
}

function removeOption(index: number) {
  questionForm.value.options.splice(index, 1)

  // Reordenar números de orden
  questionForm.value.options.forEach((option, i) => {
    option.order_number = i + 1
  })
}

function moveOption(from: number, to: number) {
  const options = [...questionForm.value.options]
  const [movedOption] = options.splice(from, 1)

  options.splice(to, 0, movedOption)

  // Reordenar números de orden
  options.forEach((option, i) => {
    option.order_number = i + 1
  })

  questionForm.value.options = options
}

// Métodos para guardar y cancelar
function saveQuestion() {
  if (!isValidQuestion.value)
    return

  emit('save', {
    question_text: questionForm.value.question_text,
    question_type: questionForm.value.question_type,
    required: questionForm.value.required,
    options: questionForm.value.options,
  })
}

function cancelQuestion() {
  emit('cancel')
}

// Resetear formulario
function resetForm() {
  questionForm.value = {
    question_text: '',
    question_type: QuestionType.TEXT,
    required: false,
    options: [],
  }
}
</script>

<template>
  <VCard>
    <VCardItem class="pb-4">
      <VCardTitle>
        <VIcon
          start
          icon="tabler-help-circle"
        />
        {{ question ? 'Editar Pregunta' : 'Nueva Pregunta' }}
      </VCardTitle>
    </VCardItem>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="saveQuestion">
        <VRow>
          <!-- Texto de la pregunta -->
          <VCol cols="12">
            <VTextarea
              v-model="questionForm.question_text"
              label="Texto de la pregunta"
              required
              rows="3"
              placeholder="Escribe tu pregunta aquí..."
            />
          </VCol>

          <!-- Tipo de pregunta -->
          <VCol
            cols="12"
            md="8"
          >
            <VSelect
              v-model="questionForm.question_type"
              :items="questionTypeOptions"
              label="Tipo de pregunta"
              item-title="title"
              item-value="value"
              required
            >
              <template #item="{ props: itemProps, item }">
                <VListItem v-bind="itemProps">
                  <VListItemTitle>{{ item.raw.title }}</VListItemTitle>
                  <VListItemSubtitle>{{ item.raw.description }}</VListItemSubtitle>
                </VListItem>
              </template>
            </VSelect>
          </VCol>

          <!-- Pregunta requerida -->
          <VCol
            cols="12"
            md="4"
          >
            <VSwitch
              v-model="questionForm.required"
              label="Pregunta requerida"
              color="primary"
            />
          </VCol>

          <!-- Opciones de respuesta -->
          <VCol
            v-if="needsOptions"
            cols="12"
          >
            <div class="d-flex justify-space-between align-center mb-4">
              <h4 class="text-h6">
                Opciones de respuesta
              </h4>

              <VBtn
                v-if="questionForm.question_type !== QuestionType.YES_NO"
                prepend-icon="tabler-plus"
                color="primary"
                size="small"
                @click="addOption"
              >
                Agregar Opción
              </VBtn>
            </div>

            <div
              v-if="questionForm.options.length === 0"
              class="text-center py-4"
            >
              <p class="text-body-2 text-medium-emphasis">
                No hay opciones configuradas
              </p>
            </div>

            <div
              v-else
              class="options-list"
            >
              <VCard
                v-for="(option, index) in questionForm.options"
                :key="index"
                variant="outlined"
                class="mb-2"
              >
                <VCardText class="py-2">
                  <div class="d-flex align-center gap-2">
                    <VChip
                      size="small"
                      variant="tonal"
                      color="primary"
                    >
                      {{ index + 1 }}
                    </VChip>

                    <VTextField
                      v-model="option.option_text"
                      :placeholder="`Opción ${index + 1}`"
                      variant="outlined"
                      density="compact"
                      class="flex-grow-1"
                      :disabled="questionForm.question_type === QuestionType.YES_NO"
                    />

                    <div
                      v-if="questionForm.question_type !== QuestionType.YES_NO"
                      class="d-flex gap-1"
                    >
                      <VBtn
                        size="small"
                        color="info"
                        icon
                        :disabled="index === 0"
                        @click="moveOption(index, index - 1)"
                      >
                        <VTooltip activator="parent">
                          Mover arriba
                        </VTooltip>
                        <VIcon icon="tabler-arrow-up" />
                      </VBtn>

                      <VBtn
                        size="small"
                        color="info"
                        icon
                        :disabled="index === questionForm.options.length - 1"
                        @click="moveOption(index, index + 1)"
                      >
                        <VTooltip activator="parent">
                          Mover abajo
                        </VTooltip>
                        <VIcon icon="tabler-arrow-down" />
                      </VBtn>

                      <VBtn
                        size="small"
                        color="error"
                        icon
                        @click="removeOption(index)"
                      >
                        <VTooltip activator="parent">
                          Eliminar opción
                        </VTooltip>
                        <VIcon icon="tabler-trash" />
                      </VBtn>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>

    <VCardActions>
      <VSpacer />

      <VBtn
        prepend-icon="tabler-x"
        variant="outlined"
        @click="cancelQuestion"
      >
        Cancelar
      </VBtn>

      <VBtn
        :prepend-icon="question ? 'tabler-device-floppy' : 'tabler-check'"
        color="primary"
        :disabled="!isValidQuestion"
        @click="saveQuestion"
      >
        {{ question ? 'Actualizar' : 'Guardar' }} Pregunta
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<style scoped>
.options-list {
  max-block-size: 400px;
  overflow-y: auto;
}
</style>
