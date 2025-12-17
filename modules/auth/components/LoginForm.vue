<script setup lang="ts">
import { nextTick } from 'vue'
import { useLoginForm } from '../composables/useLoginForm'

const emit = defineEmits<{ (e: 'success'): void }>()

const {
  form,
  loading,
  isPasswordVisible,
  handleSubmit,
} = useLoginForm()

const submit = async () => {
  const result = await handleSubmit()

  if (!result.success)
    return

  await nextTick()

  if (result.redirectTo) {
    await navigateTo(result.redirectTo, { replace: true })
    return
  }

  emit('success')
}
</script>

<template>
  <VForm @submit.prevent="submit">
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="form.email"
          autofocus
          label="Correo electrónico"
          type="email"
          placeholder="usuario@ejemplo.com"
        />
      </VCol>

      <VCol cols="12">
        <AppTextField
          v-model="form.password"
          label="Contraseña"
          placeholder="············"
          :type="isPasswordVisible ? 'text' : 'password'"
          autocomplete="password"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
        />

        <div class="d-flex align-center flex-wrap justify-space-between my-6">
          <VCheckbox
            v-model="form.remember"
            label="Recordarme"
          />
          <a
            class="text-primary"
            href="javascript:void(0)"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <VBtn
          block
          type="submit"
          :loading="loading"
        >
          Iniciar Sesión
        </VBtn>
      </VCol>

      <VCol
        cols="12"
        class="text-body-1 text-center mt-4"
      >
        <span class="d-inline-block">
          ¿Nuevo en la plataforma?
        </span>
        <a
          class="text-primary ms-1 d-inline-block text-body-1"
          href="javascript:void(0)"
        >
          Crear una cuenta
        </a>
      </VCol>
    </VRow>
  </VForm>
</template>
