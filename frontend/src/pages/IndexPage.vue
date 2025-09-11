<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Hero Section -->
      <div class="col-12">
        <q-card class="bg-primary text-white rounded-borders">
          <q-card-section class="text-center q-pa-xl">
            <h1 class="text-h3 text-weight-700 q-mb-md">
              Faça a diferença com suas campanhas
            </h1>
            <p class="text-h6 q-mb-lg">
              Crie e apoie campanhas que transformam vidas e comunidades
            </p>
            <q-btn
              color="secondary"
              size="lg"
              label="Criar Nova Campanha"
              icon="add_circle"
              to="/projects/create"
              class="q-px-xl"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Campaigns Section -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <h2 class="text-h5 text-weight-600 q-ma-none">
            Campanhas Recentes
          </h2>
          <q-btn
            flat
            color="primary"
            label="Ver todas"
            to="/projects"
            icon-right="arrow_forward"
          />
        </div>

        <div v-if="loading" class="row q-gutter-md">
          <div v-for="n in 3" :key="n" class="col-12 col-md-6 col-lg-4">
            <q-card class="rounded-borders">
              <q-skeleton height="200px" />
              <q-card-section>
                <q-skeleton type="text" width="80%" />
                <q-skeleton type="text" width="60%" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else-if="recentProjects.length === 0" class="q-mt-xl">
          <UiEmptyState
            icon="campaign"
            title="Nenhuma campanha encontrada"
            description="Seja o primeiro a criar uma campanha e fazer a diferença!"
          >
            <template #action>
              <q-btn
                color="primary"
                label="Criar Primeira Campanha"
                to="/projects/create"
                icon="add_circle"
              />
            </template>
          </UiEmptyState>
        </div>

        <div v-else class="row q-gutter-md">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <ProjectCard
              :id="project.id"
              :title="project.name"
              :owner-name="project.ownerName"
              :image-url="project.imageUrl"
              :goal="project.goal"
              :raised="project.raised"
              :supporters="project.supporters"
              :ends-at="project.endsAt"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useProjectsStore } from '../stores/useProjectsStore'
import UiEmptyState from '../components/ui/UiEmptyState.vue'
import ProjectCard from '../components/projects/ProjectCard.vue'

const projectsStore = useProjectsStore()

const loading = computed(() => projectsStore.loading)
const recentProjects = computed(() => projectsStore.items.slice(0, 6))

onMounted(async () => {
  try {
    await projectsStore.fetch()
  } catch (error) {
    console.error('Erro ao carregar projetos:', error)
  }
})
</script>