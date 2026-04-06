<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QuestionType, type SurveyOption, type SurveyQuestion } from '@/modules/surveys/types'

interface Props {
  question?: SurveyQuestion | null
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  question: null,
  inline: false,
})

const emit = defineEmits<{
  save: [question: Omit<SurveyQuestion, 'id'>]
  cancel: []
  'update:question': [question: Omit<SurveyQuestion, 'id'>]
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
  { title: 'Si/No', value: QuestionType.YES_NO, description: 'Pregunta de respuesta binaria' },
  { title: 'Escala', value: QuestionType.SCALE, description: 'Escala de 1 a 5 (satisfaccion/evaluacion)' },
  { title: 'Opcion unica', value: QuestionType.SINGLE_CHOICE, description: 'Seleccionar una opcion' },
  { title: 'Opcion multiple', value: QuestionType.MULTIPLE_CHOICE, description: 'Seleccionar multiples opciones' },
  { title: 'Texto', value: QuestionType.TEXT, description: 'Respuesta de texto libre' },
  { title: 'Numero', value: QuestionType.NUMBER, description: 'Respuesta numerica' },
  { title: 'Fecha', value: QuestionType.DATE, description: 'Seleccionar fecha' },
  { title: 'Email', value: QuestionType.EMAIL, description: 'Direccion de correo electronico' },
  { title: 'Telefono', value: QuestionType.PHONE, description: 'Numero de telefono' },
]

// Verificar si el tipo de pregunta necesita opciones
const needsOptions = computed(() => {
  return [
    QuestionType.YES_NO,
    QuestionType.SCALE,
    QuestionType.SINGLE_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
  ].includes(questionForm.value.question_type)
})

// Validaciones
const isValidQuestion = computed(() => {
  const hasText = questionForm.value.question_text.trim() !== ''
  const hasOptionsIfNeeded = !needsOptions.value || questionForm.value.options.length > 0

  return hasText && hasOptionsIfNeeded
})

// Auto-poblar opciones por defecto para YES_NO y SCALE cuando están vacías
function autoPopulateSpecialOptions() {
  if (questionForm.value.options.length > 0)
    return
  if (questionForm.value.question_type === QuestionType.YES_NO) {
    questionForm.value.options = [
      { option_text: 'Sí', order_number: 1 },
      { option_text: 'No', order_number: 2 },
    ]
  }
  else if (questionForm.value.question_type === QuestionType.SCALE) {
    questionForm.value.options = [
      { option_text: '1 - Muy malo', order_number: 1 },
      { option_text: '2 - Malo', order_number: 2 },
      { option_text: '3 - Regular', order_number: 3 },
      { option_text: '4 - Bueno', order_number: 4 },
      { option_text: '5 - Muy bueno', order_number: 5 },
    ]
  }
}

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
  autoPopulateSpecialOptions()
}

// Watch para manejar cambios en el tipo de pregunta
watch(() => questionForm.value.question_type, (newType, oldType) => {
  // Si cambia de un tipo que necesita opciones a uno que no, limpiar opciones
  if (!needsOptions.value && questionForm.value.options.length > 0)
    questionForm.value.options = []

  // Si cambia a YES_NO o SCALE, auto-poblar opciones por defecto
  if (newType !== oldType)
    autoPopulateSpecialOptions()
})

// En modo inline, emitir cambios al padre cuando el formulario cambia
watch(questionForm, newVal => {
  if (props.inline) {
    emit('update:question', {
      question_text: newVal.question_text,
      question_type: newVal.question_type,
      required: newVal.required,
      options: newVal.options,
    })
  }
}, { deep: true })

// Watch para actualizar cuando la prop question cambie externamente (p.ej. al reordenar preguntas).
// Se omite la re-inicialización si los valores ya coinciden con el estado local para evitar el loop:
// usuario escribe → emit → padre actualiza questions[i] → prop cambia → Watch reinicializa → bug
watch(() => props.question, newQuestion => {
  if (!newQuestion)
    return

  const f = questionForm.value

  const sameText = newQuestion.question_text === f.question_text
  const sameType = newQuestion.question_type === f.question_type
  const sameRequired = newQuestion.required === f.required

  const sameOptions
    = newQuestion.options.length === f.options.length
    && newQuestion.options.every((opt, i) =>
      opt.option_text === f.options[i]?.option_text
      && opt.order_number === f.options[i]?.order_number,
    )

  if (sameText && sameType && sameRequired && sameOptions)
    return

  questionForm.value = {
    question_text: newQuestion.question_text,
    question_type: newQuestion.question_type,
    required: newQuestion.required,
    options: newQuestion.options.map(opt => ({
      option_text: opt.option_text,
      order_number: opt.order_number,
    })),
  }
  autoPopulateSpecialOptions()
}, { deep: true })

// Metodos para manejar opciones
function addOption() {
  const newOrder = questionForm.value.options.length + 1

  questionForm.value.options.push({
    option_text: '',
    order_number: newOrder,
  })
}

function removeOption(index: number) {
  questionForm.value.options.splice(index, 1)

  // Reordenar numeros de orden
  questionForm.value.options.forEach((option, i) => {
    option.order_number = i + 1
  })
}

function moveOption(from: number, to: number) {
  const options = [...questionForm.value.options]
  const [movedOption] = options.splice(from, 1)

  options.splice(to, 0, movedOption)

  // Reordenar numeros de orden
  options.forEach((option, i) => {
    option.order_number = i + 1
  })

  questionForm.value.options = options
}

// Metodos para guardar y cancelar
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

// Exponer para uso externo
defineExpose({
  questionForm,
  isValidQuestion,
})
</script>

<template>
  <!-- Modo dialog (comportamiento original) -->
  <VCard v-if="!inline">
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
              placeholder="Escribe tu pregunta aqui..."
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
                v-if="questionForm.question_type !== QuestionType.YES_NO && questionForm.question_type !== QuestionType.SCALE"
                prepend-icon="tabler-plus"
                color="primary"
                size="small"
                @click="addOption"
              >
                Agregar Opcion
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
                      :placeholder="`Opcion ${index + 1}`"
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
                          Eliminar opcion
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

  <!-- Modo inline (para expansion panels) -->
  <div v-else>
    <VRow>
      <!-- Texto de la pregunta -->
      <VCol cols="12">
        <VTextarea
          v-model="questionForm.question_text"
          label="Texto de la pregunta"
          required
          rows="2"
          placeholder="Escribe tu pregunta aqui..."
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
          <h4 class="text-subtitle-1 font-weight-medium">
            Opciones de respuesta
          </h4>

          <VBtn
            v-if="questionForm.question_type !== QuestionType.YES_NO && questionForm.question_type !== QuestionType.SCALE"
            prepend-icon="tabler-plus"
            color="primary"
            size="small"
            variant="tonal"
            @click="addOption"
          >
            Agregar Opcion
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
                  :placeholder="`Opcion ${index + 1}`"
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
                      Eliminar opcion
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
  </div>
</template>

<style scoped>
.options-list {
  max-block-size: 400px;
  overflow-y: auto;
}
</style>
