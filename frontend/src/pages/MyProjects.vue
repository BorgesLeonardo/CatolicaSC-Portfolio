<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { http, setAuthToken } from 'src/utils/http'
import { useAuth } from '@clerk/vue'
import { Notify, Dialog } from 'quasar'
import { formatMoneyBRL, formatDateTimeBR, isPast } from 'src/utils/format'
import { getImageUrl as buildImageUrl } from 'src/config/api'
import type { Project, ProjectResponse } from 'src/components/models'
import EditProjectDialog from 'src/components/EditProjectDialog.vue'
import { contributionsService } from 'src/services/contributions'
import { projectsService } from 'src/services/projects'
import { useProjectStats } from 'src/composables/useProjectStats'

const { isSignedIn, getToken } = useAuth()
const router = useRouter()
const { updateStatsIfNeeded } = useProjectStats()

const items = ref<Project[]>([])
const loading = ref(false)
const deleteLoading = ref<string | null>(null)
const deactivateLoading = ref<string | null>(null)
const activateLoading = ref<string | null>(null)

// Edit dialog state
const editDialogOpen = ref(false)
const projectToEdit = ref<Project | null>(null)

// Track projects with contributions
const projectsWithContributions = ref(new Set<string>())

// Removi computed não utilizados no template simplificado

async function fetchMyProjects() {
  if (!isSignedIn.value) return
  
  loading.value = true
  try {
    // Atualiza estatísticas se necessário (silenciosamente)
    await updateStatsIfNeeded()
    
  const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
    setAuthToken(token)
    
    const { data } = await http.get<ProjectResponse>('/api/projects/mine')
    items.value = data.items ?? []
    
    // Check which projects have contributions
    await checkProjectsContributions()
  } catch {
    // noop: removed debug log
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar suas campanhas'
    })
  } finally {
    loading.value = false
  }
}

async function checkProjectsContributions() {
  const contributionsChecks = items.value.map(async (project) => {
    try {
      const hasContributions = await contributionsService.hasContributions(project.id)
      if (hasContributions) {
        projectsWithContributions.value.add(project.id)
      } else {
        projectsWithContributions.value.delete(project.id)
      }
    } catch {
      // noop: removed debug log
      // Em caso de erro, assumimos que tem contribuições para ser seguro
      projectsWithContributions.value.add(project.id)
    }
  })
  
  await Promise.all(contributionsChecks)
}

function editProject(project: Project) {
  // Verifica se o projeto está ativo antes de permitir edição
  if (isPast(project.deadline)) {
    Notify.create({
      type: 'warning',
      message: 'Apenas campanhas ativas podem ser editadas',
      timeout: 3000
    })
    return
  }
  
  projectToEdit.value = project
  editDialogOpen.value = true
}

function deleteProject(project: Project) {
  // Verifica se há contribuições usando os dados já carregados
  const hasContributions = projectsWithContributions.value.has(project.id)

  if (hasContributions) {
    Notify.create({
      type: 'warning',
      message: 'Não é possível excluir campanhas que já receberam contribuições',
      timeout: 4000,
      icon: 'warning'
    })
    return
  }

  // Mostra dialog de confirmação
  Dialog.create({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir a campanha "${project.title}"? Esta ação não pode ser desfeita.`,
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
    void performDelete(project)
  })
}

function deactivateProject(project: Project) {
  if (project.status === 'ARCHIVED') {
    Notify.create({ type: 'info', message: 'Campanha já está desativada' })
    return
  }

  Dialog.create({
    title: 'Desativar campanha',
    message: `Deseja desativar a campanha "${project.title}"? Ela não poderá mais receber contribuições.`,
    ok: { label: 'Desativar', color: 'warning', icon: 'pause_circle' },
    cancel: { label: 'Cancelar', flat: true }
  }).onOk(() => { void performDeactivate(project) })
}

async function performDeactivate(project: Project) {
  deactivateLoading.value = project.id
  try {
    const updated = await projectsService.update(project.id, { status: 'ARCHIVED' })
    const idx = items.value.findIndex(p => p.id === project.id)
    if (idx !== -1) items.value[idx] = updated
    Notify.create({ type: 'positive', message: 'Campanha desativada' })
  } catch {
    Notify.create({ type: 'negative', message: 'Erro ao desativar campanha' })
  } finally {
    deactivateLoading.value = null
  }
}

function activateProject(project: Project) {
  if (project.status === 'PUBLISHED') {
    Notify.create({ type: 'info', message: 'Campanha já está ativa' })
    return
  }

  Dialog.create({
    title: 'Ativar campanha',
    message: `Deseja reativar a campanha "${project.title}"? Ela voltará a receber contribuições até o prazo.`,
    ok: { label: 'Ativar', color: 'positive', icon: 'play_circle' },
    cancel: { label: 'Cancelar', flat: true }
  }).onOk(() => { void performActivate(project) })
}

async function performActivate(project: Project) {
  activateLoading.value = project.id
  try {
    const updated = await projectsService.update(project.id, { status: 'PUBLISHED' })
    const idx = items.value.findIndex(p => p.id === project.id)
    if (idx !== -1) items.value[idx] = updated
    Notify.create({ type: 'positive', message: 'Campanha ativada' })
  } catch {
    Notify.create({ type: 'negative', message: 'Erro ao ativar campanha' })
  } finally {
    activateLoading.value = null
  }
}

async function performDelete(project: Project) {
  deleteLoading.value = project.id
  
  try {
    const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
    setAuthToken(token)
    
    await http.delete(`/api/projects/${project.id}`)
    
    // Remove da lista local
    items.value = items.value.filter(p => p.id !== project.id)
    
    // Remove do conjunto de contribuições
    projectsWithContributions.value.delete(project.id)
    
    Notify.create({
      type: 'positive',
      message: 'Campanha excluída com sucesso',
      icon: 'check_circle'
    })
  } catch {
    // noop: removed debug log
    Notify.create({
      type: 'negative',
      message: 'Erro ao excluir campanha. Tente novamente.',
      timeout: 4000
    })
  } finally {
    deleteLoading.value = null
  }
}

function viewProject(project: Project) {
  void router.push(`/projects/${project.id}`)
}

function createNewProject() {
  void router.push('/projects/new')
}

function getFirstImage(project: Project): string {
  // noop: removed debug log
  
  // Priorizar novas imagens (array images) sobre imageUrl legacy
  if (project.images && project.images.length > 0) {
    const url = buildImageUrl(project.images[0].url)
    // noop: removed debug log
    return url
  }
  
  // Fallback para imageUrl legacy
  if (project.imageUrl) {
    const url = buildImageUrl(project.imageUrl)
    // noop: removed debug log
    return url
  }
  
  // noop: removed debug log
  return ''
}

function handleProjectUpdated(updatedProject: Project) {
  // noop: removed debug log
  
  // Atualiza o projeto na lista
  const index = items.value.findIndex(p => p.id === updatedProject.id)
  if (index !== -1) {
    items.value[index] = updatedProject
    // noop: removed debug log
  } else {
    // noop: removed debug log
  }
  
  // Fecha o dialog
  editDialogOpen.value = false
  projectToEdit.value = null
  
  Notify.create({
    type: 'positive',
    message: 'Campanha atualizada com sucesso!',
    icon: 'check_circle'
  })
}

onMounted(fetchMyProjects)
</script>

<template>
  <div class="my-projects-page bg-surface">
    <!-- Header Section -->
    <div class="page-header q-pa-lg">
      <div class="container">
        <div class="row items-center justify-between">
          <div class="col">
            <h1 class="page-title">Minhas Campanhas</h1>
            <p class="page-subtitle">Gerencie suas campanhas de crowdfunding</p>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="add"
              label="Nova Campanha"
              @click="createNewProject"
              size="lg"
              class="create-btn"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="page-content q-pa-lg">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="row q-col-gutter-md">
            <div v-for="i in 3" :key="i" class="col-12 col-md-6 col-lg-4">
              <q-card class="campaign-skeleton">
                <q-skeleton height="200px" />
                <q-card-section>
                  <q-skeleton type="text" width="60%" />
                  <q-skeleton type="text" width="80%" />
                  <q-skeleton type="text" width="40%" />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Not Signed In State -->
        <div v-else-if="!isSignedIn" class="empty-state">
          <div class="empty-content">
            <q-icon name="account_circle" size="4rem" class="icon-muted" />
            <h3 class="empty-title">Faça login para continuar</h3>
            <p class="empty-description">
              Você precisa estar autenticado para ver suas campanhas
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0 && !loading" class="empty-state">
          <div class="empty-content">
            <q-icon name="campaign" size="4rem" class="icon-muted" />
            <h3 class="empty-title">Nenhuma campanha encontrada</h3>
            <p class="empty-description">
              Você ainda não criou nenhuma campanha. Que tal começar agora?
            </p>
            <q-btn
              color="primary"
              icon="add"
              label="Criar Primeira Campanha"
              @click="createNewProject"
              size="lg"
              class="q-mt-md"
            />
          </div>
        </div>

        <!-- Campaigns List (Simplified) -->
        <div v-else class="campaigns-content">
          <div class="row q-col-gutter-lg">
            <div 
              v-for="project in items" 
              :key="project.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card class="campaign-card modern-card" :class="{ 'expired-campaign': isPast(project.deadline) }">
                <!-- Modern Image Section -->
                <div class="card-image-section" @click="viewProject(project)">
                  <div class="card-image-frame">
                    <img
                      v-if="getFirstImage(project)"
                      :src="getFirstImage(project)"
                      :alt="`Imagem da campanha ${project.title}`"
                      class="card-hero-image"
                    />
                    <div v-else class="card-image-placeholder">
                      <q-icon name="image" size="2.5rem" class="icon-muted" />
                      <div class="text-caption text-hint q-mt-sm">Sem imagem</div>
                    </div>
                    
                    <!-- Hover overlay -->
                    <div class="card-hover-overlay">
                      <q-icon name="visibility" size="lg" color="white" />
                    </div>
                  </div>
                </div>

                <!-- Content -->
                <q-card-section>
                  <h3 class="campaign-title" @click="viewProject(project)">
                    {{ project.title }}
                  </h3>
                  
                  <div class="campaign-meta">
                    <div class="meta-item">
                      <q-icon name="flag" size="sm" />
                      {{ formatMoneyBRL(project.goalCents) }}
                    </div>
                    <div class="meta-item">
                      <q-icon name="schedule" size="sm" />
                      {{ formatDateTimeBR(project.deadline) }}
                    </div>
                  </div>

                  <q-badge 
                    :color="project.status === 'ARCHIVED' ? 'warning' : (isPast(project.deadline) ? 'grey-6' : 'positive')" 
                    :label="project.status === 'ARCHIVED' ? 'Desativada' : (isPast(project.deadline) ? 'Encerrada' : 'Ativa')"
                    class="q-mt-sm"
                  />
                </q-card-section>

                <!-- Actions -->
                <q-card-actions align="right">
                  <q-btn 
                    flat 
                    icon="visibility" 
                    @click="viewProject(project)"
                    class="action-btn"
                  >
                    <q-tooltip>Ver detalhes</q-tooltip>
                  </q-btn>
                  <q-btn 
                    v-if="!isPast(project.deadline) && project.status !== 'ARCHIVED'"
                    flat
                    icon="pause_circle"
                    color="warning"
                    @click="deactivateProject(project)"
                    :loading="deactivateLoading === project.id"
                    class="action-btn"
                  >
                    <q-tooltip>Desativar campanha</q-tooltip>
                  </q-btn>
                  <q-btn 
                    v-else-if="!isPast(project.deadline)"
                    flat
                    icon="play_circle"
                    color="positive"
                    @click="activateProject(project)"
                    :loading="activateLoading === project.id"
                    class="action-btn"
                  >
                    <q-tooltip>Ativar campanha</q-tooltip>
                  </q-btn>
                  <q-btn 
                    flat 
                    icon="edit" 
                    @click="editProject(project)"
                    :disable="isPast(project.deadline) || project.status === 'ARCHIVED'"
                    :color="(isPast(project.deadline) || project.status === 'ARCHIVED') ? 'grey-5' : 'primary'"
                    class="action-btn"
                  >
                    <q-tooltip>
                      {{ isPast(project.deadline) ? 'Campanha encerrada - não pode ser editada' : 'Editar campanha' }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn 
                    v-if="!projectsWithContributions.has(project.id)"
                    flat 
                    icon="delete" 
                    color="negative"
                    @click="deleteProject(project)"
                    :loading="deleteLoading === project.id"
                    class="action-btn"
                  >
                    <q-tooltip>Excluir campanha</q-tooltip>
                  </q-btn>
                  <div 
                    v-else
                    class="contribution-indicator"
                  >
                    <q-icon name="volunteer_activism" color="positive" size="sm">
                      <q-tooltip class="bg-positive text-white">
                        Esta campanha já recebeu contribuições e não pode ser excluída
                      </q-tooltip>
                    </q-icon>
                  </div>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Project Dialog -->
    <EditProjectDialog
      v-model="editDialogOpen"
      :project="projectToEdit"
      @project-updated="handleProjectUpdated"
    />
  </div>
</template>

<style scoped lang="scss">
.my-projects-page {
  min-height: 100vh;
  background: var(--gradient-subtle);
}

.page-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.page-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

.create-btn {
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.4);
  }
}

// Loading & Empty States
.loading-state, .empty-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.campaign-skeleton {
  border-radius: 16px;
  overflow: hidden;
}

.empty-content {
  text-align: center;
  max-width: 400px;
  
  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #374151;
    margin: 1rem 0 0.5rem 0;
  }
  
  .empty-description {
    color: #6b7280;
    margin: 0;
    line-height: 1.6;
  }
}

// === MODERN CAMPAIGN CARDS ===
.campaign-card {
  // Inherits modern-card styles from global CSS
  overflow: hidden;
  
  &.expired-campaign {
    opacity: 0.7;
    filter: grayscale(20%);
    
    &:hover {
      opacity: 0.85;
      transform: translateY(-2px) scale(1.01);
    }
  }
}

.card-image-section {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.card-image-frame {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: var(--gradient-subtle);
  transition: all var(--transition-base);
  
  &:hover {
    .card-hero-image {
      transform: scale(1.08);
    }
    
    .card-hover-overlay {
      opacity: 1;
    }
  }
}

.card-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.card-image-placeholder {
  height: 220px;
  background: var(--gradient-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--gradient-subtle);
    transform: scale(1.02);
  }
}

.card-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.85) 0%,
    rgba(59, 130, 246, 0.75) 50%,
    rgba(249, 115, 22, 0.85) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
  backdrop-filter: blur(4px);
}

.campaign-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-primary);
  }
}

.campaign-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    
    .q-icon {
      color: #9ca3af;
    }
  }
}

/* Dark-mode contrast improvements for My Projects */
[data-theme='dark'] .page-title { color: #e5e7eb; }
[data-theme='dark'] .page-subtitle { color: #cbd5e1; }
[data-theme='dark'] .campaign-title { color: #e5e7eb; }
[data-theme='dark'] .campaign-meta .meta-item { color: #cbd5e1; }

// Action Buttons
.q-card-actions {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  
  .q-btn {
    border-radius: 8px;
    font-weight: 500;
    
    &:hover {
      background: rgba(30, 64, 175, 0.1);
    }
    
    &[color="negative"]:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

/* Dark mode: soften whites and raise contrast */
[data-theme='dark'] .page-header { background: rgba(2,6,23,0.7); border-bottom-color: rgba(148,163,184,0.12); }
[data-theme='dark'] .campaign-card { background: rgba(17,24,39,0.7) !important; border: 1px solid rgba(148,163,184,0.12) !important; }
[data-theme='dark'] .card-image-frame { background: #0f172a; }
[data-theme='dark'] .q-card-actions { background: rgba(2,6,23,0.4); }

// Responsive Design
@media (max-width: 768px) {
  .page-header {
    .row {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
  
  .create-btn {
    width: 100%;
  }
  
  .campaign-card {
    margin-bottom: 1rem;
  }
}

// Action buttons
.action-btn {
  transition: all 0.2s ease;
  border-radius: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
  }
}

.contribution-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  
  .q-icon {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

// Smooth animations
* {
  transition: all 0.2s ease;
}
</style>

