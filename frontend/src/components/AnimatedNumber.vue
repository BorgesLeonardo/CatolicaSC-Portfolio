<template>
  <span class="animated-number">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  value: number
  format?: 'number' | 'currency' | 'percentage'
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  separator?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number',
  duration: 1000,
  decimals: 0,
  separator: ','
})

const displayValue = ref('')
const currentValue = ref(0)

function formatNumber(num: number): string {
  const rounded = Number(num.toFixed(props.decimals))
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
      }).format(rounded)
      
    case 'percentage':
      return `${rounded.toLocaleString('pt-BR', {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
      })}%`
      
    case 'number':
    default: {
      const formatted = rounded.toLocaleString('pt-BR', {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
      })
      
      return `${props.prefix || ''}${formatted}${props.suffix || ''}`
    }
  }
}

function animateToValue(targetValue: number) {
  const startValue = currentValue.value
  const difference = targetValue - startValue
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // Easing function (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    
    currentValue.value = startValue + (difference * easedProgress)
    displayValue.value = formatNumber(currentValue.value)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      currentValue.value = targetValue
      displayValue.value = formatNumber(targetValue)
    }
  }
  
  animate()
}

// Watch for value changes
watch(() => props.value, (newValue) => {
  animateToValue(newValue)
}, { immediate: false })

// Initialize
onMounted(() => {
  displayValue.value = formatNumber(props.value)
  currentValue.value = props.value
})
</script>

<style scoped lang="scss">
.animated-number {
  display: inline-block;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
</style>
