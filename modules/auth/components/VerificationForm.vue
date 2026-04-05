<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useVerificationForm } from '../composables/useVerificationForm'
import { useRoute } from '#imports'

const emit = defineEmits<{ (e: 'verified'): void }>()

const {
  state,
  setEmail,
  submit,
  resend,
  cleanup,
} = useVerificationForm()

const route = useRoute()

onMounted(() => {
  const email = route.query.email?.toString() || ''

  setEmail(email)
})

onUnmounted(cleanup)

const handleSubmit = async () => {
  const result = await submit()
  if (result.success)
    emit('verified')
}
</script>

<template>
  <VForm @submit.prevent="handleSubmit">
    <VRow>
      <VCol cols="12">
        <h6 class="text-body-1">
          Ingresa el código de 6 dígitos enviado a {{ state.email }}
        </h6>
        <VOtpInput
          v-model="state.otp"
          :disabled="state.isOtpInserted || state.loading"
          type="number"
          class="pa-0"
          @finish="handleSubmit"
        />

        <VAlert
          v-if="state.message"
          type="success"
          class="mt-4"
          variant="tonal"
        >
          {{ state.message }}
        </VAlert>

        <VAlert
          v-if="state.error"
          type="error"
          class="mt-4"
          variant="tonal"
        >
          {{ state.error }}
        </VAlert>
      </VCol>

      <VCol cols="12">
        <VBtn
          :loading="state.loading || state.isOtpInserted"
          :disabled="state.loading || state.isOtpInserted || state.otp.length !== 6"
          block
          type="submit"
        >
          <span v-if="state.isOtpInserted">
            ✓ Código verificado
          </span>
          <span v-else>
            Verificar mi cuenta
          </span>
        </VBtn>
      </VCol>

      <VCol cols="12">
        <div class="d-flex justify-center align-center flex-wrap">
          <span class="me-1">¿No recibiste el código?</span>
          <VBtn
            variant="text"
            size="small"
            :loading="state.resendLoading"
            :disabled="state.resendLoading || state.resendCooldown > 0 || state.isOtpInserted"
            @click="resend"
          >
            <span v-if="state.resendCooldown > 0">
              Reenviar en {{ state.resendCooldown }}s
            </span>
            <span v-else>
              Reenviar código
            </span>
          </VBtn>
        </div>
      </VCol>
    </VRow>
  </VForm>
</template>
