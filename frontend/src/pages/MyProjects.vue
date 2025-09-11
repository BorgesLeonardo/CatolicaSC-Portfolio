<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { http } from 'src/utils/http'
import { useAuth } from '@clerk/vue'
import { Notify, Dialog } from 'quasar'
import { formatMoneyBRL, formatDateTimeBR, isPast } from 'src/utils/format'
import type { Project, ProjectResponse } from 'src/components/models'

const { isSignedIn, getToken } = useAuth()
const router = useRouter()

const items = ref<Project[]>([])
const loading = ref(false)
const deleteLoading = ref<string | null>(null)

// Removi computed não utilizados no template simplificado

async function fetchMyProjects() {
  if (!isSignedIn.value) return
  
  loading.value = true
  try {
    const token = await getToken.value()
    const { data } = await http.get<ProjectResponse>('/api/projects/mine', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    items.value = data.items ?? []
  } catch (error) {
    console.error('Error fetching my projects:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar suas campanhas'
    })
  } finally {
    loading.value = false
  }
}

function editProject(project: Project) {
  // Por enquanto, redireciona para a página de detalhes
  // Futuramente pode ser uma página de edição dedicada
  void router.push(`/projects/${project.id}`)
}

function deleteProject(project: Project) {
  // Primeiro verifica se há contribuições (simulado por enquanto)
  const hasContributions = Math.random() > 0.7 // 30% chance de ter contribuições

  if (hasContributions) {
    Notify.create({
      type: 'warning',
      message: 'Não é possível excluir campanhas que já receberam contribuições',
      timeout: 4000
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
      flat: true
    },
    persistent: true
  }).onOk(() => {
    void performDelete(project)
  })
}

async function performDelete(project: Project) {
  deleteLoading.value = project.id
  
  try {
    const token = await getToken.value()
    await http.delete(`/api/projects/${project.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    
    // Remove da lista local
    items.value = items.value.filter(p => p.id !== project.id)
    
    Notify.create({
      type: 'positive',
      message: 'Campanha excluída com sucesso',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
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

onMounted(fetchMyProjects)
</script>

<template>
  <div class="my-projects-page">
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
            <q-icon name="account_circle" size="4rem" color="grey-4" />
            <h3 class="empty-title">Faça login para continuar</h3>
            <p class="empty-description">
              Você precisa estar autenticado para ver suas campanhas
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0 && !loading" class="empty-state">
          <div class="empty-content">
            <q-icon name="campaign" size="4rem" color="grey-4" />
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
              <q-card class="campaign-card" :class="{ 'expired-campaign': isPast(project.deadline) }">
                <!-- Image -->
                <q-img
                  v-if="project.imageUrl"
                  :src="project.imageUrl"
                  ratio="16/9"
                  fit="cover"
                  class="cursor-pointer"
                  @click="viewProject(project)"
                />
                <div v-else class="image-placeholder" @click="viewProject(project)">
                  <q-icon name="campaign" size="2rem" color="grey-4" />
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
                    :color="isPast(project.deadline) ? 'grey-6' : 'positive'" 
                    :label="isPast(project.deadline) ? 'Encerrada' : 'Ativa'"
                    class="q-mt-sm"
                  />
                </q-card-section>

                <!-- Actions -->
                <q-card-actions align="right">
                  <q-btn flat icon="visibility" @click="viewProject(project)" />
                  <q-btn flat icon="edit" @click="editProject(project)" />
                  <q-btn 
                    flat 
                    icon="delete" 
                    color="negative"
                    @click="deleteProject(project)"
                    :loading="deleteLoading === project.id"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.my-projects-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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

// Campaign Cards
.campaign-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
  
  &.expired-campaign {
    opacity: 0.8;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}

.image-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  }
}

.campaign-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #3b82f6;
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
    color: #6b7280;
    
    .q-icon {
      color: #9ca3af;
    }
  }
}

// Action Buttons
.q-card-actions {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  
  .q-btn {
    border-radius: 8px;
    font-weight: 500;
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
    }
    
    &[color="negative"]:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

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

// Smooth animations
* {
  transition: all 0.2s ease;
}
</style>
