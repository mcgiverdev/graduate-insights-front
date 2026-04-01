<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  surveyId: number
  color?: string
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  iconOnly?: boolean
  disabled?: boolean
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'elevated',
  size: 'default',
  iconOnly: false,
  disabled: false,
  buttonText: 'Ver Estadísticas',
})

const router = useRouter()

const isValidSurveyId = computed(() => {
  return props.surveyId && !isNaN(props.surveyId) && props.surveyId > 0
})

function navigateToStatistics() {
  if (!isValidSurveyId.value) {
    console.error('ID de encuesta inválido:', props.surveyId)

    return
  }

  router.push({
    path: `/estadisticas-encuesta/${props.surveyId}`,
  })
}
</script>

<template>
  <VBtn
    :color="color"
    :variant="variant"
    :size="size"
    :icon="iconOnly"
    :disabled="disabled"
    @click="navigateToStatistics"
  >
    <VIcon
      v-if="iconOnly"
      icon="tabler-chart-bar"
    />
    <template v-else>
      <VIcon
        start
        icon="tabler-chart-bar"
      />
      {{ buttonText }}
    </template>
    <slot />
  </VBtn>
</template>
