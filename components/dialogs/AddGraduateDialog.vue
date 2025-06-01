<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, Form } from 'vee-validate'
import { ref, watch } from 'vue'
import * as z from 'zod'
import { useGraduateService } from '@/composables/useGraduateService'

interface Emit {
  (e: 'update:isDialogOpen', value: boolean): void
  (e: 'success'): void
}

interface Props {
  isDialogOpen: boolean
  graduateToEdit?: any
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isSubmitting = ref(false)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref('')

const validationSchema = toTypedSchema(z.object({
  nombres: z.string().min(1, 'Este campo es obligatorio'),
  apellidos: z.string().min(1, 'Este campo es obligatorio'),
  fecha_nacimiento: z.string().min(1, 'Este campo es obligatorio'),
  genero: z.string().min(1, 'Este campo es obligatorio'),
  correo: z.string().email('Correo inválido').min(1, 'Este campo es obligatorio'),
  dni: z.string().min(1, 'Este campo es obligatorio'),
  celular: z.string().min(1, 'Este campo es obligatorio'),
  fecha_inicio: z.string().min(1, 'Este campo es obligatorio'),
  fecha_fin: z.string().min(1, 'Este campo es obligatorio'),
  cv: z.string().min(1, 'Este campo es obligatorio'),
  contrasena: z.string().min(1, 'Este campo es obligatorio'),
}))

const { addGraduate: _addGraduate, updateGraduate: _updateGraduate, loadingForm } = useGraduateService()

const initialValues = ref({
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  genero: 'M',
  correo: '',
  dni: '',
  celular: '',
  fecha_inicio: '',
  fecha_fin: '',
  cv: '',
  contrasena: '',
})

watch(() => props.graduateToEdit, graduate => {
  if (graduate) {
    initialValues.value = {
      nombres: graduate.nombres || '',
      apellidos: graduate.apellidos || '',
      fecha_nacimiento: graduate.fecha_nacimiento || '',
      genero: graduate.genero || 'M',
      correo: graduate.correo || '',
      dni: graduate.dni || '',
      celular: graduate.celular || '',
      fecha_inicio: graduate.fecha_inicio || '',
      fecha_fin: graduate.fecha_fin || '',
      cv: graduate.cv || '',
      contrasena: graduate.contrasena || '',
    }
  }
  else {
    initialValues.value = {
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      genero: 'M',
      correo: '',
      dni: '',
      celular: '',
      fecha_inicio: '',
      fecha_fin: '',
      cv: '',
      contrasena: '',
    }
  }
}, { immediate: true })

const onSubmit = async (values: any, { resetForm, setErrors }: any) => {
  try {
    console.log('onSubmit values', values)
    isSubmitting.value = true
    let result
    if (props.graduateToEdit && props.graduateToEdit.graduate_id)
      result = await _updateGraduate(props.graduateToEdit.graduate_id, values)
    else
      result = await _addGraduate(values)

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
        snackbarMessage.value = 'Error al guardar graduado.'
      }
      isSnackbarVisible.value = true

      return
    }
    emit('success')
    emit('update:isDialogOpen', false)
    snackbarMessage.value = 'Graduado guardado correctamente.'
    isSnackbarVisible.value = true
    resetForm()
  }
  catch (error) {
    console.error('Error en onSubmit:', error)
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
        {{ props.graduateToEdit ? 'Editar graduado' : 'Agregar nuevo graduado' }}
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
                <span>Cargando datos del graduado...</span>
              </div>
            </VCol>
            <template v-else>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="nombres"
                >
                  <AppTextField
                    v-bind="field"
                    label="Nombres"
                    placeholder="Ej: Juan"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="apellidos"
                >
                  <AppTextField
                    v-bind="field"
                    label="Apellidos"
                    placeholder="Ej: Pérez"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="fecha_nacimiento"
                >
                  <AppTextField
                    v-bind="field"
                    label="Fecha de nacimiento"
                    type="date"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="genero"
                >
                  <AppSelect
                    v-bind="field"
                    :model-value="field.value"
                    :items="[{ title: 'Masculino', value: 'M' }, { title: 'Femenino', value: 'F' }]"
                    label="Género"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="correo"
                >
                  <AppTextField
                    v-bind="field"
                    label="Correo"
                    placeholder="correo@ejemplo.com"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="dni"
                >
                  <AppTextField
                    v-bind="field"
                    label="DNI"
                    placeholder="12345678"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="celular"
                >
                  <AppTextField
                    v-bind="field"
                    label="Celular"
                    placeholder="987654321"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="fecha_inicio"
                >
                  <AppTextField
                    v-bind="field"
                    label="Fecha de inicio"
                    type="date"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="fecha_fin"
                >
                  <AppTextField
                    v-bind="field"
                    label="Fecha de fin"
                    type="date"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="cv"
                >
                  <AppTextField
                    v-bind="field"
                    label="CV (archivo)"
                    placeholder="cv_nombre.pdf"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol cols="12">
                <Field
                  v-slot="{ field, errorMessage }"
                  name="contrasena"
                >
                  <AppTextField
                    v-bind="field"
                    label="Contraseña"
                    type="password"
                    :error-messages="errorMessage"
                  />
                </Field>
              </VCol>
              <VCol
                cols="12"
                class="d-flex justify-end gap-2"
              >
                <VBtn
                  type="submit"
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                >
                  Guardar
                </VBtn>
                <VBtn
                  type="button"
                  variant="tonal"
                  color="error"
                  :disabled="isSubmitting"
                  @click="closeDialog"
                >
                  Cancelar
                </VBtn>
              </VCol>
            </template>
          </VRow>
        </Form>
        <VSnackbar v-model="isSnackbarVisible">
          {{ snackbarMessage }}
        </VSnackbar>
      </VCardText>
    </VCard>
  </VDialog>
</template>
