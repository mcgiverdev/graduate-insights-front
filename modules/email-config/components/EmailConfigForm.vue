<script setup lang="ts">
import { Field, Form } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import { emailConfigFormSchema } from '../validation/emailConfigFormSchema'
import { toFormValues } from '../utils/mappers'
import type { EmailConfig, EmailConfigFormValues } from '../types'

interface Props {
  config?: EmailConfig | null
  saving: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: null,
})

const emit = defineEmits<{
  (e: 'save', values: EmailConfigFormValues): void
  (e: 'test'): void
}>()

const formRef = ref<FormContext<EmailConfigFormValues> | null>(null)
const showApiKey = ref(false)

const isEditing = computed(() => !!props.config)

const computedInitialValues = computed(() => toFormValues(props.config))

const computedSchema = computed(() => emailConfigFormSchema(isEditing.value))

watch(() => props.config, () => {
  formRef.value?.resetForm({ values: computedInitialValues.value })
})

const handleSubmit = (values: EmailConfigFormValues) => {
  emit('save', values)
}
</script>

<template>
  <Form
    ref="formRef"
    :validation-schema="computedSchema"
    :initial-values="computedInitialValues"
    @submit="handleSubmit"
  >
    <VRow>
      <VCol cols="12" md="6">
        <Field
          name="apiKey"
          v-slot="{ field, errorMessage }"
        >
          <AppTextField
            :model-value="field.value"
            label="API Key de Resend *"
            :type="showApiKey ? 'text' : 'password'"
            :placeholder="isEditing ? '••••••••' : 're_xxxxxxxxxx'"
            :error-messages="errorMessage"
            @update:model-value="field.onChange"
          >
            <template #append-inner>
              <VIcon
                :icon="showApiKey ? 'tabler-eye-off' : 'tabler-eye'"
                style="cursor: pointer;"
                @click="showApiKey = !showApiKey"
              />
            </template>
          </AppTextField>
        </Field>
        <p
          v-if="isEditing"
          class="text-caption text-medium-emphasis mt-1"
        >
          Dejar en blanco para mantener el API Key actual
        </p>
      </VCol>

      <VCol cols="12" md="6">
        <Field
          name="emailRemitente"
          v-slot="{ field, errorMessage }"
        >
          <AppTextField
            :model-value="field.value"
            label="Email remitente *"
            placeholder="noreply@tudominio.com"
            :error-messages="errorMessage"
            @update:model-value="field.onChange"
          />
        </Field>
      </VCol>

      <VCol cols="12" md="6">
        <Field
          name="nombreRemitente"
          v-slot="{ field, errorMessage }"
        >
          <AppTextField
            :model-value="field.value"
            label="Nombre remitente *"
            placeholder="GraduateInsights"
            :error-messages="errorMessage"
            @update:model-value="field.onChange"
          />
        </Field>
      </VCol>
    </VRow>

    <div class="d-flex gap-4 mt-6">
      <VBtn
        color="primary"
        type="submit"
        :loading="saving"
      >
        Guardar configuración
      </VBtn>
      <VBtn
        variant="outlined"
        :disabled="!config"
        @click="emit('test')"
      >
        Enviar email de prueba
      </VBtn>
    </div>
  </Form>
</template>
