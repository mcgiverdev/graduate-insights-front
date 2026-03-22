<script setup lang="ts">
import { PasswordChangeCard, ProfileDetailsForm } from '@/src/features/profile'

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
  title: 'Mi Perfil',
})
</script>

<template>
  <VContainer>
    <VRow class="gy-6">
      <VCol cols="12" lg="8">
        <ProfileDetailsForm />
      </VCol>
      <VCol cols="12" lg="4">
        <PasswordChangeCard />
      </VCol>
    </VRow>
  </VContainer>
</template>
