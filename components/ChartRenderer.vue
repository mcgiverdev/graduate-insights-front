<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Line, Pie } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
)

defineProps<{
  chartType: 'pie' | 'line' | 'bar'
  data: any
  options: any
}>()
</script>

<template>
  <Pie
    v-if="chartType === 'pie'"
    :data="data"
    :options="options"
  />
  <Line
    v-else-if="chartType === 'line'"
    :data="data"
    :options="options"
  />
  <Bar
    v-else-if="chartType === 'bar'"
    :data="data"
    :options="options"
  />
</template>
