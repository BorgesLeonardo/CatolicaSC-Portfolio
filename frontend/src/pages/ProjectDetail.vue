<!-- src/pages/ProjectDetail.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { http, setAuthToken } from 'src/utils/http'
import { formatMoneyBRL, formatDateTimeBR, isPast, formatProgressPercentage, calculateDaysLeft } from 'src/utils/format'
import { getImageUrl as buildImageUrl } from 'src/config/api'
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

// Removed image gallery state - using single image now

// Interface para imagens
interface ProjectImage {
  id: string
  url: string
  originalName: string
}

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

// Image management
const hasImages = computed(() => {
  if (!project.value) return false
  return (project.value.images && project.value.images.length > 0) || !!project.value.imageUrl
})

// Video management
const hasVideo = computed(() => {
  return !!project.value?.videoUrl
})

const showVideo = ref(false)
const videoEl = ref<HTMLVideoElement | null>(null)

const videoSrc = computed(() => {
  if (!project.value?.videoUrl) return ''
  return buildImageUrl(project.value.videoUrl)
})

const displayImages = computed(() => {
  if (!project.value) return []
  
  // Priorizar novas imagens (array images) sobre imageUrl legacy
  if (project.value.images && project.value.images.length > 0) {
    return project.value.images
  }
  
  // Fallback para imageUrl legacy
  if (project.value.imageUrl) {
    return [{
      id: 'legacy',
      url: project.value.imageUrl,
      originalName: 'Imagem da campanha'
    }]
  }
  
  return []
})

function getImageUrl(image: ProjectImage | string): string {
  // Se for uma string (imageUrl legacy)
  if (typeof image === 'string') {
    return buildImageUrl(image)
  }
  
  // Se for uma imagem nova do sistema de upload
  if (image && image.url) {
    return buildImageUrl(image.url)
  }
  
  return ''
}

const firstImageUrl = computed(() => {
  const images = displayImages.value
  if (images.length > 0) {
    return getImageUrl(images[0])
  }
  return ''
})

// Image loading callbacks for debug
function onImageLoad() {
  // noop: removed debug log
}

function onImageError() {
  // noop: removed debug log
}

function openImageLightbox() {
  if (firstImageUrl.value) {
    // Abrir imagem em nova aba para visualização completa
    window.open(firstImageUrl.value, '_blank')
  }
}

// Simplified gallery - removed complex interactions

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

// Subscription helpers
const isSubscription = computed(() => {
  return !!project.value?.subscriptionEnabled
})

const subscriptionIntervalLabel = computed(() => {
  const interval = project.value?.subscriptionInterval
  if (interval === 'MONTH') return 'Mensal'
  if (interval === 'YEAR') return 'Anual'
  return '—'
})

async function fetchProject() {
  loading.value = true
  try {
    // Atualiza estatísticas se necessário (silenciosamente)
    await updateStatsIfNeeded()
    
    const { data } = await http.get<Project>(`/api/projects/${id}`)
    // noop: removed debug log
    project.value = data
    
    // Check if project has contributions (for delete permission)
    if (project.value) {
      try {
        hasContributions.value = await contributionsService.hasContributions(project.value.id)
      } catch {
        // noop: removed debug log
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

async function subscribeNow() {
  if (!project.value) return
  try {
    const token = await getToken.value?.()
    if (!token) {
      Notify.create({ type: 'warning', message: 'Entre para assinar.' })
      return
    }
    setAuthToken(token)
    const { data } = await http.post('/api/subscriptions/checkout', {
      projectId: project.value.id
    })
    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl
    } else {
      Notify.create({ type: 'negative', message: 'Falha ao iniciar assinatura.' })
    }
  } catch {
    // noop: removed debug log
    Notify.create({ type: 'negative', message: 'Erro ao iniciar assinatura.' })
  }
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
  } catch {
    // noop: removed debug log
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
      // noop: removed debug log
    }
  } else {
    // Fallback para copiar URL
    try {
      await navigator.clipboard.writeText(window.location.href)
      // Você pode adicionar uma notificação de sucesso aqui
      // noop: removed debug log
    } catch {
      // noop: removed debug log
    }
  }
}

// Força reatividade quando o usuário carregar
watch(() => user?.value?.id, (userId) => {
  if (userId && project.value) {
    // Força recálculo dos computeds
    // noop: removed debug log
  }
})

onMounted(() => {
  void fetchProject()
  // por padrão, manter capa (não iniciar vídeo automaticamente)
  showVideo.value = false
})

function backToCover() {
  const el = videoEl.value
  if (el) {
    try {
      el.pause()
      el.currentTime = 0
    } catch {
      // noop: removed debug log
    }
  }
  showVideo.value = false
}
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
            class="text-grey-7 icon-muted-text"
          />
        <div class="row q-gutter-sm">
          <q-btn
            flat
            round
            icon="share"
            @click="shareProject"
            class="text-grey-7 icon-muted-text"
          />
          <q-btn
            flat
            round
            icon="favorite_border"
            class="text-grey-7 icon-muted-text"
          />
        </div>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-if="!project && !loading" class="empty-state">
      <div class="text-center q-pa-xl">
        <q-icon name="search_off" size="4rem" class="icon-muted" />
        <div class="text-h6 text-muted q-mt-md">Campanha não encontrada</div>
        <div class="text-body2 text-hint q-mt-sm">
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
                    <q-badge v-if="isSubscription" color="indigo-6" class="q-mr-sm">
                      <q-icon name="autorenew" size="xs" class="q-mr-xs" /> Assinatura
                    </q-badge>
                    <div class="text-caption text-muted">
                      Por <strong>Criador</strong> • {{ formatDateTimeBR(project.createdAt) }}
                    </div>
                  </div>
                  <h1 class="project-title">{{ project.title }}</h1>
                </div>
              </div>
            </div>

            <!-- Media: Video or Image -->
            <div v-if="hasVideo || hasImages" class="modern-image-gallery q-mb-lg">
              

              <!-- Video Player -->
              <div v-if="hasVideo && showVideo" class="gallery-container">
                <div class="image-frame">
                  <video
                    ref="videoEl"
                    :src="videoSrc"
                    controls
                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 24px;"
                  />
                  <q-btn
                    round
                    dense
                    icon="image"
                    color="white"
                    text-color="primary"
                    class="absolute-top-right q-ma-sm"
                    @click.stop="backToCover"
                    aria-label="Voltar para capa"
                  />
                </div>
              </div>

              <!-- Image -->
              <div v-else-if="hasImages" class="gallery-container" @click="hasVideo ? (showVideo = true) : openImageLightbox()">
                <div class="image-frame">
                  <template v-if="hasVideo">
                    <div class="video-cover">
                      <template v-if="firstImageUrl">
                        <img 
                          :src="firstImageUrl" 
                          alt="Capa do vídeo"
                          class="gallery-hero-image"
                          @load="onImageLoad"
                          @error="onImageError"
                        />
                      </template>
                      <template v-else>
                        <div class="modern-placeholder">
                          <q-icon name="image" size="4rem" class="icon-muted" />
                          <div class="text-h6 text-hint q-mt-md">Imagem da Campanha</div>
                        </div>
                      </template>
                      <div class="play-overlay">
                        <q-icon name="play_circle" color="white" size="64px" />
                        <div class="overlay-text">Assistir vídeo</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <template v-if="firstImageUrl">
                      <img 
                        :src="firstImageUrl" 
                        alt="Imagem da campanha"
                        class="gallery-hero-image"
                        @load="onImageLoad"
                        @error="onImageError"
                      />
                    </template>
                    <template v-else>
                      <div class="modern-placeholder">
                        <q-icon name="image" size="4rem" class="icon-muted" />
                        <div class="text-h6 text-hint q-mt-md">Imagem da Campanha</div>
                      </div>
                    </template>
                  </template>
                  
                  <!-- Elegant hover overlay (only for image-only mode) -->
                  <div v-if="!hasVideo" class="modern-overlay">
                    <div class="overlay-content">
                      <q-icon name="zoom_in" size="xl" color="white" />
                      <div class="overlay-text">Ver em tamanho real</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress / Plan Section -->
            <q-card flat bordered class="progress-card q-mb-lg">
              <q-card-section>
                <template v-if="!isSubscription">
                  <!-- Progress Bar (one-time) -->
                  <div class="progress-section q-mb-md">
                    <q-linear-progress
                      :value="progressPercentage / 100"
                      size="12px"
                      :color="isExpired ? 'grey-5' : 'positive'"
                      track-color="grey-3"
                      class="progress-bar"
                    />
                  </div>

                  <!-- Stats Row (one-time) -->
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
                </template>

                <template v-else>
                  <!-- Subscription plan stats -->
                  <div class="row q-col-gutter-md">
                    <div class="col-4">
                      <div class="stat-item">
                        <div class="stat-value">{{ backersCount }}</div>
                        <div class="stat-label">Assinantes</div>
                        <div class="stat-sublabel">Planos ativos</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="stat-item">
                        <div class="stat-value">{{ formatMoneyBRL(project.subscriptionPriceCents) }}</div>
                        <div class="stat-label">Preço</div>
                        <div class="stat-sublabel">{{ subscriptionIntervalLabel }}</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="stat-item">
                        <div class="stat-value">{{ formatMoneyBRL(raisedAmount) }}</div>
                        <div class="stat-label">Receita total</div>
                        <div class="stat-sublabel">Acumulado</div>
                      </div>
                    </div>
                  </div>
                </template>
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
                    <template v-if="!isSubscription">
                      <div class="goal-amount">{{ formatMoneyBRL(project.goalCents) }}</div>
                      <div class="goal-label">Meta da campanha</div>
                    </template>
                    <template v-else>
                      <div class="goal-amount">{{ formatMoneyBRL(project.subscriptionPriceCents) }}</div>
                      <div class="goal-label">Plano {{ subscriptionIntervalLabel.toLowerCase() }}</div>
                    </template>
                  </div>

                  <!-- Botão de contribuir (para não-donos) -->
                  <q-btn
                    v-if="!isOwner && !isSubscription"
                    :color="isExpired ? 'grey-5' : 'info'"
                    :label="isExpired ? 'Campanha Encerrada' : 'Contribuir Agora'"
                    :icon="isExpired ? 'block' : 'favorite'"
                    :disable="isExpired"
                    @click="openContrib"
                    size="lg"
                    class="full-width contribute-btn q-mb-md"
                    :class="{ 'pulse-animation': !isExpired }"
                  />

                  <q-btn
                    v-if="!isOwner && isSubscription"
                    color="primary"
                    :label="project.subscriptionPriceCents && project.subscriptionInterval
                      ? `Assinar por ${formatMoneyBRL(project.subscriptionPriceCents)} / ${project.subscriptionInterval === 'MONTH' ? 'mês' : 'ano'}`
                      : 'Assinar'"
                    icon="autorenew"
                    :disable="isExpired"
                    @click="subscribeNow"
                    size="lg"
                    class="full-width q-mb-sm"
                  />

                  <div v-if="!isOwner && isSubscription && project.subscriptionPriceCents && project.subscriptionInterval" class="text-caption text-hint q-mt-xs q-mb-sm">
                    Assinatura recorrente: será cobrado automaticamente a cada {{ project.subscriptionInterval === 'MONTH' ? 'mês' : 'ano' }}.
                  </div>


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
                      <span class="text-body2 text-muted">
                        Não é possível excluir campanhas com contribuições
                      </span>
                    </div>
                    
                    <div v-if="isOwner && !canEdit && isExpired" class="expired-warning q-mb-sm">
                      <q-icon name="schedule" class="q-mr-sm" />
                      <span class="text-body2 text-muted">
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

                  <template v-if="!isSubscription">
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
                  </template>

                  <template v-else>
                    <div class="info-row">
                      <q-icon name="autorenew" class="info-icon" />
                      <div class="info-content">
                        <div class="info-label">Tipo</div>
                        <div class="info-value">Assinatura {{ subscriptionIntervalLabel.toLowerCase() }}</div>
                      </div>
                    </div>
                    <div class="info-row">
                      <q-icon name="payments" class="info-icon" />
                      <div class="info-content">
                        <div class="info-label">Preço do plano</div>
                        <div class="info-value">{{ formatMoneyBRL(project.subscriptionPriceCents) }} / {{ subscriptionIntervalLabel.toLowerCase() }}</div>
                      </div>
                    </div>
                  </template>

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

    <ContributeDialog ref="dialogRef" :project-id="id" :subscription-enabled="project?.subscriptionEnabled" />
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
  background: var(--color-surface);
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

.hero-section-simple {
  position: relative;
  margin-bottom: 1rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.hero-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.status-overlay {
  display: flex;
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

.hero-gallery {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-carousel {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  
  :deep(.q-carousel__slides-container) {
    border-radius: 16px;
  }
  
  :deep(.q-carousel__slide) {
    padding: 0;
  }
  
  :deep(.q-carousel__arrow) {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }
  }
  
  :deep(.q-carousel__arrow--left) {
    left: 20px;
  }
  
  :deep(.q-carousel__arrow--right) {
    right: 20px;
  }
}

.hero-slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-img {
  width: 100%;
  border-radius: 16px;
}

.hero-image-counter {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.hero-counter-badge {
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hero-thumbnails {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: 90%;
}

.thumbnails-container {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  background: rgba(0, 0, 0, 0.5);
  padding: 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.6);
  }
  
  &--active {
    border-color: white;
    transform: scale(1.1);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

// === MODERN IMAGE GALLERY ===
.modern-image-gallery {
  position: relative;
}

.gallery-container {
  position: relative;
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-4px);
    
    .image-frame {
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 12px 24px -8px rgba(30, 64, 175, 0.15);
    }
    
    .gallery-hero-image {
      transform: scale(1.03);
    }
    
    .modern-overlay {
      opacity: 1;
    }
  }
}

.image-frame {
  position: relative;
  height: 450px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.15),
    0 4px 12px -2px rgba(30, 64, 175, 0.08);
  transition: all var(--transition-slow);
  
  // Subtle border for definition
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    z-index: 1;
    pointer-events: none;
  }
}

.gallery-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
  border-radius: 24px;
}

.modern-placeholder {
  height: 450px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  transition: all var(--transition-base);
  
  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  }
}

.modern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.8) 0%,
    rgba(59, 130, 246, 0.6) 50%,
    rgba(249, 115, 22, 0.8) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
  border-radius: 24px;
  backdrop-filter: blur(8px);
}

.video-cover {
  position: relative;
  width: 100%;
  height: 100%;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 58, 138, 0.4));
  transition: background 0.2s ease;
}

.play-overlay .overlay-text {
  margin-top: 8px;
  color: #fff;
  font-weight: 600;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  transform: translateY(20px);
  transition: transform var(--transition-base);
  
  .modern-overlay:hover & {
    transform: translateY(0);
  }
}

.overlay-text {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .modern-image-gallery {
    margin: 0 -16px;
  }
  
  .image-frame {
    height: 350px;
    border-radius: 20px;
    
    &::before {
      border-radius: 20px;
    }
  }
  
  .gallery-hero-image {
    border-radius: 20px;
  }
  
  .modern-placeholder {
    height: 350px;
    border-radius: 20px;
  }
  
  .modern-overlay {
    border-radius: 20px;
  }
}

@media (max-width: 480px) {
  .image-frame {
    height: 280px;
    border-radius: 16px;
    
    &::before {
      border-radius: 16px;
    }
  }
  
  .gallery-hero-image {
    border-radius: 16px;
  }
  
  .modern-placeholder {
    height: 280px;
    border-radius: 16px;
  }
  
  .modern-overlay {
    border-radius: 16px;
  }
  
  .overlay-content {
    gap: 8px;
    
    .q-icon {
      font-size: 2rem !important;
    }
  }
  
  .overlay-text {
    font-size: 0.875rem;
  }
}

// Removed old carousel styles

.gallery-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-muted);
}

.gallery-img {
  border-radius: 0;
}

.gallery-placeholder {
  height: 400px;
  background: var(--gradient-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gallery-navigation {
  background: white;
  border-top: 1px solid var(--color-border);
}

.gallery-counter {
  display: flex;
  justify-content: center;
}

.gallery-counter-badge {
  background: #3b82f6 !important;
  color: white !important;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.gallery-thumbnails {
  overflow: hidden;
}

.thumbnails-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-surface-subtle);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 2px;
    
    &:hover {
      background: #94a3b8;
    }
  }
}

.thumbnail-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  &--active {
    border-color: #3b82f6;
    transform: scale(1.05);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

// === ENHANCED THUMBNAIL NAVIGATION ===
.thumbnail-navigation {
  background: white;
  border-top: 1px solid var(--color-border);
  padding: 20px;
}

.thumbnails-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.thumbnail-nav-btn {
  background: var(--color-surface-subtle);
  color: #64748b;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-border);
    color: #475569;
    transform: scale(1.1);
  }
}

.thumbnails-track {
  flex: 1;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-surface-subtle);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 3px;
    
    &:hover {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    }
  }
}

.enhanced-thumbnail {
  flex-shrink: 0;
  width: 90px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &--active {
    border-color: #3b82f6;
    transform: translateY(-4px) scale(1.05);
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.3),
      0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  &--hover {
    transform: translateY(-2px) scale(1.02);
  }
}

.thumbnail-img-enhanced {
  width: 100%;
  height: 100%;
  border-radius: 9px;
  transition: all 0.3s ease;
}

.thumbnail-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .enhanced-thumbnail--active & {
    opacity: 1;
  }
}

.thumbnail-number {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

// === IMAGE INFO SECTION ===
.image-info {
  background: var(--gradient-subtle);
  border-top: 1px solid var(--color-border);
}

// === AUTOPLAY CONTROLS ===
.autoplay-controls {
  opacity: 0.8;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
}

.autoplay-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.autoplay-progress {
  width: 60px;
  border-radius: 2px;
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .gallery-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .main-image-container {
    min-height: 300px;
  }
  
  .image-wrapper {
    height: 300px;
  }
  
  .image-error-state,
  .image-loading-state {
    height: 300px;
  }
  
  .zoom-btn {
    right: 60px;
    top: 16px;
  }
  
  .fullscreen-btn {
    right: 16px;
    top: 16px;
  }
  
  .enhanced-thumbnail {
    width: 70px;
    height: 70px;
  }
  
  .thumbnail-navigation {
    padding: 16px;
  }
  
  .thumbnails-container {
    gap: 12px;
  }
  
  .nav-btn {
    transform: scale(0.9);
  }
  
  .progress-dots {
    bottom: 16px;
    gap: 8px;
    padding: 6px 12px;
  }
  
  .progress-dot {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 480px) {
  .gallery-header {
    padding: 12px 16px;
  }
  
  .main-image-container {
    min-height: 250px;
  }
  
  .image-wrapper {
    height: 250px;
  }
  
  .image-error-state,
  .image-loading-state {
    height: 250px;
  }
  
  .enhanced-thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .thumbnail-number {
    font-size: 0.625rem;
    padding: 1px 4px;
  }
  
  .gallery-title {
    font-size: 0.875rem;
  }
  
  .counter-chip {
    font-size: 0.75rem;
    padding: 6px 12px;
  }
  
  .image-overlay-controls {
    padding: 12px;
  }
  
  .zoom-btn,
  .fullscreen-btn {
    display: none; // Hide on very small screens
  }
}

// === ACCESSIBILITY ===
@media (prefers-reduced-motion: reduce) {
  .enhanced-thumbnail,
  .main-gallery-img,
  .nav-btn,
  .progress-dot,
  .gallery-card {
    transition: none !important;
    animation: none !important;
  }
  
  .image-wrapper:hover .main-gallery-img {
    transform: none !important;
  }
}

.hero-placeholder {
  height: 400px;
  background: var(--gradient-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 2px dashed var(--color-border);
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
    color: #1e40af;
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
    color: #1e40af;
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
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(30, 64, 175, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0);
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
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #f97316 100%);
      
      &:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #ea580c 100%);
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
