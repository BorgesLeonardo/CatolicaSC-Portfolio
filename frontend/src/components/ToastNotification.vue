<template>
  <teleport to="body">
    <div class="toast-container" :class="`toast-container--${position}`">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[
            `toast--${toast.type}`,
            {
              'toast--dismissible': toast.dismissible !== false,
              'toast--persistent': toast.persistent
            }
          ]"
          @mouseenter="pauseTimer(toast.id)"
          @mouseleave="resumeTimer(toast.id)"
        >
          <!-- Toast Content -->
          <div class="toast-content">
            <!-- Icon -->
            <div class="toast-icon">
              <q-icon 
                :name="getToastIcon(toast.type)" 
                :color="getToastIconColor(toast.type)"
                size="md"
              />
            </div>
            
            <!-- Text Content -->
            <div class="toast-text">
              <div class="toast-title" v-if="toast.title">
                {{ toast.title }}
              </div>
              <div class="toast-message">
                {{ toast.message }}
              </div>
            </div>
            
            <!-- Actions -->
            <div class="toast-actions" v-if="toast.actions?.length">
              <q-btn
                v-for="action in toast.actions"
                :key="action.label"
                flat
                dense
                :label="action.label"
                :color="action.color || 'white'"
                @click="handleAction(toast.id, action)"
                class="toast-action-btn"
              />
            </div>
            
            <!-- Close Button -->
            <q-btn
              v-if="toast.dismissible !== false"
              flat
              dense
              round
              icon="close"
              color="white"
              size="sm"
              class="toast-close"
              @click="removeToast(toast.id)"
              aria-label="Fechar notificação"
            />
          </div>
          
          <!-- Progress Bar -->
          <div 
            v-if="toast.duration && toast.duration > 0 && !toast.persistent"
            class="toast-progress"
            :class="{ 'toast-progress--paused': toast.paused }"
            :style="{ 
              animationDuration: `${toast.duration}ms`,
              animationPlayState: toast.paused ? 'paused' : 'running'
            }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ToastAction {
  label: string
  color?: string
  action: () => void | Promise<void>
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  persistent?: boolean
  dismissible?: boolean
  actions?: ToastAction[]
  paused?: boolean
  timer?: number
}

interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5
})

const toasts = ref<Toast[]>([])
const timers = new Map<string, number>()

// Global toast function
const showToast = (options: Omit<Toast, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const toast: Toast = {
    id,
    duration: 5000,
    dismissible: true,
    persistent: false,
    ...options
  }
  
  // Remove oldest toast if at max capacity
  if (toasts.value.length >= props.maxToasts) {
    const oldestToast = toasts.value[0]
    removeToast(oldestToast.id)
  }
  
  toasts.value.push(toast)
  
  // Auto-remove after duration (if not persistent)
  if (toast.duration && toast.duration > 0 && !toast.persistent) {
    const timer = window.setTimeout(() => {
      removeToast(id)
    }, toast.duration)
    timers.set(id, timer)
  }
  
  return id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
  
  // Clear timer
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

const pauseTimer = (id: string) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) {
    toast.paused = true
  }
}

const resumeTimer = (id: string) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) {
    toast.paused = false
  }
}

const handleAction = async (toastId: string, action: ToastAction) => {
  try {
    await action.action()
  } catch {
    // noop: removed debug log
  }
  
  // Remove toast after action
  removeToast(toastId)
}

const getToastIcon = (type: Toast['type']) => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return icons[type]
}

const getToastIconColor = (type: Toast['type']) => {
  const colors = {
    success: 'white',
    error: 'white',
    warning: 'white',
    info: 'white'
  }
  return colors[type]
}

// Expose methods globally
onMounted(() => {
  // Add to global app instance if needed
  if (typeof window !== 'undefined') {
    interface WindowWithToast extends Window {
      $toast?: {
        success: (message: string, options?: Partial<Toast>) => string
        error: (message: string, options?: Partial<Toast>) => string
        warning: (message: string, options?: Partial<Toast>) => string
        info: (message: string, options?: Partial<Toast>) => string
        show: (options: Omit<Toast, 'id'>) => string
        remove: (id: string) => void
        clear: () => void
      }
    }
    (window as WindowWithToast).$toast = {
      success: (message: string, options?: Partial<Toast>) => 
        showToast({ type: 'success', message, ...options }),
      error: (message: string, options?: Partial<Toast>) => 
        showToast({ type: 'error', message, duration: 7000, ...options }),
      warning: (message: string, options?: Partial<Toast>) => 
        showToast({ type: 'warning', message, ...options }),
      info: (message: string, options?: Partial<Toast>) => 
        showToast({ type: 'info', message, ...options }),
      show: showToast,
      remove: removeToast,
      clear: () => {
        toasts.value.forEach(toast => removeToast(toast.id))
      }
    }
  }
})

onUnmounted(() => {
  // Clear all timers
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
})

// Expose for template
defineExpose({
  showToast,
  removeToast,
  toasts
})
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  z-index: 10000;
  max-width: 400px;
  padding: 16px;
  pointer-events: none;
  
  // Position variants
  &--top-right {
    top: 0;
    right: 0;
  }
  
  &--top-left {
    top: 0;
    left: 0;
  }
  
  &--bottom-right {
    bottom: 0;
    right: 0;
  }
  
  &--bottom-left {
    bottom: 0;
    left: 0;
  }
  
  &--top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &--bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

.toast {
  background: #1f2937;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  // Type variants
  &--success {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  }
  
  &--error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  &--warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
  
  &--info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
  
  &--dismissible {
    cursor: pointer;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.35);
  }
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  color: white;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.95;
}

.toast-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.toast-action-btn {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: none;
  padding: 4px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.toast-close {
  flex-shrink: 0;
  margin: -4px -4px -4px 8px;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  animation: toast-progress linear forwards;
  transform-origin: left;
}

.toast-progress--paused {
  animation-play-state: paused;
}

// === ANIMATIONS ===
@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

// === TRANSITIONS ===
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

// Position-specific enter animations
.toast-container--top-left .toast-enter-from,
.toast-container--bottom-left .toast-enter-from {
  transform: translateX(-100%) scale(0.9);
}

.toast-container--top-left .toast-leave-to,
.toast-container--bottom-left .toast-leave-to {
  transform: translateX(-100%) scale(0.9);
}

.toast-container--top-center .toast-enter-from,
.toast-container--bottom-center .toast-enter-from {
  transform: translateY(-100%) scale(0.9);
}

.toast-container--top-center .toast-leave-to,
.toast-container--bottom-center .toast-leave-to {
  transform: translateY(-100%) scale(0.9);
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .toast-container {
    left: 16px !important;
    right: 16px !important;
    max-width: none;
    transform: none !important;
  }
  
  .toast-content {
    padding: 14px;
    gap: 10px;
  }
  
  .toast-title {
    font-size: 0.925rem;
  }
  
  .toast-message {
    font-size: 0.8125rem;
  }
  
  .toast-actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .toast-action-btn {
    font-size: 0.75rem;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .toast-container {
    left: 12px !important;
    right: 12px !important;
    padding: 12px;
  }
  
  .toast-content {
    padding: 12px;
  }
}

// === ACCESSIBILITY ===
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: none;
  }
  
  .toast:hover {
    transform: none;
  }
  
  .toast-progress {
    animation: none;
  }
}

// === HIGH CONTRAST MODE ===
@media (prefers-contrast: high) {
  .toast {
    border: 2px solid white;
  }
  
  .toast-icon {
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
}

// Dark mode removed - manual theme control only
</style>
