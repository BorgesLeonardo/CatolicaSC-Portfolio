<template>
  <q-page v-if="project" class="q-pa-md">
    <div class="row q-gutter-lg">
      <!-- Main Content -->
      <div class="col-12 col-lg-8">
        <!-- Header -->
        <q-card class="rounded-borders q-mb-lg">
          <div class="project-header">
            <q-img
              :src="project.imageUrl || '/placeholder-project.jpg'"
              :alt="project.name"
              class="project-cover"
              fit="cover"
            >
              <div class="absolute-top-right q-pa-md">
                <q-chip
                  v-if="isEndingSoon"
                  color="warning"
                  text-color="white"
                  icon="schedule"
                >
                  Termina em breve
                </q-chip>
              </div>
            </q-img>
            
            <div class="q-pa-lg">
              <h1 class="text-h4 text-weight-700 q-mb-sm">
                {{ project.name }}
              </h1>
              <p class="text-body1 text-grey-7 q-mb-none">
                por {{ project.ownerName }}
              </p>
            </div>
          </div>
        </q-card>

        <!-- Tabs -->
        <q-card class="rounded-borders">
          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="description" label="Descrição" />
            <q-tab name="updates" label="Atualizações" />
            <q-tab name="comments" label="Comentários" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="description" class="q-pa-lg">
              <div v-if="project.description" v-html="project.description"></div>
              <div v-else class="text-grey-7">
                Nenhuma descrição disponível.
              </div>
            </q-tab-panel>

            <q-tab-panel name="updates" class="q-pa-lg">
              <UiEmptyState
                icon="update"
                title="Nenhuma atualização"
                description="Ainda não há atualizações para esta campanha."
              />
            </q-tab-panel>

            <q-tab-panel name="comments" class="q-pa-lg">
              <UiEmptyState
                icon="comment"
                title="Nenhum comentário"
                description="Seja o primeiro a comentar nesta campanha!"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-lg-4">
        <q-card class="rounded-borders sticky-card">
          <q-card-section>
            <!-- Progress -->
            <UiProgress
              :label="`R$ ${formatMoney(project.raised || 0)} arrecadados`"
              :current="project.raised || 0"
              :total="project.goal || 0"
              class="q-mb-lg"
            />

            <!-- Stats -->
            <div class="row q-gutter-md q-mb-lg">
              <div class="col text-center">
                <div class="text-h6 text-weight-700 text-primary">
                  {{ project.supporters || 0 }}
                </div>
                <div class="text-caption text-grey-7">
                  Apoiadores
                </div>
              </div>
              <div class="col text-center">
                <div class="text-h6 text-weight-700 text-primary">
                  R$ {{ formatMoney(project.goal || 0) }}
                </div>
                <div class="text-caption text-grey-7">
                  Meta
                </div>
              </div>
              <div v-if="project.endsAt" class="col text-center">
                <div class="text-h6 text-weight-700 text-primary">
                  {{ daysLeft }}
                </div>
                <div class="text-caption text-grey-7">
                  Dias restantes
                </div>
              </div>
            </div>

            <!-- Contribute Button -->
            <q-btn
              color="primary"
              label="Contribuir"
              icon="favorite"
              size="lg"
              class="full-width q-mb-md"
              rounded
              @click="showContributionDialog = true"
            />

            <!-- Share Button -->
            <q-btn
              outline
              color="primary"
              label="Compartilhar"
              icon="share"
              class="full-width"
              rounded
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Contribution Dialog -->
    <ContributionDialog
      v-model="showContributionDialog"
      :project-id="project.id"
      :project-name="project.name"
      :image-url="project.imageUrl"
    />
  </q-page>

  <!-- Loading State -->
  <q-page v-else-if="loading" class="q-pa-md">
    <div class="row q-gutter-lg">
      <div class="col-12 col-lg-8">
        <q-card class="rounded-borders">
          <q-skeleton height="300px" />
          <q-card-section>
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="60%" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-4">
        <q-card class="rounded-borders">
          <q-card-section>
            <q-skeleton type="text" width="100%" />
            <q-skeleton type="text" width="80%" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>

  <!-- Error State -->
  <q-page v-else class="q-pa-md">
    <UiEmptyState
      icon="error"
      title="Projeto não encontrado"
      description="O projeto que você está procurando não existe ou foi removido."
    >
      <template #action>
        <q-btn
          color="primary"
          label="Voltar para campanhas"
          to="/projects"
          icon="arrow_back"
        />
      </template>
    </UiEmptyState>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '../stores/useProjectsStore'
import UiEmptyState from '../components/ui/UiEmptyState.vue'
import UiProgress from '../components/ui/UiProgress.vue'
import ContributionDialog from '../components/projects/ContributionDialog.vue'

const route = useRoute()
const projectsStore = useProjectsStore()

const project = ref(null)
const loading = ref(false)
const activeTab = ref('description')
const showContributionDialog = ref(false)

const isEndingSoon = computed(() => {
  if (!project.value?.endsAt) return false
  const endDate = new Date(project.value.endsAt)
  const now = new Date()
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysLeft <= 7 && daysLeft > 0
})

const daysLeft = computed(() => {
  if (!project.value?.endsAt) return 0
  const endDate = new Date(project.value.endsAt)
  const now = new Date()
  return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
})

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

onMounted(async () => {
  const projectId = Number(route.params.id)
  if (!projectId) return

  loading.value = true
  try {
    project.value = await projectsStore.getById(projectId)
  } catch (error) {
    console.error('Erro ao carregar projeto:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.project-header {
  position: relative;
}

.project-cover {
  height: 300px;
  width: 100%;
}

.sticky-card {
  position: sticky;
  top: 20px;
}
</style>
