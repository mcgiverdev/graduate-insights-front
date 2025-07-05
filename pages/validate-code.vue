<script setup lang="ts">
import authV1BottomShape from '@images/svg/auth-v1-bottom-shape.svg?raw'
import authV1TopShape from '@images/svg/auth-v1-top-shape.svg?raw'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
  public: true,
})

const router = useRouter()
const otp = ref('')
const isOtpInserted = ref(false)
const email = ref('')
const loading = ref(false)
const error = ref('')

// Obtener el email de la query string
onMounted(() => {
  const route = useRoute()

  email.value = route.query.email?.toString() || ''
})

const onFinish = async () => {
  if (!email.value) {
    error.value = 'No se proporcionó un correo electrónico'

    return
  }

  try {
    loading.value = true

    const response = await useApi('/graduate-insights/v1/api/mail/validate-code', {
      method: 'POST',
      body: {
        email: email.value,
        code: otp.value,
      },
    })

    // Si el status es 200, consideramos que fue exitoso aunque no tenga cuerpo
    if (response.status === 200) {
      isOtpInserted.value = true
      error.value = ''

      // Esperar 2 segundos y redirigir
      setTimeout(() => {
        isOtpInserted.value = false
        router.push('/')
      }, 2000)
    }
    else {
      error.value = 'El código ingresado no es válido'
    }
  }
  catch (e: any) {
    error.value = e.data?.message || 'El código ingresado no es válido'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <NuxtLink to="/">
              <div class="app-logo">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="app-logo-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
            </NuxtLink>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <h4 class="text-h4 mb-1">
            Verificación de Cuenta 💬
          </h4>
          <p class="mb-1">
            Hemos enviado un código de verificación a tu correo electrónico. Ingresa el código para validar tu cuenta.
          </p>
          <h6 class="text-h6">
            {{ email }}
          </h6>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- código -->
              <VCol cols="12">
                <h6 class="text-body-1">
                  Ingresa el código de 6 dígitos
                </h6>
                <VOtpInput
                  v-model="otp"
                  :disabled="isOtpInserted || loading"
                  type="number"
                  class="pa-0"
                  @finish="onFinish"
                />

                <!-- Mostrar error si existe -->
                <VAlert
                  v-if="error"
                  type="error"
                  class="mt-4"
                  variant="tonal"
                >
                  {{ error }}
                </VAlert>
              </VCol>

              <!-- botón validar -->
              <VCol cols="12">
                <VBtn
                  :loading="loading || isOtpInserted"
                  :disabled="loading || isOtpInserted"
                  block
                  type="submit"
                >
                  Verificar mi cuenta
                </VBtn>
              </VCol>

              <!-- reenviar código -->
              <VCol cols="12">
                <div class="d-flex justify-center align-center flex-wrap">
                  <span class="me-1">¿No recibiste el código?</span>
                  <a
                    href="#"
                    @click.prevent="() => {}"
                  >
                    Reenviar
                  </a>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}
</style>
