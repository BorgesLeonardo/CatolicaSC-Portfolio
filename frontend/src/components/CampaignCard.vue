<template>
  <q-card 
    class="campaign-card modern-card fade-in-up cursor-pointer"
    :class="{ 'campaign-card--featured': featured }"
    @click="$emit('click', project.id)"
    flat
    bordered
  >
    <!-- Image Section -->
    <div class="campaign-image relative-position">
      <q-img 
        v-if="project.imageUrl" 
        :src="project.imageUrl" 
        ratio="16/9"
        class="cursor-pointer campaign-img"
        fit="cover"
        loading="lazy"
        :img-style="{ objectFit: 'cover' }"
      >
        <template v-slot:error>
          <div class="campaign-placeholder">
            <q-icon name="broken_image" size="xl" color="grey-5" />
            <div class="text-caption text-grey-5 q-mt-sm">Erro ao carregar imagem</div>
          </div>
        </template>
        <template v-slot:loading>
          <div class="campaign-placeholder animate-pulse">
            <q-spinner size="xl" color="grey-5" />
            <div class="text-caption text-grey-5 q-mt-sm">Carregando...</div>
          </div>
        </template>
      </q-img>
      <div v-else class="campaign-placeholder">
        <q-icon name="campaign" size="xl" color="grey-5" />
        <div class="text-caption text-grey-5 q-mt-sm">Sem imagem</div>
      </div>

      <!-- Image Overlay -->
      <div class="image-overlay">
        <!-- Status Badge -->
        <div class="badge-container badge-container--top-right">
          <q-badge 
            :color="isPast(project.deadline) ? 'grey-7' : 'positive'" 
            :label="isPast(project.deadline) ? 'Encerrada' : 'Ativa'"
            class="status-badge"
          />
        </div>

        <!-- Category Badge -->
        <div v-if="project.category" class="badge-container badge-container--top-left">
          <q-badge 
            :color="project.category.color || 'primary'" 
            :label="project.category.name"
            class="category-badge"
          >
            <q-icon 
              v-if="project.category.icon" 
              :name="project.category.icon" 
              size="xs" 
              class="q-mr-xs"
            />
          </q-badge>
        </div>

        <!-- Featured Badge -->
        <div v-if="featured" class="badge-container badge-container--bottom-left">
          <q-badge 
            color="accent" 
            label="⭐ Destaque"
            class="featured-badge"
          />
        </div>

        <!-- Favorite Button -->
        <div class="badge-container badge-container--bottom-right">
          <q-btn
            flat
            dense
            round
            icon="favorite_border"
            size="sm"
            class="favorite-btn glass"
            @click.stop="toggleFavorite"
            :aria-label="`Adicionar ${project.title} aos favoritos`"
          />
        </div>
      </div>
    </div>
    
    <!-- Content Section -->
    <q-card-section class="campaign-content">
      <!-- Title and Description -->
      <div class="content-header">
        <h3 class="campaign-title">{{ project.title }}</h3>
        <p v-if="project.description" class="campaign-description">
          {{ project.description }}
        </p>
      </div>
      
      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-header">
          <div class="progress-stats">
            <span class="progress-percentage">{{ progressPercentage }}%</span>
            <span class="progress-goal">de {{ formatMoneyBRL(project.goalCents) }}</span>
          </div>
          <div class="progress-raised">
            <span class="raised-amount">{{ formatMoneyBRL(raisedAmount) }}</span>
            <span class="raised-label">arrecadado</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ formatNumber(contributorsCount) }}</div>
            <div class="stat-label">Apoiadores</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ daysLeft }}</div>
            <div class="stat-label">{{ daysLeft === 1 ? 'Dia restante' : 'Dias restantes' }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ progressPercentage }}%</div>
            <div class="stat-label">Concluído</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="campaign-footer" v-if="showFooter">
        <div class="footer-info">
          <div class="creator-info">
            <q-icon name="person" size="sm" color="grey-6" />
            <span class="creator-name">{{ project.creatorName || 'Criador' }}</span>
          </div>
          <div class="creation-date">
            <q-icon name="schedule" size="sm" color="grey-6" />
            <span class="date-text">{{ formatDateBR(project.createdAt) }}</span>
          </div>
        </div>
        
        <!-- Action Button -->
        <div class="footer-actions">
          <q-btn
            unelevated
            color="primary"
            label="Ver Detalhes"
            size="sm"
            class="details-btn"
            @click.stop="$emit('click', project.id)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMoneyBRL, isPast, formatNumber, formatProgressPercentage, calculateDaysLeft } from 'src/utils/format'
import type { Project } from 'src/components/models'

interface Props {
  project: Project
  featured?: boolean
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
  showFooter: true
})

const emit = defineEmits<{
  click: [id: string]
  favorite: [project: Project]
}>()

// Real data from API
const raisedAmount = computed(() => {
  return props.project.raisedCents ?? 0
})

const contributorsCount = computed(() => {
  return props.project.supportersCount ?? 0
})

const progressPercentage = computed(() => {
  return formatProgressPercentage(raisedAmount.value, props.project.goalCents)
})

const daysLeft = computed(() => {
  return calculateDaysLeft(props.project.deadline)
})

function formatDateBR(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// formatNumber is now imported from utils/format
function toggleFavorite() {
  emit('favorite', props.project)
}
</script>

<style scoped lang="scss">
.campaign-card {
  overflow: hidden;
  transition: all var(--transition-base);
  will-change: transform;
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1) !important;
    
    .campaign-img {
      transform: scale(1.05);
    }
    
    .favorite-btn {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  &--featured {
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
      z-index: 1;
      pointer-events: none;
    }
    
    .campaign-content {
      position: relative;
      z-index: 2;
    }
  }
}

// === IMAGE SECTION ===
.campaign-image {
  position: relative;
  overflow: hidden;
  height: 240px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.campaign-img {
  width: 100%;
  height: 100%;
  transition: transform var(--transition-slow);
  will-change: transform;
}

.campaign-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all var(--transition-base);
  
  &:hover {
    background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
  }
}

// === IMAGE OVERLAY ===
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none;
}

.badge-container {
  position: absolute;
  pointer-events: auto;
  
  &--top-left {
    top: 12px;
    left: 12px;
  }
  
  &--top-right {
    top: 12px;
    right: 12px;
  }
  
  &--bottom-left {
    bottom: 12px;
    left: 12px;
  }
  
  &--bottom-right {
    bottom: 12px;
    right: 12px;
  }
}

.status-badge {
  font-weight: 600;
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.category-badge {
  font-weight: 600;
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.featured-badge {
  font-weight: 700;
  font-size: 0.75rem;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  backdrop-filter: blur(10px);
  animation: pulse 2s infinite;
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #64748b;
  opacity: 0;
  transition: all var(--transition-base);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #ef4444;
    transform: scale(1.2);
  }
}

// === CONTENT SECTION ===
.campaign-content {
  padding: 24px;
  position: relative;
}

.content-header {
  margin-bottom: 20px;
}

.campaign-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.025em;
}

.campaign-description {
  color: #64748b;
  font-size: 0.925rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// === PROGRESS SECTION ===
.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
}

.progress-stats {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
}

.progress-goal {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.progress-raised {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.raised-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.raised-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-bottom: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  transition: width var(--transition-slow);
  position: relative;
  border-radius: 8px;
  
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

// === STATS GRID ===
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

// === FOOTER ===
.campaign-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.footer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.creator-info,
.creation-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #64748b;
}

.creator-name,
.date-text {
  font-weight: 500;
}

.footer-actions {
  flex-shrink: 0;
}

.details-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.25);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .campaign-content {
    padding: 20px;
  }
  
  .campaign-title {
    font-size: 1.25rem;
  }
  
  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .progress-raised {
    align-items: flex-start;
  }
  
  .stats-grid {
    gap: 12px;
  }
  
  .campaign-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .footer-actions {
    width: 100%;
    
    .details-btn {
      width: 100%;
    }
  }
}

@media (max-width: 640px) {
  .campaign-content {
    padding: 16px;
  }
  
  .campaign-image {
    height: 200px;
  }
  
  .progress-percentage {
    font-size: 1.25rem;
  }
  
  .raised-amount {
    font-size: 1rem;
  }
}

// === ACCESSIBILITY ===
@media (prefers-reduced-motion: reduce) {
  .campaign-card,
  .campaign-img,
  .favorite-btn,
  .progress-fill {
    transition: none !important;
  }
  
  .featured-badge {
    animation: none !important;
  }
}

// Dark mode removed - manual theme control only
</style>
