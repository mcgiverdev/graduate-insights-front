<script setup lang="ts">
import { ref } from 'vue'
import EmailConfigForm from '@/modules/email-config/components/EmailConfigForm.vue'
import EmailTestDialog from '@/modules/email-config/components/EmailTestDialog.vue'
import { useEmailConfig } from '@/modules/email-config/composables/useEmailConfig'
import { useUser } from '@/composables/useUser'
import { useSnackbar } from '@/composables/useSnackbar'
import type { EmailConfigFormValues } from '@/modules/email-config/types'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

const { config, loading, saving, sendingTest, saveConfig, sendTestEmail } = useEmailConfig()
const { user } = useUser()
const { showSnackbar } = useSnackbar()

const isTestDialogOpen = ref(false)

const handleSave = async (values: EmailConfigFormValues) => {
  const success = await saveConfig(values)
  if (success)
    showSnackbar({ text: 'Configuración guardada correctamente', color: 'success' })
}

const handleSendTest = async (email: string) => {
  const success = await sendTestEmail(email)
  if (success) {
    showSnackbar({ text: 'Email de prueba enviado correctamente', color: 'success' })
    isTestDialogOpen.value = false
  }
}
</script>

<template>
  <section>
    <VProgressLinear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <VCard>
      <VCardTitle>Configuración de Email (Resend)</VCardTitle>

      <VCardText>
        <VAlert
          type="info"
          variant="tonal"
          class="mb-4"
        >
          Configure su cuenta de Resend para el envío de correos electrónicos.
          Obtenga su API Key en resend.com
        </VAlert>

        <EmailConfigForm
          :config="config"
          :saving="saving"
          @save="handleSave"
          @test="isTestDialogOpen = true"
        />
      </VCardText>
    </VCard>

    <EmailTestDialog
      v-model="isTestDialogOpen"
      :default-email="user?.email ?? ''"
      :sending="sendingTest"
      @send="handleSendTest"
    />
  </section>
</template>
