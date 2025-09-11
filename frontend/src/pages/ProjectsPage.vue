<!-- src/pages/ProjectsPage.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { http } from 'src/utils/http'
import { useUser } from '@clerk/vue'
import { useRouter } from 'vue-router'
import type { Project, ProjectResponse, Category } from 'src/components/models'
import CampaignCard from 'src/components/CampaignCard.vue'
import { categoriesService } from 'src/services/categories'

const router = useRouter()
const { isSignedIn, user } = useUser()

// filtros
const q = ref('')
const onlyActive = ref(true)
const onlyMine = ref(false)
const categoryId = ref('')
const sortBy = ref('newest')

// categorias disponíveis
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// opções de ordenação
const sortOptions = [
  { label: 'Mais recentes', value: 'newest' },
  { label: 'Mais antigas', value: 'oldest' },
  { label: 'Maior meta', value: 'goal_desc' },
  { label: 'Menor meta', value: 'goal_asc' },
  { label: 'Prazo (mais próximo)', value: 'deadline_asc' },
  { label: 'Prazo (mais distante)', value: 'deadline_desc' }
]

// paginação
const page = ref(1)
const pageSize = ref(9) // 3x3 grid looks better
const total = ref(0)
const items = ref<Project[]>([])
const loading = ref(false)

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
    <section class="q-py-xl bg-white">
      <div class="container">
        <div class="text-center q-mb-lg">
          <h1 class="section-title">Campanhas de Crowdfunding</h1>
          <p class="section-subtitle">
            Descubra projetos incríveis e ajude a transformar ideias em realidade
          </p>
        </div>
      </div>
    </section>

    <!-- Filters Section -->
    <section class="q-py-md">
      <div class="container">
        <div class="filters-section">
          <div class="row items-end q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input 
                v-model="q" 
                label="Buscar campanhas" 
                dense 
                clearable 
                outlined
                placeholder="Digite o nome da campanha..."
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="categoryId"
                :options="categoryOptions"
                label="Categoria"
                dense
                outlined
                clearable
                emit-value
                map-options
                :loading="loadingCategories"
                placeholder="Todas as categorias"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar v-if="scope.opt.icon">
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption v-if="scope.opt.projectsCount !== undefined">
                        {{ scope.opt.projectsCount }} {{ scope.opt.projectsCount === 1 ? 'campanha' : 'campanhas' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-6 col-md-2">
              <q-toggle 
                v-model="onlyActive" 
                label="Somente ativas" 
                color="primary"
                class="text-weight-medium"
              />
            </div>
            <div class="col-6 col-md-2">
              <q-toggle 
                v-model="onlyMine" 
                :disable="!isSignedIn" 
                label="Minhas campanhas" 
                color="primary"
                class="text-weight-medium"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-select
                v-model="sortBy"
                :options="sortOptions"
                label="Ordenar por"
                dense
                outlined
                emit-value
                map-options
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="q-pb-xl">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner size="50px" color="primary" />
          <div class="text-h6 q-mt-md text-grey-7">Carregando campanhas...</div>
        </div>

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
          <div class="row items-center justify-between q-mb-lg">
            <div class="col-auto">
              <div class="text-h6 text-weight-medium text-grey-8">
                {{ total }} {{ total === 1 ? 'campanha encontrada' : 'campanhas encontradas' }}
              </div>
            </div>
            <div class="col-auto">
              <div class="text-body2 text-grey-6">
                Página {{ page }} de {{ Math.max(1, Math.ceil(total / pageSize)) }}
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-lg">
            <div 
              v-for="(project, index) in items" 
              :key="project.id" 
              class="col-12 col-md-6 col-lg-4"
            >
              <CampaignCard
                :project="project"
                :style="{ 'animation-delay': `${index * 0.1}s` }"
                @click="openProject"
                @favorite="handleFavorite"
              />
            </div>
          </div>

          <!-- Pagination -->
          <div class="text-center q-mt-xl">
            <q-pagination
              v-model="page"
              :max="Math.max(1, Math.ceil(total / pageSize))"
              :max-pages="7"
              boundary-numbers
              direction-links
              color="primary"
              size="lg"
            />
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .filters-section {
    padding: 16px;
  }
}
</style>
