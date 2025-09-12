<!-- src/pages/ProjectsPage.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { http } from 'src/utils/http'
import { useUser } from '@clerk/vue'
import { useRouter } from 'vue-router'
import type { Project, ProjectResponse, Category } from 'src/components/models'
import CampaignCard from 'src/components/CampaignCard.vue'
import ModernLoading from 'src/components/ModernLoading.vue'
import DynamicGrid from 'src/components/DynamicGrid.vue'
import AdvancedSearch from 'src/components/AdvancedSearch.vue'
import FloatingActionMenu from 'src/components/FloatingActionMenu.vue'
import { categoriesService } from 'src/services/categories'
import { useProjectStats } from 'src/composables/useProjectStats'

const router = useRouter()
const { isSignedIn, user } = useUser()
const { updateStatsIfNeeded } = useProjectStats()

// filtros
const q = ref('')
const onlyActive = ref(true)
const onlyMine = ref(false)
const categoryId = ref('')
const sortBy = ref('newest')

// categorias disponíveis
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// opções de ordenação - mantido para compatibilidade futura
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sortOptions = [
  { label: 'Mais recentes', value: 'newest' },
  { label: 'Mais antigas', value: 'oldest' },
  { label: 'Maior meta', value: 'goal_desc' },
  { label: 'Menor meta', value: 'goal_asc' },
  { label: 'Prazo (mais próximo)', value: 'deadline_asc' },
  { label: 'Prazo (mais distante)', value: 'deadline_desc' }
]

// paginação e visualização
const page = ref(1)
const pageSize = ref(9) // 3x3 grid looks better
const total = ref(0)
const items = ref<Project[]>([])
const loading = ref(false)
const viewMode = ref<'grid' | 'list' | 'masonry'>('grid')

const ownerId = computed(() => (onlyMine.value && isSignedIn.value ? user.value?.id : undefined))

const categoryOptions = computed(() => 
  categories.value.map(category => ({
    label: category.name,
    value: category.id,
    ...category
  }))
)

async function fetchProjects() {
  loading.value = true
  try {
    // Atualiza estatísticas se necessário (silenciosamente)
    await updateStatsIfNeeded()
    
    const { data } = await http.get<ProjectResponse>('/api/projects', {
      params: {
        q: q.value || undefined,
        active: onlyActive.value ? 1 : undefined,
        ownerId: ownerId.value,
        categoryId: categoryId.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
        sort: sortBy.value
      }
    })
    total.value = data.total ?? 0
    items.value = data.items ?? []
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    loadingCategories.value = true
    categories.value = await categoriesService.getAll()
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  } finally {
    loadingCategories.value = false
  }
}

// Computed properties for filters - mantido para compatibilidade futura
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const hasActiveFilters = computed(() => {
  return !!(q.value || categoryId.value || onlyMine.value || !onlyActive.value)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCategoryName(id: string): string {
  const category = categories.value.find(cat => cat.id === id)
  return category?.name || 'Categoria'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearAllFilters() {
  q.value = ''
  categoryId.value = ''
  onlyMine.value = false
  onlyActive.value = true
  page.value = 1
}

// Floating action menu
const floatingActions = [
  {
    id: 'create-project',
    icon: 'add_circle',
    label: 'Nova Campanha',
    color: 'primary',
    action: () => router.push('/projects/new')
  },
  {
    id: 'saved-projects',
    icon: 'bookmark',
    label: 'Projetos Salvos',
    color: 'secondary',
    action: () => console.log('Show saved projects')
  },
  {
    id: 'share',
    icon: 'share',
    label: 'Compartilhar',
    color: 'info',
    action: () => console.log('Share projects')
  },
  {
    id: 'filter',
    icon: 'filter_alt',
    label: 'Filtros Avançados',
    color: 'accent',
    action: () => console.log('Open advanced filters')
  }
]

interface AdvancedFilters {
  category?: string
  status?: string[]
  sortBy?: string
  goalMin?: number
  goalMax?: number
  dateRange?: string
  location?: string
}

function handleAdvancedSearch(query: string, filters: AdvancedFilters) {
  q.value = query
  // Apply advanced filters
  if (filters.category) categoryId.value = filters.category
  if (filters.status) {
    onlyActive.value = filters.status.includes('active')
  }
  if (filters.sortBy) sortBy.value = filters.sortBy
  
  // Trigger search
  page.value = 1
  void fetchProjects()
}

function handleQuickFilter(filterKey: string) {
  switch (filterKey) {
    case 'active':
      onlyActive.value = true
      break
    case 'ending-soon':
      sortBy.value = 'deadline_asc'
      break
    case 'successful':
      // Add logic for successful projects
      break
    case 'trending':
      sortBy.value = 'popular'
      break
  }
  
  page.value = 1
  void fetchProjects()
}

interface SearchSuggestion {
  text: string
  category: string
  icon: string
  value?: string | number
}

function handleSuggestion(suggestion: SearchSuggestion) {
  q.value = suggestion.text
  page.value = 1
  void fetchProjects()
}

interface FloatingAction {
  id: string
  icon: string
  label: string
  color?: string
  action?: () => void
}

function handleFloatingAction(action: FloatingAction) {
  console.log('Floating action:', action.id)
}

function handleFavorite(project: Project) {
  console.log('Favorited project:', project.title)
  // Implementar lógica de favoritos
}

onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchProjects()
  ])
})
watch([q, onlyActive, onlyMine, categoryId, sortBy, page, pageSize], fetchProjects)

function openProject(id: string) {
  void router.push(`/projects/${id}`)
}
</script>

<template>
  <q-page class="bg-grey-1">
    <!-- Header Section -->
    <section class="projects-header">
      <div class="header-background">
        <div class="header-pattern"></div>
      </div>
      
      <div class="container">
        <div class="header-content">
          <div class="header-badge fade-in-up">
            <q-icon name="explore" size="sm" class="q-mr-xs" />
            Explore Projetos
          </div>
          
          <h1 class="header-title fade-in-up">Campanhas de <span class="gradient-text">Crowdfunding</span></h1>
          
          <p class="header-subtitle fade-in-up">
            Descubra projetos incríveis e ajude a transformar ideias em realidade. 
            Cada contribuição faz a diferença!
          </p>
          
          <!-- Quick Stats -->
          <div class="quick-stats fade-in-up">
            <div class="quick-stat">
              <div class="stat-number">{{ total }}</div>
              <div class="stat-label">Projetos Ativos</div>
            </div>
            <div class="quick-stat">
              <div class="stat-number">{{ categoryOptions.length }}</div>
              <div class="stat-label">Categorias</div>
            </div>
            <div class="quick-stat">
              <div class="stat-number">85%</div>
              <div class="stat-label">Taxa de Sucesso</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Advanced Search Section -->
    <section class="search-section-wrapper">
      <div class="container">
        <AdvancedSearch 
          :category-options="categoryOptions"
          @search="handleAdvancedSearch"
          @quick-filter="handleQuickFilter"
          @suggestion="handleSuggestion"
        />
      </div>
    </section>

    <!-- Results Section -->
    <section class="q-pb-xl">
      <div class="container">
        <!-- Loading State -->
        <ModernLoading 
          v-if="loading"
          title="Carregando campanhas"
          subtitle="Encontrando os melhores projetos para você"
        />

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="empty-state">
          <q-icon name="search_off" class="empty-icon" />
          <h3 class="empty-title">Nenhuma campanha encontrada</h3>
          <p class="empty-description">
            Tente ajustar os filtros ou criar uma nova campanha para começar.
          </p>
          <q-btn 
            unelevated
            color="primary"
            label="Criar Nova Campanha"
            to="/projects/new"
            size="lg"
          />
        </div>

        <!-- Campaigns Grid -->
        <div v-else>
          <!-- Results Info -->
          <div class="results-header">
            <div class="results-info">
              <div class="results-count">
                <q-icon name="campaign" color="primary" size="sm" class="q-mr-sm" />
                <span class="count-number">{{ total }}</span>
                <span class="count-label">{{ total === 1 ? 'projeto encontrado' : 'projetos encontrados' }}</span>
              </div>
              <div class="results-meta">
                <span class="page-info">Página {{ page }} de {{ Math.max(1, Math.ceil(total / pageSize)) }}</span>
                <q-separator vertical class="q-mx-sm" />
                <span class="view-mode">
                  <q-btn-toggle
                    v-model="viewMode"
                    :options="[
                      {label: 'Grade', value: 'grid', icon: 'grid_view'},
                      {label: 'Lista', value: 'list', icon: 'view_list'},
                      {label: 'Mosaico', value: 'masonry', icon: 'view_quilt'}
                    ]"
                    flat
                    dense
                    color="primary"
                    class="view-toggle"
                  />
                </span>
              </div>
            </div>
          </div>

          <!-- Dynamic Projects Grid -->
          <DynamicGrid 
            :items="items"
            :layout="viewMode === 'grid' ? 'grid' : 'flex'"
            :animated="true"
            :responsive="true"
            :masonry="viewMode === 'masonry'"
            min-item-width="350px"
            gap="24px"
            item-key="id"
          >
            <template #default="{ item: project }">
              <CampaignCard
                :project="project"
                @click="openProject"
                @favorite="handleFavorite"
                :class="{ 'campaign-card--list': viewMode === 'list' }"
              />
            </template>
          </DynamicGrid>

          <!-- Pagination -->
          <div class="pagination-section">
            <div class="pagination-info">
              <span>Mostrando {{ Math.min((page - 1) * pageSize + 1, total) }} - {{ Math.min(page * pageSize, total) }} de {{ total }} projetos</span>
            </div>
            
            <q-pagination
              v-model="page"
              :max="Math.max(1, Math.ceil(total / pageSize))"
              :max-pages="7"
              boundary-numbers
              direction-links
              color="primary"
              size="lg"
              class="modern-pagination"
            />
            
            <div class="page-size-selector">
              <span class="page-size-label">Itens por página:</span>
              <q-select
                v-model="pageSize"
                :options="[6, 9, 12, 18, 24]"
                dense
                outlined
                style="min-width: 80px"
                class="page-size-select"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Floating Action Menu -->
    <FloatingActionMenu 
      :actions="floatingActions"
      main-icon="add"
      main-tooltip="Ações rápidas"
      @action="handleFloatingAction"
    />
  </q-page>
</template>

<style scoped lang="scss">
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

// === PROJECTS HEADER ===
.projects-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  color: white;
  padding: 100px 0 80px;
  position: relative;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.header-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>') repeat;
}

.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin-bottom: 20px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  opacity: 0.95;
  margin-bottom: 40px;
  line-height: 1.6;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.quick-stat {
  text-align: center;
  
  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 4px;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.875rem;
    opacity: 0.8;
    font-weight: 500;
  }
}

// === FILTERS SECTION ===
.filters-section-wrapper {
  padding: 40px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.filters-section {
  padding: 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-section-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  padding: 48px 0 64px;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 64px 0 80px;
  }
  
  @media (min-width: 1024px) {
    padding: 80px 0 96px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(245, 101, 101, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .container {
    position: relative;
    z-index: 1;
  }
}

.search-section {
  margin-bottom: 32px;
}

.search-input-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  .q-field__control {
    border-radius: 16px;
    height: 56px;
  }
  
  .q-field__label {
    font-weight: 500;
  }
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.filter-item {
  .q-field__control {
    border-radius: 12px;
    height: 48px;
  }
}

.toggle-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.toggle-group {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.filter-toggle {
  font-weight: 500;
  
  .q-toggle__label {
    font-size: 0.925rem;
  }
}

.filter-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.clear-filters-btn {
  color: #64748b;
  font-size: 0.875rem;
  
  &:hover {
    color: #475569;
  }
}

.category-option {
  .q-item__section--avatar {
    min-width: 40px;
  }
}

// === RESULTS SECTION ===
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.results-count {
  display: flex;
  align-items: center;
  
  .count-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-right: 6px;
  }
  
  .count-label {
    color: #64748b;
    font-weight: 500;
  }
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #64748b;
  font-size: 0.875rem;
}

.view-toggle {
  border-radius: 8px;
  
  .q-btn {
    font-size: 0.8125rem;
    padding: 6px 12px;
  }
}

// === PROJECTS CONTAINER ===
.projects-container {
  margin-bottom: 48px;
  
  &--grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 32px;
  }
  
  &--list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.project-item {
  &.fade-in-up {
    opacity: 0;
    animation-fill-mode: forwards;
  }
}

// List view modifications for campaign cards
.campaign-card--list {
  .campaign-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    padding: 24px;
  }
  
  .campaign-image {
    height: 200px;
    width: 300px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .content-main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

// === PAGINATION SECTION ===
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 32px 0;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.modern-pagination {
  .q-pagination__content {
    gap: 4px;
  }
  
  .q-btn {
    border-radius: 8px;
    font-weight: 600;
    
    &.q-btn--active {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
    }
  }
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.page-size-select {
  .q-field__control {
    border-radius: 8px;
    height: 36px;
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }
  
  .quick-stats {
    gap: 24px;
  }
  
  .projects-container--grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .projects-header {
    padding: 80px 0 60px;
  }
  
  .filters-section {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .toggle-group {
    gap: 20px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .projects-container--grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .campaign-card--list {
    .campaign-content {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    
    .campaign-image {
      width: 100%;
      height: 200px;
    }
  }
  
  .pagination-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .quick-stats {
    gap: 20px;
    
    .quick-stat {
      .stat-number {
        font-size: 1.5rem;
      }
    }
  }
}

@media (max-width: 640px) {
  .filters-section {
    padding: 20px 16px;
  }
  
  .filter-row {
    gap: 16px;
  }
  
  .toggle-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 16px;
  }
}

// === FLOATING ACTION MENU INTEGRATION ===
.q-page {
  position: relative;
}

// === ENHANCED ANIMATIONS ===
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// === PERFORMANCE OPTIMIZATIONS ===
.campaign-card {
  will-change: transform;
  
  &:hover {
    will-change: transform, box-shadow;
  }
}

// === ACCESSIBILITY IMPROVEMENTS ===
@media (prefers-reduced-motion: reduce) {
  .campaign-card,
  .floating-action-menu {
    animation: none !important;
    transition: none !important;
  }
  
  .campaign-card:hover {
    transform: none !important;
  }
}
</style>
