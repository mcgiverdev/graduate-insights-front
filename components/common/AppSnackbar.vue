<script setup lang="ts">
import { useSnackbar } from '@/composables/useSnackbar'

const { snackbar } = useSnackbar()
</script>

<template>
  <Teleport to="body">
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
      elevation="1"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </Teleport>
</template>
