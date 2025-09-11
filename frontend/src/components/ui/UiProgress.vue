<template>
  <div class="ui-progress">
    <div class="row items-center justify-between q-mb-xs">
      <span class="text-caption text-weight-600">{{ label }}</span>
      <span class="text-caption text-grey-7">{{ percentage }}%</span>
    </div>
    <q-linear-progress
      :value="percentage / 100"
      :color="progressColor"
      size="8px"
      rounded
      class="rounded-borders"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  current: number
  total: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min(Math.round((props.current / props.total) * 100), 100)
})

const progressColor = computed(() => {
  if (percentage.value >= 100) return 'positive'
  if (percentage.value >= 75) return 'warning'
  return props.color
})
</script>
