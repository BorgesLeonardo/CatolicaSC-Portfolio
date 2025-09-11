<template>
  <q-card 
    class="campaign-card fade-in-up cursor-pointer"
    :class="{ 'campaign-card--featured': featured }"
    @click="$emit('click', project.id)"
    flat
    bordered
  >
    <div class="campaign-image relative-position">
      <q-img 
        v-if="project.imageUrl" 
        :src="project.imageUrl" 
        ratio="16/9"
        class="cursor-pointer"
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
          <div class="campaign-placeholder">
            <q-spinner size="xl" color="grey-5" />
            <div class="text-caption text-grey-5 q-mt-sm">Carregando...</div>
          </div>
        </template>
      </q-img>
      <div v-else class="campaign-placeholder">
        <q-icon name="campaign" size="xl" color="grey-5" />
        <div class="text-caption text-grey-5 q-mt-sm">Sem imagem</div>
      </div>

      <!-- Status Badge -->
      <div class="absolute-top-right q-ma-sm">
        <q-badge 
          :color="isPast(project.deadline) ? 'grey-7' : 'positive'" 
          :label="isPast(project.deadline) ? 'Encerrada' : 'Ativa'"
          class="q-px-sm"
        />
      </div>

      <!-- Category Badge -->
      <div v-if="project.category" class="absolute-bottom-left q-ma-sm">
        <q-badge 
          :color="project.category.color || 'primary'" 
          :label="project.category.name"
          class="q-px-sm"
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
      <div v-if="featured" class="absolute-top-left q-ma-sm">
        <q-badge 
          color="accent" 
          label="Destaque"
          class="q-px-sm"
        />
      </div>
    </div>
    
    <q-card-section class="campaign-content">
      <h3 class="campaign-title">{{ project.title }}</h3>
      <p v-if="project.description" class="campaign-description">
        {{ project.description }}
      </p>
      
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        
        <div class="stats-row q-mt-sm">
          <div class="stat-item">
            <div class="stat-value">{{ progressPercentage }}%</div>
            <div class="stat-label">Concluído</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatMoneyBRL(project.goalCents) }}</div>
            <div class="stat-label">Meta</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ daysLeft }}</div>
            <div class="stat-label">Dias restantes</div>
          </div>
        </div>
      </div>

      <div class="campaign-footer" v-if="showFooter">
        <div class="text-caption text-grey-6">
          Criado em {{ formatDateBR(project.createdAt) }}
        </div>
        <q-btn
          flat
          dense
          round
          icon="favorite_border"
          size="sm"
          color="grey-6"
          class="q-ml-auto"
          @click.stop="toggleFavorite"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMoneyBRL, isPast } from 'src/utils/format'
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


const progressPercentage = computed(() => {
  // Por enquanto retorna um valor mockado
  // Em produção, calcularia baseado nas contribuições
  return Math.floor(Math.random() * 100)
})

const daysLeft = computed(() => {
  const now = new Date()
  const deadlineDate = new Date(props.project.deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

function formatDateBR(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function toggleFavorite() {
  emit('favorite', props.project)
}
</script>

<style scoped lang="scss">
.campaign-card {
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  &--featured {
    .campaign-content {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    }
  }
}

.campaign-image {
  position: relative;
  overflow: hidden;
  min-height: 200px;
  background: #f8f9fa;
  
  .q-img {
    width: 100%;
    height: 200px;
  }
}

.campaign-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
  }
}

.campaign-content {
  padding: 16px;
}

.campaign-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
  line-height: 1.4;
}

.campaign-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.campaign-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
