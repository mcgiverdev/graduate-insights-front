<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, Form } from 'vee-validate'
import { ref, watch } from 'vue'
import * as z from 'zod'
import { useDirectorService } from '@/composables/useDirectorService'

interface Emit {
  (e: 'update:isDialogOpen', value: boolean): void
  (e: 'success'): void
}

interface Props {
  isDialogOpen: boolean
  directorToEdit?: any
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
  contrasena: z.string().min(1, 'Este campo es obligatorio'),
}))

const { addDirector: _addDirector, updateDirector: _updateDirector, loadingForm } = useDirectorService()

const initialValues = ref({
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  genero: 'M',
  correo: '',
  dni: '',
  celular: '',
  contrasena: '',
})

watch(() => props.directorToEdit, director => {
  if (director) {
    initialValues.value = {
      nombres: director.nombres || '',
      apellidos: director.apellidos || '',
      fecha_nacimiento: director.fecha_nacimiento || '',
      genero: director.genero || 'M',
      correo: director.correo || '',
      dni: director.dni || '',
      celular: director.celular || '',
      contrasena: '',
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
      contrasena: '',
    }
  }
}, { immediate: true })

const onSubmit = async (values: any, { resetForm, setErrors }: any) => {
  try {
    isSubmitting.value = true
    let result
    if (props.directorToEdit && props.directorToEdit.director_id)
      result = await _updateDirector(props.directorToEdit.director_id, values)
    else
      result = await _addDirector(values)

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
        snackbarMessage.value = 'Error al guardar director.'
      }
      isSnackbarVisible.value = true

      return
    }
    emit('success')
    emit('update:isDialogOpen', false)
    snackbarMessage.value = 'Director guardado correctamente.'
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
        {{ props.directorToEdit ? 'Editar director' : 'Agregar nuevo director' }}
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
                <span>Cargando datos del director...</span>
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
                    label="Fecha de Nacimiento"
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
                    label="Género"
                    :items="[
                      { value: 'M', title: 'Masculino' },
                      { value: 'F', title: 'Femenino' },
                    ]"
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
                {{ props.directorToEdit ? 'Actualizar' : 'Guardar' }}
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
