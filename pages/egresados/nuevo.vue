<script setup lang="ts">
import { GraduateWizardForm } from '@/src/features/graduates'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})
</script>

<template>
  <GraduateWizardForm :start-step="1" />
</template>
