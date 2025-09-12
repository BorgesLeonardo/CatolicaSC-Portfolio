<template>
  <div class="floating-action-menu" :class="{ 'floating-action-menu--open': isOpen }">
    <!-- Main FAB Button -->
    <q-btn
      fab
      :icon="isOpen ? 'close' : mainIcon"
      :color="mainColor"
      class="main-fab"
      :class="{ 'main-fab--open': isOpen }"
      @click="toggleMenu"
      :aria-label="isOpen ? 'Fechar menu' : 'Abrir menu de ações'"
    >
      <q-tooltip v-if="!isOpen" :delay="500" anchor="center left" self="center right">
        {{ mainTooltip }}
      </q-tooltip>
    </q-btn>

    <!-- Action Items -->
    <transition-group name="fab-items" tag="div" class="fab-items">
      <div
        v-for="(action, index) in actions"
        :key="action.id || index"
        class="fab-item"
        :style="{ 
          '--item-index': index,
          '--total-items': actions.length 
        }"
      >
        <q-btn
          fab
          :icon="action.icon"
          :color="action.color || 'white'"
          :text-color="action.textColor || 'grey-8'"
          class="action-fab"
          @click="handleAction(action)"
          :loading="action.loading"
          :disable="action.disabled"
          :aria-label="action.label"
        >
          <q-tooltip :delay="300" anchor="center left" self="center right">
            {{ action.label }}
          </q-tooltip>
        </q-btn>
        
        <!-- Action Label -->
        <div class="action-label" v-if="showLabels">
          {{ action.label }}
        </div>
      </div>
    </transition-group>

    <!-- Backdrop -->
    <div 
      class="fab-backdrop" 
      :class="{ 'fab-backdrop--visible': isOpen }"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ActionItem {
  id?: string
  icon: string
  label: string
  color?: string
  textColor?: string
  loading?: boolean
  disabled?: boolean
  action?: () => void | Promise<void>
}

interface Props {
  actions: ActionItem[]
  mainIcon?: string
  mainColor?: string
  mainTooltip?: string
  showLabels?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  offset?: { x: number; y: number }
}

const props = withDefaults(defineProps<Props>(), {
  mainIcon: 'add',
  mainColor: 'primary',
  mainTooltip: 'Ações rápidas',
  showLabels: true,
  position: 'bottom-right',
  offset: () => ({ x: 24, y: 24 })
})

const emit = defineEmits<{
  action: [action: ActionItem]
  open: []
  close: []
}>()

const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('open')
  } else {
    emit('close')
  }
}

function closeMenu() {
  isOpen.value = false
  emit('close')
}

async function handleAction(action: ActionItem) {
  emit('action', action)
  
  if (action.action) {
    try {
      await action.action()
    } catch (error) {
      console.error('Error executing action:', error)
    }
  }
  
  // Close menu after action
  closeMenu()
}
</script>

<style scoped lang="scss">
.floating-action-menu {
  position: fixed;
  z-index: 1000;
  
  // Position variants
  bottom: v-bind('props.offset.y + "px"');
  right: v-bind('props.offset.x + "px"');
  
  &[data-position="bottom-left"] {
    bottom: v-bind('props.offset.y + "px"');
    left: v-bind('props.offset.x + "px"');
    right: auto;
  }
  
  &[data-position="top-right"] {
    top: v-bind('props.offset.y + "px"');
    right: v-bind('props.offset.x + "px"');
    bottom: auto;
  }
  
  &[data-position="top-left"] {
    top: v-bind('props.offset.y + "px"');
    left: v-bind('props.offset.x + "px"');
    bottom: auto;
    right: auto;
  }
}

.main-fab {
  position: relative;
  z-index: 1002;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
  
  &--open {
    transform: rotate(45deg);
    
    &:hover {
      transform: rotate(45deg) scale(1.1);
    }
  }
  
  // Pulse animation when closed
  &:not(.main-fab--open) {
    animation: fabPulse 2s infinite;
  }
}

.fab-items {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: none;
  
  .floating-action-menu--open & {
    pointer-events: auto;
  }
}

.fab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: calc(var(--item-index) * 0.05s);
  
  .floating-action-menu--open & {
    opacity: 1;
    transform: translateY(calc(-80px * (var(--item-index) + 1))) scale(1);
  }
}

.action-fab {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.action-label {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  order: -1;
}

.fab-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  
  &--visible {
    opacity: 1;
    visibility: visible;
  }
}

// === ANIMATIONS ===
@keyframes fabPulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 10px rgba(99, 102, 241, 0);
  }
}

// === TRANSITIONS ===
.fab-items-enter-active,
.fab-items-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-items-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fab-items-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .floating-action-menu {
    bottom: 20px;
    right: 20px;
  }
  
  .action-label {
    display: none;
  }
  
  .fab-items {
    gap: 12px;
  }
  
  .fab-item {
    .floating-action-menu--open & {
      transform: translateY(calc(-70px * (var(--item-index) + 1))) scale(1);
    }
  }
}

@media (max-width: 480px) {
  .floating-action-menu {
    bottom: 16px;
    right: 16px;
  }
  
  .main-fab {
    .q-btn {
      width: 48px;
      height: 48px;
    }
  }
  
  .action-fab {
    .q-btn {
      width: 40px;
      height: 40px;
    }
  }
}

// === ACCESSIBILITY ===
@media (prefers-reduced-motion: reduce) {
  .main-fab,
  .fab-item,
  .action-fab,
  .fab-backdrop {
    transition: none !important;
    animation: none !important;
  }
  
  .main-fab:not(.main-fab--open) {
    animation: none !important;
  }
}

// Dark mode removed - manual theme control only

// === HIGH CONTRAST MODE ===
@media (prefers-contrast: high) {
  .main-fab,
  .action-fab {
    border: 2px solid currentColor;
  }
  
  .action-label {
    border: 1px solid currentColor;
  }
}
</style>
