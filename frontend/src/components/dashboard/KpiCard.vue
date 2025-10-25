<template>
  <q-card class="q-pa-md kpi-card">
    <div class="row items-center justify-between">
      <div>
        <div class="text-caption text-muted">{{ label }}</div>
        <div class="text-h5 q-mt-xs">
          {{ formatted }}
          <span v-if="suffix" class="text-caption text-muted">{{ suffix }}</span>
        </div>
      </div>
      <q-icon v-if="icon" :name="icon" :color="iconColor" size="md"/>
    </div>
    <slot name="suffix"/>
  </q-card>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ 
  label: string; 
  value: number | null | undefined; 
  format?: 'currency'|'int'|'percent'; 
  icon?: string;
  iconColor?: string;
  suffix?: string;
}>()

const formatted = computed(() => {
  const v = props.value ?? 0
  if (props.format === 'currency') return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v)
  if (props.format === 'percent') return `${Math.round(v)}%`
  return new Intl.NumberFormat('pt-BR').format(v)
})
</script>

<style scoped>
.kpi-card { min-height: 96px; }
</style>



