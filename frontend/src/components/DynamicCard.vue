<template>
  <div 
    class="dynamic-card"
    :class="[
      `dynamic-card--${variant}`,
      `dynamic-card--${size}`,
      {
        'dynamic-card--interactive': interactive,
        'dynamic-card--elevated': elevated,
        'dynamic-card--glass': glass,
        'dynamic-card--gradient': gradient,
        'dynamic-card--animated': animated
      }
    ]"
    @click="handleClick"
    :style="customStyles"
  >
    <!-- Background Pattern -->
    <div class="card-pattern" v-if="pattern"></div>
    
    <!-- Gradient Overlay -->
    <div class="card-gradient-overlay" v-if="gradientOverlay"></div>
    
    <!-- Content -->
    <div class="card-content" :class="{ 'card-content--centered': centered }">
      <!-- Header -->
      <header class="card-header" v-if="$slots.header || title">
        <slot name="header">
          <div class="card-title-section">
            <div class="card-icon" v-if="icon">
              <q-icon :name="icon" :size="iconSize" :color="iconColor" />
            </div>
            <div class="card-title-content">
              <h3 class="card-title" v-if="title">{{ title }}</h3>
              <p class="card-subtitle" v-if="subtitle">{{ subtitle }}</p>
            </div>
            <div class="card-actions" v-if="$slots.actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </slot>
      </header>

      <!-- Main Content -->
      <main class="card-body">
        <slot></slot>
      </main>

      <!-- Footer -->
      <footer class="card-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </footer>
    </div>

    <!-- Loading Overlay -->
    <div class="card-loading-overlay" v-if="loading">
      <q-spinner size="lg" color="primary" />
    </div>

    <!-- Hover Effect -->
    <div class="card-hover-effect" v-if="interactive"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  elevated?: boolean
  glass?: boolean
  gradient?: boolean
  animated?: boolean
  pattern?: boolean
  gradientOverlay?: boolean
  centered?: boolean
  loading?: boolean
  title?: string
  subtitle?: string
  icon?: string
  iconSize?: string
  iconColor?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  borderRadius?: string
  padding?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  interactive: false,
  elevated: false,
  glass: false,
  gradient: false,
  animated: true,
  pattern: false,
  gradientOverlay: false,
  centered: false,
  loading: false,
  iconSize: 'md',
  iconColor: 'primary'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const customStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.backgroundColor) styles['--card-bg'] = props.backgroundColor
  if (props.borderColor) styles['--card-border'] = props.borderColor
  if (props.textColor) styles['--card-text'] = props.textColor
  if (props.borderRadius) styles['--card-radius'] = props.borderRadius
  if (props.padding) styles['--card-padding'] = props.padding
  
  return styles
})

function handleClick(event: MouseEvent) {
  if (props.interactive) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.dynamic-card {
  --card-bg: var(--color-surface);
  --card-border: rgba(226, 232, 240, 0.5);
  --card-text: #0f172a;
  --card-radius: 16px;
  --card-padding: 24px;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --card-shadow-hover: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
  
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  color: var(--card-text);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  // === VARIANTS ===
  &--primary {
    --card-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    --card-border: rgba(99, 102, 241, 0.2);
  }
  
  &--secondary {
    --card-bg: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%);
    --card-border: rgba(16, 185, 129, 0.2);
  }
  
  &--success {
    --card-bg: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%);
    --card-border: rgba(34, 197, 94, 0.2);
  }
  
  &--warning {
    --card-bg: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%);
    --card-border: rgba(245, 158, 11, 0.2);
  }
  
  &--danger {
    --card-bg: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(248, 113, 113, 0.05) 100%);
    --card-border: rgba(239, 68, 68, 0.2);
  }
  
  &--info {
    --card-bg: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
    --card-border: rgba(59, 130, 246, 0.2);
  }
  
  // === SIZES ===
  &--xs {
    --card-padding: 12px;
    --card-radius: 8px;
  }
  
  &--sm {
    --card-padding: 16px;
    --card-radius: 12px;
  }
  
  &--md {
    --card-padding: 24px;
    --card-radius: 16px;
  }
  
  &--lg {
    --card-padding: 32px;
    --card-radius: 20px;
  }
  
  &--xl {
    --card-padding: 40px;
    --card-radius: 24px;
  }
  
  // === MODIFIERS ===
  &--interactive {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: var(--card-shadow-hover);
      
      .card-hover-effect {
        opacity: 1;
      }
    }
    
    &:active {
      transform: translateY(-2px) scale(1.01);
    }
  }
  
  &--elevated {
    --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    --card-shadow-hover: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  &--glass {
    --card-bg: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    --card-border: rgba(255, 255, 255, 0.2);
  }
  
  &--gradient {
    background: linear-gradient(135deg, var(--card-bg) 0%, rgba(99, 102, 241, 0.1) 100%);
  }
  
  &--animated {
    animation: fadeInUp 0.6s ease-out forwards;
  }
}

// === INTERNAL ELEMENTS ===
.card-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23000000" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>') repeat;
  z-index: 1;
}

.card-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%);
  z-index: 2;
}

.card-content {
  position: relative;
  z-index: 3;
  padding: var(--card-padding);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &--centered {
    text-align: center;
    align-items: center;
    justify-content: center;
  }
}

.card-header {
  margin-bottom: 20px;
}

.card-title-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
}

.card-title-content {
  flex: 1;
}

.card-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--card-text);
  margin: 0 0 4px 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.card-subtitle {
  font-size: 0.925rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.card-actions {
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.card-loading-overlay {
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
  z-index: 10;
}

.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
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

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .dynamic-card {
    --card-padding: 20px;
    
    &--xs {
      --card-padding: 8px;
    }
    
    &--sm {
      --card-padding: 12px;
    }
    
    &--lg {
      --card-padding: 24px;
    }
    
    &--xl {
      --card-padding: 28px;
    }
  }
  
  .card-title-section {
    gap: 12px;
  }
  
  .card-title {
    font-size: 1.25rem;
  }
  
  .card-subtitle {
    font-size: 0.875rem;
  }
}

// Dark mode removed - manual theme control only
</style>
