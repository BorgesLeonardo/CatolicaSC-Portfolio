<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { http } from 'src/utils/http'
import { useAuth } from '@clerk/vue'
import type { Project, ProjectResponse } from 'src/components/models'

const { isSignedIn, getToken } = useAuth()
const items = ref<Project[]>([])

onMounted(async () => {
  if (!isSignedIn.value) return
  
  try {
    const token = await getToken.value()
    const { data } = await http.get<ProjectResponse>('/api/projects/mine', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    items.value = data.items ?? []
  } catch (error) {
    console.error('Error fetching my projects:', error)
  }
})
</script>

<template>
  <div class="q-pa-md">
    <h5>Minhas Campanhas</h5>
    <div v-if="!isSignedIn">Faça login para ver suas campanhas.</div>
    <q-list v-else bordered>
      <q-item v-for="p in items" :key="p.id">
        <q-item-section>{{ p.title }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
