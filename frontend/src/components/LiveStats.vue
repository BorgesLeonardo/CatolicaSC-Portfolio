<template>
  <div class="live-stats" :class="{ 'live-stats--animated': animated }">
    <div class="stats-container">
      <div 
        v-for="(stat, index) in stats" 
        :key="stat.id"
        class="stat-item"
        :class="[
          `stat-item--${stat.variant || 'default'}`,
          { 'stat-item--loading': stat.loading }
        ]"
        :style="{ animationDelay: animated ? `${index * 0.1}s` : undefined }"
      >
        <!-- Stat Icon -->
        <div class="stat-icon" :class="`stat-icon--${stat.variant || 'default'}`">
          <q-icon 
            :name="stat.icon" 
            :size="iconSize"
            :color="stat.iconColor || getVariantColor(stat.variant)"
          />
          
          <!-- Pulse Animation for Live Updates -->
          <div 
            class="stat-pulse" 
            v-if="stat.live && !stat.loading"
            :class="`stat-pulse--${stat.variant || 'default'}`"
          ></div>
        </div>
        
        <!-- Stat Content -->
        <div class="stat-content">
          <!-- Value with Animation -->
          <div class="stat-value-container">
            <div 
              class="stat-value" 
              :class="{ 'stat-value--updating': stat.updating }"
            >
              <AnimatedNumber 
                :value="stat.value" 
                :format="stat.format"
                :duration="animationDuration"
              />
            </div>
            
            <!-- Change Indicator -->
            <div 
              v-if="stat.change !== undefined" 
              class="stat-change"
              :class="{
                'stat-change--positive': stat.change > 0,
                'stat-change--negative': stat.change < 0,
                'stat-change--neutral': stat.change === 0
              }"
            >
              <q-icon 
                :name="getChangeIcon(stat.change)" 
                size="xs" 
                class="change-icon"
              />
              <span class="change-text">{{ formatChange(stat.change) }}</span>
            </div>
          </div>
          
          <!-- Label and Description -->
          <div class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.description" class="stat-description">
            {{ stat.description }}
          </div>
          
          <!-- Progress Bar (if applicable) -->
          <div v-if="stat.progress !== undefined" class="stat-progress">
            <div 
              class="progress-bar"
              :class="`progress-bar--${stat.variant || 'default'}`"
            >
              <div 
                class="progress-fill"
                :style="{ 
                  width: `${Math.min(stat.progress, 100)}%`,
                  background: getVariantGradient(stat.variant)
                }"
              ></div>
            </div>
            <div class="progress-text">{{ stat.progress }}%</div>
          </div>
        </div>
        
        <!-- Loading Overlay -->
        <div v-if="stat.loading" class="stat-loading">
          <q-spinner size="sm" :color="getVariantColor(stat.variant)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnimatedNumber from './AnimatedNumber.vue'

interface StatItem {
  id: string
  icon: string
  iconColor?: string
  label: string
  description?: string
  value: number
  format?: 'number' | 'currency' | 'percentage'
  change?: number
  progress?: number
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  live?: boolean
  loading?: boolean
  updating?: boolean
}

interface Props {
  stats: StatItem[]
  animated?: boolean
  iconSize?: string
  animationDuration?: number
  layout?: 'horizontal' | 'vertical' | 'grid'
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  iconSize: 'lg',
  animationDuration: 1000,
  layout: 'horizontal',
  columns: 4
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  statClick: [stat: StatItem]
  refresh: []
}>()

// Computed styles for grid layout
const containerStyles = computed(() => {
  if (props.layout === 'grid') {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(props.columns, props.stats.length)}, 1fr)`,
      gap: '24px'
    }
  }
  return {}
})

function getVariantColor(variant?: string): string {
  const colors = {
    primary: 'primary',
    secondary: 'secondary',
    success: 'positive',
    warning: 'warning',
    danger: 'negative',
    info: 'info'
  }
  return colors[variant as keyof typeof colors] || 'primary'
}

function getVariantGradient(variant?: string): string {
  const gradients = {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    success: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  }
  return gradients[variant as keyof typeof gradients] || gradients.primary
}

function getChangeIcon(change: number): string {
  if (change > 0) return 'trending_up'
  if (change < 0) return 'trending_down'
  return 'trending_flat'
}

function formatChange(change: number): string {
  const abs = Math.abs(change)
  const sign = change > 0 ? '+' : change < 0 ? '-' : ''
  return `${sign}${abs.toFixed(1)}%`
}

// Removed unused function - handleStatClick
</script>

<style scoped lang="scss">
.live-stats {
  width: 100%;
}

.stats-container {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  
  .live-stats[data-layout="vertical"] & {
    flex-direction: column;
  }
  
  .live-stats[data-layout="grid"] & {
    display: grid;
    grid-template-columns: v-bind('containerStyles.gridTemplateColumns');
    gap: v-bind('containerStyles.gap');
  }
}

.stat-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex: 1;
  min-width: 200px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    border-color: rgba(30, 64, 175, 0.3);
  }
  
  // Variant styles
  &--primary {
    border-color: rgba(30, 64, 175, 0.2);
    background: linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  }
  
  &--secondary {
    border-color: rgba(16, 185, 129, 0.2);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%);
  }
  
  &--success {
    border-color: rgba(34, 197, 94, 0.2);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  }
  
  &--warning {
    border-color: rgba(245, 158, 11, 0.2);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%);
  }
  
  &--danger {
    border-color: rgba(239, 68, 68, 0.2);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
  }
  
  &--info {
    border-color: rgba(59, 130, 246, 0.2);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
  }
  
  &--loading {
    pointer-events: none;
  }
}

.live-stats--animated .stat-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
}

.stat-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  margin-bottom: 16px;
  
  &--primary { background: rgba(30, 64, 175, 0.1); }
  &--secondary { background: rgba(16, 185, 129, 0.1); }
  &--success { background: rgba(34, 197, 94, 0.1); }
  &--warning { background: rgba(245, 158, 11, 0.1); }
  &--danger { background: rgba(239, 68, 68, 0.1); }
  &--info { background: rgba(59, 130, 246, 0.1); }
  &--default { background: rgba(107, 114, 128, 0.1); }
}

.stat-pulse {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 18px;
  animation: pulse 2s infinite;
  
  &--primary { background: rgba(30, 64, 175, 0.3); }
  &--secondary { background: rgba(16, 185, 129, 0.3); }
  &--success { background: rgba(34, 197, 94, 0.3); }
  &--warning { background: rgba(245, 158, 11, 0.3); }
  &--danger { background: rgba(239, 68, 68, 0.3); }
  &--info { background: rgba(59, 130, 246, 0.3); }
  &--default { background: rgba(107, 114, 128, 0.3); }
}

.stat-content {
  flex: 1;
}

.stat-value-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  transition: all 0.3s ease;
  
  &--updating {
    color: #1e40af;
    animation: pulse 1s infinite;
  }
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  
  &--positive {
    color: #1e40af;
    background: rgba(30, 64, 175, 0.1);
  }
  
  &--negative {
    color: #dc2626;
    background: rgba(239, 68, 68, 0.1);
  }
  
  &--neutral {
    color: #6b7280;
    background: rgba(107, 114, 128, 0.1);
  }
}

.change-icon {
  flex-shrink: 0;
}

.stat-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.stat-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 12px;
}

.stat-progress {
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  text-align: right;
}

.stat-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

// === ANIMATIONS ===
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 1024px) {
  .stats-container {
    gap: 20px;
  }
  
  .stat-item {
    min-width: 180px;
    padding: 20px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .stat-item {
    min-width: unset;
    padding: 16px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
}

// Dark mode removed - manual theme control only

// === ACCESSIBILITY ===
@media (prefers-reduced-motion: reduce) {
  .stat-item,
  .stat-pulse,
  .progress-fill {
    animation: none !important;
    transition: none !important;
  }
  
  .stat-item:hover {
    transform: none;
  }
}
</style>
