<script setup lang="ts">
import { computed } from 'vue'
import { usePasswordChange } from '../composables/usePasswordChange'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'

const { form, errors, requirements, submitting, submit } = usePasswordChange()

const requirementsList = computed(() => [
  { label: 'Al menos 8 caracteres', met: requirements.value.minLength },
  { label: 'Al menos una letra minúscula', met: requirements.value.lower },
  { label: 'Al menos una letra mayúscula', met: requirements.value.upper },
  { label: 'Al menos un número', met: requirements.value.digit },
  { label: 'Al menos un carácter especial', met: requirements.value.special },
])

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

          <VCol v-if="form.newPassword" cols="12">
            <VList density="compact" class="pa-0 bg-transparent">
              <VListItem v-for="req in requirementsList" :key="req.label" class="px-0 py-0">
                <template #prepend>
                  <VIcon
                    :icon="req.met ? 'tabler-circle-check' : 'tabler-circle-x'"
                    :color="req.met ? 'success' : 'error'"
                    size="16"
                    class="me-2"
                  />
                </template>
                <VListItemTitle class="text-body-2" :class="req.met ? 'text-success' : 'text-error'">
                  {{ req.label }}
                </VListItemTitle>
              </VListItem>
            </VList>
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
