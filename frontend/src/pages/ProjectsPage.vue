<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-700 q-ma-none">
          Campanhas
        </h1>
        <p class="text-body1 text-grey-7 q-mt-xs q-mb-none">
          Gerencie suas campanhas e apoie outras iniciativas
        </p>
      </div>
      <q-btn
        color="primary"
        label="Nova Campanha"
        icon="add_circle"
        to="/projects/create"
        size="lg"
      />
    </div>

    <!-- Search Bar -->
    <div class="row q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          placeholder="Buscar campanhas..."
          outlined
          clearable
          @update:model-value="onSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- My Campaigns Section -->
    <div class="q-mb-xl">
      <h2 class="text-h5 text-weight-600 q-mb-md">
        Campanhas que você lidera
      </h2>
      
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

      <div v-else-if="owned.length === 0" class="q-mt-lg">
        <UiEmptyState
          icon="campaign"
          title="Você ainda não criou campanhas"
          description="Que tal criar sua primeira campanha e começar a fazer a diferença?"
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
          v-for="project in owned"
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

    <!-- Supporting Campaigns Section -->
    <div>
      <h2 class="text-h5 text-weight-600 q-mb-md">
        Campanhas que você apoia
      </h2>
      
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

      <div v-else-if="collaborating.length === 0" class="q-mt-lg">
        <UiEmptyState
          icon="favorite"
          title="Você ainda não apoia campanhas"
          description="Explore as campanhas disponíveis e apoie iniciativas que você acredita!"
        >
          <template #action>
            <q-btn
              color="primary"
              label="Explorar Campanhas"
              to="/"
              icon="explore"
            />
          </template>
        </UiEmptyState>
      </div>

      <div v-else class="row q-gutter-md">
        <div
          v-for="project in collaborating"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProjectsStore } from '../stores/useProjectsStore'
import UiEmptyState from '../components/ui/UiEmptyState.vue'
import ProjectCard from '../components/projects/ProjectCard.vue'

const projectsStore = useProjectsStore()

const searchQuery = ref('')
const loading = computed(() => projectsStore.loading)
const owned = computed(() => projectsStore.owned)
const collaborating = computed(() => projectsStore.collaborating)

let searchTimeout: NodeJS.Timeout

const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    void (async () => {
      try {
        await projectsStore.fetch({ search: searchQuery.value })
      } catch (error) {
        console.error('Erro ao buscar projetos:', error)
      }
    })()
  }, 500)
}

onMounted(async () => {
  try {
    await projectsStore.fetch()
  } catch (error) {
    console.error('Erro ao carregar projetos:', error)
  }
})
</script>