<script setup lang="ts">
import { onMounted } from 'vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useProfileDetails } from '../composables/useProfileDetails'

const {
  form,
  loading,
  saving,
  serverErrors,
  isDirty,
  initialize,
  submit,
  resetForm,
} = useProfileDetails()

const { snackbar } = useSnackbar()

const genderItems = [
  { title: 'Masculino', value: 'M' },
  { title: 'Femenino', value: 'F' },
  { title: 'Otro', value: 'Otro' },
]

const handleSubmit = async () => {
  await submit()
}

onMounted(() => {
  initialize()
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Mi información personal</VCardTitle>
      <VCardSubtitle>Actualiza tus datos y mantén tu perfil al día.</VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <VAlert
        v-if="loading"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        Cargando información del perfil...
      </VAlert>

      <VForm @submit.prevent="handleSubmit">
        <VRow>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="form.nombres"
              label="Nombres"
              placeholder="Ingresa tus nombres"
              :error-messages="serverErrors.nombres ? [serverErrors.nombres] : []"
            />
          </VCol>
          <VCol cols="12" md="6">
            <AppTextField
              v-model="form.apellidos"
              label="Apellidos"
              placeholder="Ingresa tus apellidos"
              :error-messages="serverErrors.apellidos ? [serverErrors.apellidos] : []"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="form.correo"
              label="Correo electrónico"
              type="email"
              placeholder="usuario@ejemplo.com"
              :error-messages="serverErrors.correo ? [serverErrors.correo] : []"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="form.celular"
              label="Celular"
              placeholder="9XXXXXXXX"
              :error-messages="serverErrors.celular ? [serverErrors.celular] : []"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="form.dni"
              label="DNI"
              placeholder="Ingresa tu DNI"
              :error-messages="serverErrors.dni ? [serverErrors.dni] : []"
              readonly
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppSelect
              v-model="form.genero"
              label="Género"
              :items="genderItems"
              :error-messages="serverErrors.genero ? [serverErrors.genero] : []"
            />
          </VCol>

          <VCol cols="12" md="6">
            <AppTextField
              v-model="form.fechaNacimiento"
              label="Fecha de nacimiento"
              type="date"
              :error-messages="serverErrors.fecha_nacimiento ? [serverErrors.fecha_nacimiento] : []"
            />
          </VCol>
        </VRow>

        <div class="d-flex flex-wrap gap-4 mt-6">
          <VBtn
            type="submit"
            color="primary"
            :loading="saving"
            :disabled="!isDirty && !serverErrors.nombres && !serverErrors.apellidos"
          >
            Guardar cambios
          </VBtn>

          <VBtn
            variant="tonal"
            color="secondary"
            :disabled="!isDirty || saving"
            @click.prevent="resetForm"
          >
            Deshacer
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>

  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top right"
  >
    {{ snackbar.text }}
  </VSnackbar>
</template>
