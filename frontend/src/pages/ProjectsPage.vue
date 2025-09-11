<!-- src/pages/ProjectsPage.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { http } from 'src/utils/http'
import { useUser } from '@clerk/vue'
import { formatMoneyBRL, formatDateTimeBR, isPast } from 'src/utils/format'
import { useRouter } from 'vue-router'
import type { Project, ProjectResponse } from 'src/components/models'

const router = useRouter()
const { isSignedIn, user } = useUser()

// filtros
const q = ref('')
const onlyActive = ref(true)
const onlyMine = ref(false)

// paginação
const page = ref(1)
const pageSize = ref(8)
const total = ref(0)
const items = ref<Project[]>([])
const loading = ref(false)

const ownerId = computed(() => (onlyMine.value && isSignedIn.value ? user.value?.id : undefined))

async function fetchProjects() {
  loading.value = true
  try {
    const { data } = await http.get<ProjectResponse>('/api/projects', {
      params: {
        q: q.value || undefined,
        active: onlyActive.value ? 1 : undefined,
        ownerId: ownerId.value,
        page: page.value,
        pageSize: pageSize.value
      }
    })
    total.value = data.total ?? 0
    items.value = data.items ?? []
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)
watch([q, onlyActive, onlyMine, page, pageSize], fetchProjects)

function openProject(id: string) {
  void router.push(`/projects/${id}`)
}
</script>

<template>
  <div class="q-pa-md">
    <div class="row items-end q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input v-model="q" label="Buscar por título" dense clearable filled>
          <template #append><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-6 col-md-2">
        <q-toggle v-model="onlyActive" label="Somente ativas" />
      </div>
      <div class="col-6 col-md-2">
        <q-toggle v-model="onlyMine" :disable="!isSignedIn" label="Só minhas" />
      </div>
    </div>

    <q-inner-loading :showing="loading"><q-spinner size="32px" /></q-inner-loading>

    <div class="row q-col-gutter-md">
      <div v-for="p in items" :key="p.id" class="col-12 col-md-6 col-lg-4">
        <q-card clickable bordered @click="openProject(p.id)">
          <q-img v-if="p.imageUrl" :src="p.imageUrl" ratio="16/9" />
          <q-card-section>
            <div class="text-subtitle1">{{ p.title }}</div>
            <div class="text-caption">
              Meta: {{ formatMoneyBRL(p.goalCents) }}
              • Limite: {{ formatDateTimeBR(p.deadline) }}
              <q-badge v-if="isPast(p.deadline)" color="grey-7" class="q-ml-sm">Encerrada</q-badge>
              <q-badge v-else color="positive" class="q-ml-sm">Ativa</q-badge>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mt-md flex justify-end">
      <q-pagination
        v-model="page"
        :max="Math.max(1, Math.ceil(total / pageSize))"
        boundary-numbers
        direction-links
      />
    </div>
  </div>
</template>
