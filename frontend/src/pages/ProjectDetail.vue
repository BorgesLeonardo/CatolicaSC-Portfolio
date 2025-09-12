<!-- src/pages/ProjectDetail.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { http, setAuthToken } from 'src/utils/http'
import { formatMoneyBRL, formatDateTimeBR, isPast, formatProgressPercentage, calculateDaysLeft } from 'src/utils/format'
import ContributeDialog from 'src/components/ContributeDialog.vue'
import CommentsSection from 'src/components/CommentsSection.vue'
import EditProjectDialog from 'src/components/EditProjectDialog.vue'
import type { Project } from 'src/components/models'
import { useProjectStats } from 'src/composables/useProjectStats'
import { contributionsService } from 'src/services/contributions'
import { Notify, Dialog } from 'quasar'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id)

const { user, getToken } = useAuth()
const project = ref<Project | null>(null)
const loading = ref(false)
const deleteLoading = ref(false)
const dialogRef = ref<InstanceType<typeof ContributeDialog> | null>(null)
const editDialogRef = ref<InstanceType<typeof EditProjectDialog> | null>(null)
const { updateStatsIfNeeded } = useProjectStats()

// Edit dialog state
const editDialogOpen = ref(false)
const projectToEdit = ref<Project | null>(null)

// Track if project has contributions
const hasContributions = ref(false)

// Computed properties para estatísticas reais
const raisedAmount = computed(() => {
  return project.value?.raisedCents ?? 0
})

const progressPercentage = computed(() => {
  if (!project.value) return 0
  return formatProgressPercentage(raisedAmount.value, project.value.goalCents)
})

const daysLeft = computed(() => {
  if (!project.value) return 0
  return calculateDaysLeft(project.value.deadline)
})

const backersCount = computed(() => {
  return project.value?.supportersCount ?? 0
})

const isExpired = computed(() => {
  return project.value ? isPast(project.value.deadline) : false
})

const isOwner = computed(() => {
  // Aguarda tanto o usuário quanto o projeto carregarem
  if (!user?.value?.id || !project.value?.ownerId) {
    return false
  }
  
  return user.value.id === project.value.ownerId
})

const canEdit = computed(() => {
  return isOwner.value && !isExpired.value
})

const canDelete = computed(() => {
  return isOwner.value && !hasContributions.value
})

async function fetchProject() {
  loading.value = true
  try {
    // Atualiza estatísticas se necessário (silenciosamente)
    await updateStatsIfNeeded()
    
    const { data } = await http.get<Project>(`/api/projects/${id}`)
    console.log('📡 API Response:', data)
    project.value = data
    
    // Check if project has contributions (for delete permission)
    if (project.value) {
      try {
        hasContributions.value = await contributionsService.hasContributions(project.value.id)
      } catch (error) {
        console.warn('Error checking contributions:', error)
        hasContributions.value = true // Default to safe side
      }
    }
  } catch {
    project.value = null
  } finally {
    loading.value = false
  }
}

function openContrib() {
  dialogRef.value?.show()
}

function editProject() {
  if (!project.value || !canEdit.value) return
  projectToEdit.value = project.value
  editDialogOpen.value = true
}

function handleProjectUpdated(updatedProject: Project) {
  project.value = updatedProject
  Notify.create({
    type: 'positive',
    message: 'Campanha atualizada com sucesso!',
    icon: 'check_circle'
  })
}

function deleteProject() {
  if (!project.value || !canDelete.value) return

  if (hasContributions.value) {
    Notify.create({
      type: 'warning',
      message: 'Não é possível excluir campanhas que já receberam contribuições',
      timeout: 4000,
      icon: 'warning'
    })
    return
  }

  // Show confirmation dialog
  Dialog.create({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir a campanha "${project.value.title}"? Esta ação não pode ser desfeita.`,
    html: true,
    ok: {
      label: 'Excluir',
      color: 'negative',
      icon: 'delete'
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-7'
    },
    persistent: true
  }).onOk(() => {
    void performDelete()
  })
}

async function performDelete() {
  if (!project.value) return
  
  deleteLoading.value = true
  try {
    const token = await getToken.value()
    setAuthToken(token)
    
    await http.delete(`/api/projects/${project.value.id}`)
    
    Notify.create({
      type: 'positive',
      message: 'Campanha excluída com sucesso',
      icon: 'check_circle'
    })
    
    // Redirect to projects page
    void router.push('/projects')
  } catch (error) {
    console.error('Error deleting project:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao excluir campanha. Tente novamente.',
      timeout: 4000
    })
  } finally {
    deleteLoading.value = false
  }
}

function goBack() {
  router.back()
}

async function shareProject() {
  if (navigator.share && project.value) {
    try {
      await navigator.share({
        title: project.value.title,
        text: project.value.description,
        url: window.location.href,
      })
    } catch {
      console.log('Compartilhamento cancelado pelo usuário')
    }
  } else {
    // Fallback para copiar URL
    try {
      await navigator.clipboard.writeText(window.location.href)
      // Você pode adicionar uma notificação de sucesso aqui
      console.log('URL copiada para a área de transferência')
    } catch (error) {
      console.error('Erro ao copiar URL:', error)
    }
  }
}

// Força reatividade quando o usuário carregar
watch(() => user?.value?.id, (userId) => {
  if (userId && project.value) {
    // Força recálculo dos computeds
    console.log('✅ Usuário carregado, recalculando permissões')
  }
})

onMounted(() => {
  void fetchProject()
})
</script>

<template>
  <div class="project-detail">
    <q-inner-loading :showing="loading">
      <q-spinner-hourglass size="50px" color="primary" />
    </q-inner-loading>

    <!-- Header com navegação -->
    <div class="project-header q-pa-md">
      <div class="row items-center justify-between">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="goBack"
          class="text-grey-7"
        />
        <div class="row q-gutter-sm">
          <q-btn
            flat
            round
            icon="share"
            @click="shareProject"
            class="text-grey-7"
          />
          <q-btn
            flat
            round
            icon="favorite_border"
            class="text-grey-7"
          />
        </div>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-if="!project && !loading" class="empty-state">
      <div class="text-center q-pa-xl">
        <q-icon name="search_off" size="4rem" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">Campanha não encontrada</div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          A campanha que você está procurando pode ter sido removida ou não existe.
        </div>
        <q-btn
          flat
          label="Voltar às campanhas"
          icon="arrow_back"
          @click="$router.push('/')"
          class="q-mt-md"
        />
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div v-else-if="project" class="project-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-image">
          <q-img 
            v-if="project.imageUrl" 
            :src="project.imageUrl" 
            ratio="16/9"
            fit="cover"
            loading="lazy"
            class="hero-img"
          >
            <template v-slot:error>
              <div class="hero-placeholder">
                <q-icon name="broken_image" size="4rem" color="grey-4" />
                <div class="text-body2 text-grey-5 q-mt-md">Erro ao carregar imagem</div>
              </div>
            </template>
            <template v-slot:loading>
              <div class="hero-placeholder">
                <q-spinner size="3rem" color="grey-4" />
                <div class="text-body2 text-grey-5 q-mt-md">Carregando...</div>
              </div>
            </template>
          </q-img>
          <div v-else class="hero-placeholder">
            <q-icon name="campaign" size="4rem" color="grey-4" />
            <div class="text-body2 text-grey-5 q-mt-md">Imagem da campanha</div>
          </div>

          <!-- Status overlay -->
          <div class="hero-overlay">
            <q-badge
              :color="isExpired ? 'grey-8' : 'positive'"
              :label="isExpired ? 'Campanha Encerrada' : 'Campanha Ativa'"
              class="status-badge"
            />
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div v-if="project" class="content-grid q-pa-md">
        <div class="row q-col-gutter-lg">
          <!-- Left Column - Main Info -->
          <div class="col-12 col-lg-8">
            <!-- Title and Category -->
            <div class="project-header-info">
              <div class="row items-start justify-between q-mb-md">
                <div class="col">
                  <div class="row items-center q-mb-sm">
                    <q-badge
                      v-if="project.category"
                      :color="project.category.color || 'primary'"
                      :label="project.category.name"
                      class="q-mr-sm"
                    >
                      <q-icon
                        v-if="project.category.icon"
                        :name="project.category.icon"
                        size="xs"
                        class="q-mr-xs"
                      />
                    </q-badge>
                    <div class="text-caption text-grey-6">
                      Por <strong>Criador</strong> • {{ formatDateTimeBR(project.createdAt) }}
                    </div>
                  </div>
                  <h1 class="project-title">{{ project.title }}</h1>
                </div>
              </div>
            </div>

            <!-- Progress Section -->
            <q-card flat bordered class="progress-card q-mb-lg">
              <q-card-section>
                <!-- Progress Bar -->
                <div class="progress-section q-mb-md">
                  <q-linear-progress
                    :value="progressPercentage / 100"
                    size="12px"
                    :color="isExpired ? 'grey-5' : 'positive'"
                    track-color="grey-3"
                    class="progress-bar"
                  />
                </div>

                <!-- Stats Row -->
                <div class="row q-col-gutter-md">
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-value">{{ formatMoneyBRL(raisedAmount) }}</div>
                      <div class="stat-label">Arrecadado</div>
                      <div class="stat-sublabel">{{ progressPercentage.toFixed(0) }}% da meta</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-value">{{ backersCount }}</div>
                      <div class="stat-label">Apoiadores</div>
                      <div class="stat-sublabel">Pessoas que contribuíram</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <div class="stat-value">{{ daysLeft }}</div>
                      <div class="stat-label">{{ daysLeft === 1 ? 'Dia restante' : 'Dias restantes' }}</div>
                      <div class="stat-sublabel">{{ formatDateTimeBR(project.deadline) }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Description -->
            <q-card flat bordered class="description-card q-mb-lg">
              <q-card-section>
                <h2 class="section-title">Sobre esta campanha</h2>
                <div class="project-description">
                  {{ project.description }}
                </div>
              </q-card-section>
            </q-card>

            <!-- Comments Section -->
            <q-card flat bordered class="comments-card">
              <q-card-section>
                <h2 class="section-title">Comentários</h2>
                <CommentsSection
                  :project-id="project.id"
                  :project-owner-id="project.ownerId"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Right Column - Sidebar -->
          <div class="col-12 col-lg-4">
            <!-- Contribute Card -->
            <q-card class="contribute-card q-mb-lg" :class="{ 'expired-card': isExpired }">
              <q-card-section>
                <div class="contribute-content">
                  <div class="goal-info q-mb-md">
                    <div class="goal-amount">{{ formatMoneyBRL(project.goalCents) }}</div>
                    <div class="goal-label">Meta da campanha</div>
                  </div>

                  <!-- Botão de contribuir (para não-donos) -->
                  <q-btn
                    v-if="!isOwner"
                    :color="isExpired ? 'grey-5' : 'primary'"
                    :label="isExpired ? 'Campanha Encerrada' : 'Contribuir Agora'"
                    :icon="isExpired ? 'block' : 'favorite'"
                    :disable="isExpired"
                    @click="openContrib"
                    size="lg"
                    class="full-width contribute-btn q-mb-md"
                    :class="{ 'pulse-animation': !isExpired }"
                  />


                  <!-- Botões de ação para o dono -->
                  <div v-if="isOwner" class="owner-actions q-mb-md">
                    <q-btn
                      v-if="canEdit"
                      color="primary"
                      label="Editar Campanha"
                      icon="edit"
                      @click="editProject"
                      size="lg"
                      class="full-width q-mb-sm owner-btn"
                    />
                    
                    <q-btn
                      v-if="canDelete"
                      color="negative"
                      label="Excluir Campanha"
                      icon="delete"
                      :loading="deleteLoading"
                      @click="deleteProject"
                      size="lg"
                      class="full-width q-mb-sm owner-btn"
                      outline
                    />
                    
                    <div v-if="isOwner && !canDelete && hasContributions" class="contribution-warning q-mb-sm">
                      <q-icon name="info" class="q-mr-sm" />
                      <span class="text-body2 text-grey-6">
                        Não é possível excluir campanhas com contribuições
                      </span>
                    </div>
                    
                    <div v-if="isOwner && !canEdit && isExpired" class="expired-warning q-mb-sm">
                      <q-icon name="schedule" class="q-mr-sm" />
                      <span class="text-body2 text-grey-6">
                        Campanha encerrada - não é possível editar
                      </span>
                    </div>
                  </div>

                  <div v-if="!isOwner" class="contribute-info">
                    <div class="info-item">
                      <q-icon name="security" class="q-mr-sm" />
                      <span>Pagamento 100% seguro</span>
                    </div>
                    <div class="info-item">
                      <q-icon name="verified" class="q-mr-sm" />
                      <span>Campanha verificada</span>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Project Info Card -->
            <q-card flat bordered class="info-card">
              <q-card-section>
                <h3 class="card-title">Informações da Campanha</h3>
                <div class="info-list">
                  <div class="info-row">
                    <q-icon name="calendar_today" class="info-icon" />
                    <div class="info-content">
                      <div class="info-label">Data de criação</div>
                      <div class="info-value">{{ formatDateTimeBR(project.createdAt) }}</div>
                    </div>
                  </div>
                  <div class="info-row">
                    <q-icon name="schedule" class="info-icon" />
                    <div class="info-content">
                      <div class="info-label">Prazo limite</div>
                      <div class="info-value">{{ formatDateTimeBR(project.deadline) }}</div>
                    </div>
                  </div>
                  <div class="info-row">
                    <q-icon name="flag" class="info-icon" />
                    <div class="info-content">
                      <div class="info-label">Meta</div>
                      <div class="info-value">{{ formatMoneyBRL(project.goalCents) }}</div>
                    </div>
                  </div>
                  <div class="info-row">
                    <q-icon name="category" class="info-icon" />
                    <div class="info-content">
                      <div class="info-label">Categoria</div>
                      <div class="info-value">{{ project.category?.name || 'Não categorizada' }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <ContributeDialog ref="dialogRef" :project-id="id" />
    <EditProjectDialog 
      ref="editDialogRef" 
      v-model="editDialogOpen"
      :project="projectToEdit"
      @project-updated="handleProjectUpdated" 
    />
  </div>
</template>

<style scoped lang="scss">
.project-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.project-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.empty-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-section {
  position: relative;
  margin-bottom: 2rem;
}

.hero-image {
  position: relative;
  max-height: 60vh;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.hero-img {
  width: 100%;
  border-radius: 16px;
}

.hero-placeholder {
  height: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
}

.hero-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.status-badge {
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.content-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.project-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: #1e293b;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1e293b;
}

// Progress Card Styles
.progress-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.progress-bar {
  border-radius: 6px;
  overflow: hidden;
}

.stat-item {
  text-align: center;
  
  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #059669;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.125rem;
  }
  
  .stat-sublabel {
    font-size: 0.75rem;
    color: #6b7280;
  }
}

// Description Card Styles
.description-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.project-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
}

// Comments Card Styles
.comments-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

// Contribute Card Styles
.contribute-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: sticky;
  top: 120px;
  
  &.expired-card {
    opacity: 0.7;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }
}

.goal-info {
  text-align: center;
  
  .goal-amount {
    font-size: 2rem;
    font-weight: 700;
    color: #059669;
    margin-bottom: 0.25rem;
  }
  
  .goal-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
}

.contribute-btn {
  font-weight: 600;
  border-radius: 12px;
  padding: 16px;
  
  &.pulse-animation {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.contribute-info {
  .info-item {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Info Card Styles
.info-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-list {
  .info-row {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    &:first-child {
      padding-top: 0;
    }
  }
  
  .info-icon {
    color: #6b7280;
    margin-right: 0.75rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }
  
  .info-content {
    flex: 1;
  }
  
  .info-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
  
  .info-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
}

.owner-actions {
  .owner-btn {
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: none;
    letter-spacing: 0.5px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &.q-btn--outline {
      border-width: 2px;
      
      &:hover {
        background-color: rgba(244, 67, 54, 0.1);
      }
    }
    
    // Estilo específico para botão de editar
    &.q-btn--standard:not(.q-btn--outline) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      &:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }
    }
    
    // Animação de entrada
    animation: slideInUp 0.5s ease-out;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.contribution-warning,
.expired-warning {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(156, 163, 175, 0.1);
  border-radius: 8px;
  border-left: 3px solid #9ca3af;
  
  .q-icon {
    color: #6b7280;
  }
}

// Responsive Design
@media (max-width: 1024px) {
  .contribute-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .content-grid {
    padding: 1rem;
  }
  
  .hero-image {
    margin: 0 -1rem;
    border-radius: 0;
  }
  
  .hero-img {
    border-radius: 0;
  }
  
  .stat-item .stat-value {
    font-size: 1.5rem;
  }
}

// Smooth transitions
* {
  transition: all 0.2s ease;
}

// Card hover effects
.q-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  }
}
</style>
