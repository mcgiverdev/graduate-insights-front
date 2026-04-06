<script setup lang="ts">
import { usePasswordChange } from '../composables/usePasswordChange'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

const { form, errors, submitting, submit } = usePasswordChange()

const handleSubmit = async () => {
  await submit()
}
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Actualizar contraseña</VCardTitle>
      <VCardSubtitle>Usa una contraseña segura con al menos 8 caracteres.</VCardSubtitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <VForm @submit.prevent="handleSubmit">
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="form.newPassword"
              label="Nueva contraseña"
              type="password"
              autocomplete="new-password"
              :error-messages="errors.newPassword ? [errors.newPassword] : []"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-model="form.confirmPassword"
              label="Confirmar contraseña"
              type="password"
              autocomplete="new-password"
              :error-messages="errors.confirmPassword ? [errors.confirmPassword] : []"
            />
          </VCol>
        </VRow>

        <VBtn
          type="submit"
          color="primary"
          block
          class="mt-4"
          :loading="submitting"
        >
          Guardar nueva contraseña
        </VBtn>
      </VForm>
    </VCardText>
  </VCard>
</template>
