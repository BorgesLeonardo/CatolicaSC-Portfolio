<template>
  <nav class="dynamic-breadcrumb" :class="{ 'dynamic-breadcrumb--animated': animated }">
    <div class="breadcrumb-container">
      <!-- Home Icon -->
      <div class="breadcrumb-item breadcrumb-item--home">
        <router-link to="/" class="breadcrumb-link" aria-label="Início">
          <q-icon name="home" size="sm" />
        </router-link>
      </div>
      
      <!-- Breadcrumb Items -->
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <div class="breadcrumb-separator">
          <q-icon name="chevron_right" size="xs" />
        </div>
        
        <div 
          class="breadcrumb-item"
          :class="{ 
            'breadcrumb-item--active': index === breadcrumbItems.length - 1,
            'breadcrumb-item--clickable': item.to && index !== breadcrumbItems.length - 1
          }"
        >
          <router-link 
            v-if="item.to && index !== breadcrumbItems.length - 1"
            :to="item.to"
            class="breadcrumb-link"
          >
            <q-icon v-if="item.icon" :name="item.icon" size="xs" class="breadcrumb-icon" />
            <span class="breadcrumb-text">{{ item.label }}</span>
          </router-link>
          
          <span v-else class="breadcrumb-current">
            <q-icon v-if="item.icon" :name="item.icon" size="xs" class="breadcrumb-icon" />
            <span class="breadcrumb-text">{{ item.label }}</span>
          </span>
        </div>
      </template>
      
      <!-- Actions -->
      <div class="breadcrumb-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- Mobile Dropdown -->
    <div class="breadcrumb-mobile" v-if="showMobileDropdown">
      <q-btn
        flat
        dense
        :label="currentPageLabel"
        icon="expand_more"
        class="mobile-breadcrumb-btn"
        @click="toggleMobileDropdown"
      />
      
      <q-menu 
        v-model="mobileDropdownOpen"
        class="breadcrumb-mobile-menu"
      >
        <q-list>
          <q-item clickable @click="$router.push('/')">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>
          
          <q-item 
            v-for="(item, index) in breadcrumbItems" 
            :key="index"
            :clickable="!!item.to"
            @click="item.to && $router.push(item.to)"
          >
            <q-item-section avatar v-if="item.icon">
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <q-item-section side v-if="index === breadcrumbItems.length - 1">
              <q-icon name="check" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

interface Props {
  items?: BreadcrumbItem[]
  animated?: boolean
  showMobileDropdown?: boolean
  autoGenerate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  showMobileDropdown: true,
  autoGenerate: true
})

const route = useRoute()
const mobileDropdownOpen = ref(false)

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (props.items) {
    return props.items
  }
  
  if (props.autoGenerate) {
    return generateBreadcrumbsFromRoute()
  }
  
  return []
})

const currentPageLabel = computed(() => {
  const items = breadcrumbItems.value
  return items.length > 0 ? items[items.length - 1].label : 'Página Atual'
})

function generateBreadcrumbsFromRoute(): BreadcrumbItem[] {
  const pathSegments = route.path.split('/').filter(segment => segment)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // Map common routes to readable labels
  const routeLabels: Record<string, { label: string; icon?: string }> = {
    'projects': { label: 'Campanhas', icon: 'campaign' },
    'new': { label: 'Nova Campanha', icon: 'add_circle' },
    'me': { label: 'Minhas Campanhas', icon: 'campaign' },
    'dashboard': { label: 'Dashboard', icon: 'dashboard' },
    'sign-in': { label: 'Entrar', icon: 'login' },
    'sign-up': { label: 'Cadastrar', icon: 'person_add' }
  }
  
  let currentPath = ''
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    const routeInfo = routeLabels[segment]
    const isLast = index === pathSegments.length - 1
    
    if (routeInfo) {
      breadcrumbs.push({
        label: routeInfo.label,
        icon: routeInfo.icon,
        to: isLast ? undefined : currentPath
      })
    } else {
      // Try to format segment as title case
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        label,
        to: isLast ? undefined : currentPath
      })
    }
  })
  
  return breadcrumbs
}

function toggleMobileDropdown() {
  mobileDropdownOpen.value = !mobileDropdownOpen.value
}

// Handle window resize for mobile dropdown
const handleResize = () => {
  if (window.innerWidth > 768) {
    mobileDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dynamic-breadcrumb {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding: 12px 0;
  position: sticky;
  top: 70px;
  z-index: 100;
  
  &--animated {
    .breadcrumb-item {
      opacity: 0;
      transform: translateY(-10px);
      animation: fadeInUp 0.4s ease-out forwards;
      
      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.1}s;
        }
      }
    }
  }
}

.breadcrumb-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  
  &--home {
    .breadcrumb-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(30, 64, 175, 0.1);
      color: #1e40af;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(30, 64, 175, 0.2);
        transform: scale(1.1);
      }
    }
  }
  
  &--clickable {
    .breadcrumb-link:hover {
      .breadcrumb-text {
        color: #1e40af;
      }
    }
  }
  
  &--active {
    .breadcrumb-current {
      .breadcrumb-text {
        color: #0f172a;
        font-weight: 600;
      }
    }
  }
}

.breadcrumb-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(30, 64, 175, 0.05);
  }
}

.breadcrumb-current {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
}

.breadcrumb-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-icon {
  color: #94a3b8;
  transition: color 0.2s ease;
}

.breadcrumb-separator {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  margin: 0 4px;
}

.breadcrumb-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

// === MOBILE DROPDOWN ===
.breadcrumb-mobile {
  display: none;
  padding: 0 16px;
  
  @media (max-width: 768px) {
    display: block;
  }
}

.mobile-breadcrumb-btn {
  width: 100%;
  justify-content: space-between;
  font-weight: 500;
  color: #374151;
  
  .q-icon {
    transition: transform 0.2s ease;
  }
  
  &[aria-expanded="true"] {
    .q-icon {
      transform: rotate(180deg);
    }
  }
}

.breadcrumb-mobile-menu {
  width: 100%;
  max-width: 300px;
}

// === ANIMATIONS ===
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 1024px) {
  .breadcrumb-container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .dynamic-breadcrumb {
    top: 60px;
    padding: 8px 0;
  }
}

// Dark mode removed - manual theme control only

// === ACCESSIBILITY ===
@media (prefers-reduced-motion: reduce) {
  .dynamic-breadcrumb--animated .breadcrumb-item {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
  
  .breadcrumb-link,
  .mobile-breadcrumb-btn .q-icon {
    transition: none !important;
  }
}

// === HIGH CONTRAST MODE ===
@media (prefers-contrast: high) {
  .dynamic-breadcrumb {
    border-bottom: 2px solid #000;
  }
  
  .breadcrumb-link {
    border: 1px solid transparent;
    
    &:hover,
    &:focus {
      border-color: #000;
    }
  }
}
</style>
