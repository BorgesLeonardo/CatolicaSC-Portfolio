<template>
  <q-card class="q-pa-md chart-card">
    <div class="text-subtitle1 q-mb-sm">{{ title }}</div>
    <div class="chart-wrapper">
      <div v-if="isEmpty" class="empty-state">
        <q-icon name="insert_chart_outlined" size="32px" color="grey-5"/>
        <div class="empty-title">Sem dados para exibir</div>
        <div class="empty-subtitle">Ajuste filtros ou tente mais tarde</div>
      </div>
      <template v-else>
        <Bar v-if="type==='bar'" :data="chartData" :options="options"/>
        <Line v-else-if="type==='line'" :data="chartData" :options="options"/>
        <Pie v-else-if="type==='pie'" :data="chartData" :options="options"/>
      </template>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler
} from 'chart.js'
import type { TooltipItem, ScriptableContext } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Filler)

const props = defineProps<{ 
  title:string; 
  type:'bar'|'line'|'pie'; 
  labels:string[]; 
  series:number[]; 
  color?: string; 
  currency?: boolean;
  showLegend?: boolean;
  height?: number;
}>()

const isEmpty = computed(() => !props.series || props.series.length === 0 || props.series.every(v => !v || v === 0))

const palette = ['#1e40af','#3b82f6','#f97316','#22c55e','#eab308','#ef4444','#06b6d4','#a78bfa']

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.series,
    backgroundColor: props.type === 'pie' 
      ? palette.slice(0, Math.max(3, Math.min(props.series.length, palette.length))) 
      : ((ctx: ScriptableContext<'line'|'bar'>) => {
          const color = props.color || '#3b82f6'
          if (props.type === 'line') {
            const { chart } = ctx
            const { ctx: canvasCtx, chartArea } = chart
            if (!chartArea) return color
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, `${color}33`)
            gradient.addColorStop(1, `${color}08`)
            return gradient
          }
          return color
        }),
    borderColor: props.color || '#3b82f6',
    borderWidth: props.type === 'line' ? 2 : 0,
    pointRadius: props.type === 'line' ? 2 : 0,
    pointHoverRadius: props.type === 'line' ? 4 : 0,
    tension: 0.25,
    fill: props.type === 'line',
    borderRadius: props.type === 'bar' ? 8 : 0
  }]
}))

function formatCurrency(value: number, compact = false) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: compact ? 'compact' : undefined, maximumFractionDigits: compact ? 1 : 0 }).format(value)
  } catch {
    return `R$ ${value.toFixed(compact ? 1 : 0)}`
  }
}

function formatNumber(value: number, compact = false) {
  try {
    return new Intl.NumberFormat('pt-BR', { notation: compact ? 'compact' : undefined, maximumFractionDigits: compact ? 1 : 0 }).format(value)
  } catch {
    return String(value)
  }
}

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 700, easing: 'easeOutCubic' },
  plugins: {
    legend: { display: props.type === 'pie' || !!props.showLegend, position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'|'bar'|'pie'>) => {
          const parsed = ctx.parsed as unknown
          let value = 0
          if (typeof parsed === 'number') {
            value = parsed
          } else if (parsed && typeof (parsed as Record<string, unknown>).value === 'number') {
            value = (parsed as Record<string, unknown>).value as number
          } else if (parsed && typeof (parsed as Record<string, unknown>).y === 'number') {
            value = (parsed as Record<string, unknown>).y as number
          }
          return props.currency ? formatCurrency(value) : formatNumber(value)
        }
      }
    }
  },
  scales: props.type !== 'pie' ? {
    x: {
      grid: { color: 'rgba(203, 213, 225, 0.2)' }
    },
    y: {
      grid: { color: 'rgba(203, 213, 225, 0.2)' },
      ticks: {
        callback: (val: number | string) => props.currency ? formatCurrency(Number(val), true) : formatNumber(Number(val), true)
      }
    }
  } : {}
}))
</script>

<style scoped>
.chart-card { min-height: 320px; }
.chart-wrapper { height: 260px; }
</style>


