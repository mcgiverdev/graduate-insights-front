<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, Form } from 'vee-validate'
import { ref, watch } from 'vue'
import * as z from 'zod'
import { useEducationCenterService } from '@/composables/useEducationCenterService'

interface Emit {
  (e: 'update:isDialogOpen', value: boolean): void
  (e: 'success'): void
}

interface Props {
  isDialogOpen: boolean
  educationCenterToEdit?: any
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isSubmitting = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const validationSchema = toTypedSchema(z.object({
  nombre: z.string().min(1, 'Este campo es obligatorio'),
  direccion: z.string().min(1, 'Este campo es obligatorio'),
}))

const { addEducationCenter: _addEducationCenter, updateEducationCenter: _updateEducationCenter, loadingForm } = useEducationCenterService()

const initialValues = ref({
  nombre: '',
  direccion: '',
})

watch(() => props.educationCenterToEdit, center => {
  if (center) {
    initialValues.value = {
      nombre: center.nombre || '',
      direccion: center.direccion || '',
    }
  }
  else {
    initialValues.value = {
      nombre: '',
      direccion: '',
    }
  }
}, { immediate: true })

const onSubmit = async (values: any, { resetForm, setErrors }: any) => {
  try {
    isSubmitting.value = true
    let result
    if (props.educationCenterToEdit && props.educationCenterToEdit.education_center_id)
      result = await _updateEducationCenter(props.educationCenterToEdit.education_center_id, values)
    else
      result = await _addEducationCenter(values)

    if (result && result.error) {
      if (result.error.errors) {
        const serverErrors = Object.entries(result.error.errors).reduce((acc, [field, message]) => {
          acc[field] = Array.isArray(message) ? message[0] : message

          return acc
        }, {} as Record<string, string>)

        setErrors(serverErrors)
        snackbarMessage.value = Object.values(result.error.errors).join(', ')
      }
      else {
        snackbarMessage.value = 'Error al guardar centro educativo.'
      }
      isSnackbarVisible.value = true

      return
    }
    emit('success')
    emit('update:isDialogOpen', false)
    snackbarMessage.value = 'Centro educativo guardado correctamente.'
    isSnackbarVisible.value = true
    resetForm()
  }
  catch (error) {
    snackbarMessage.value = 'Error al procesar el formulario.'
    isSnackbarVisible.value = true
  }
  finally {
    isSubmitting.value = false
  }
}

const closeDialog = () => {
  emit('update:isDialogOpen', false)
}

const handleDialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogOpen', val)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogOpen"
    max-width="600"
    @update:model-value="handleDialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="text-h5">
        {{ props.educationCenterToEdit ? 'Editar centro educativo' : 'Agregar nuevo centro educativo' }}
      </VCardTitle>
      <VDivider />
      <VCardText>
        <Form
          v-slot="{ errors, meta }"
          :validation-schema="validationSchema"
          :initial-values="initialValues"
          @submit="onSubmit"
        >
          <VRow>
            <VCol
              v-if="loadingForm"
              cols="12"
            >
              <div class="d-flex flex-column align-center justify-center py-8">
                <VProgressCircular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-2"
                />
                <span>Cargando datos del centro educativo...</span>
              </div>
            </VCol>
            <template v-else>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="nombre"
                >
                  <AppTextField
                    v-bind="field"
                    label="Nombre"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="direccion"
                >
                  <AppTextField
                    v-bind="field"
                    label="Dirección"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
            </template>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              class="d-flex justify-end"
            >
              <VBtn
                color="secondary"
                variant="text"
                @click="closeDialog"
              >
                Cancelar
              </VBtn>
              <VBtn
                color="primary"
                :loading="isSubmitting"
                type="submit"
              >
                {{ props.educationCenterToEdit ? 'Actualizar' : 'Guardar' }}
              </VBtn>
            </VCol>
          </VRow>
        </Form>
        <VSnackbar v-model="isSnackbarVisible">
          {{ snackbarMessage }}
        </VSnackbar>
      </VCardText>
    </VCard>
  </VDialog>
</template>
