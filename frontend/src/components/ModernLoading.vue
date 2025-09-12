<template>
  <div class="modern-loading" :class="{ 'modern-loading--fullscreen': fullscreen }">
    <div class="loading-content">
      <!-- Animated Logo -->
      <div class="loading-logo">
        <q-icon 
          name="campaign" 
          :size="iconSize" 
          color="primary"
          class="logo-icon animate-pulse"
        />
        <div class="logo-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>
      </div>
      
      <!-- Loading Text -->
      <div class="loading-text" v-if="!hideText">
        <h3 class="loading-title">{{ title }}</h3>
        <p class="loading-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      
      <!-- Progress Bar -->
      <div class="loading-progress" v-if="showProgress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
      
      <!-- Loading Dots -->
      <div class="loading-dots" v-if="showDots">
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="dot dot-3"></div>
      </div>
    </div>
    
    <!-- Background Overlay -->
    <div class="loading-overlay" v-if="fullscreen"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  fullscreen?: boolean
  showProgress?: boolean
  progress?: number
  showDots?: boolean
  hideText?: boolean
  iconSize?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Carregando...',
  subtitle: 'Aguarde um momento',
  fullscreen: false,
  showProgress: false,
  progress: 0,
  showDots: true,
  hideText: false,
  iconSize: '4xl'
})
</script>

<style scoped lang="scss">
.modern-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
}

.loading-content {
  text-align: center;
  max-width: 400px;
  position: relative;
  z-index: 2;
}

.loading-logo {
  position: relative;
  display: inline-block;
  margin-bottom: 32px;
}

.logo-icon {
  position: relative;
  z-index: 3;
  filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
}

.logo-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.ring {
  position: absolute;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  animation: ripple 2s ease-out infinite;
  
  &.ring-1 {
    width: 80px;
    height: 80px;
    margin: -40px 0 0 -40px;
    animation-delay: 0s;
  }
  
  &.ring-2 {
    width: 120px;
    height: 120px;
    margin: -60px 0 0 -60px;
    animation-delay: 0.5s;
  }
  
  &.ring-3 {
    width: 160px;
    height: 160px;
    margin: -80px 0 0 -80px;
    animation-delay: 1s;
  }
}

.loading-text {
  margin-bottom: 32px;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}

.loading-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.loading-progress {
  margin-bottom: 32px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: shimmer 1.5s infinite;
  }
}

.progress-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  animation: bounce 1.4s ease-in-out infinite both;
  
  &.dot-1 {
    animation-delay: -0.32s;
  }
  
  &.dot-2 {
    animation-delay: -0.16s;
  }
  
  &.dot-3 {
    animation-delay: 0s;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  z-index: 1;
}

// === ANIMATIONS ===
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
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
@media (max-width: 768px) {
  .loading-content {
    max-width: 300px;
  }
  
  .loading-title {
    font-size: 1.25rem;
  }
  
  .loading-subtitle {
    font-size: 0.875rem;
  }
  
  .ring {
    &.ring-1 {
      width: 60px;
      height: 60px;
      margin: -30px 0 0 -30px;
    }
    
    &.ring-2 {
      width: 90px;
      height: 90px;
      margin: -45px 0 0 -45px;
    }
    
    &.ring-3 {
      width: 120px;
      height: 120px;
      margin: -60px 0 0 -60px;
    }
  }
}

// Dark mode removed - manual theme control only

// === REDUCED MOTION SUPPORT ===
@media (prefers-reduced-motion: reduce) {
  .ring,
  .dot,
  .logo-icon {
    animation: none !important;
  }
  
  .progress-fill::after {
    animation: none !important;
  }
}
</style>
