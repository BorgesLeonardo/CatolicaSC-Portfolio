<!-- src/pages/ProjectDetail.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { http } from 'src/utils/http'
import { formatMoneyBRL, formatDateTimeBR, isPast } from 'src/utils/format'
import ContributeDialog from 'src/components/ContributeDialog.vue'
import CommentsSection from 'src/components/CommentsSection.vue'
import type { Project } from 'src/components/models'

const route = useRoute()
const id = String(route.params.id)

const project = ref<Project | null>(null)
const loading = ref(false)
const dialogRef = ref<InstanceType<typeof ContributeDialog> | null>(null)

async function fetchProject() {
  loading.value = true
  try {
    const { data } = await http.get<Project>(`/api/projects/${id}`)
    project.value = data
  } catch {
    project.value = null
  } finally {
    loading.value = false
  }
}

function openContrib() {
  dialogRef.value?.show()
}

onMounted(fetchProject)
</script>

<template>
  <div class="q-pa-md">
    <q-inner-loading :showing="loading"><q-spinner /></q-inner-loading>

    <div v-if="!project && !loading" class="text-grey-7">Campanha não encontrada.</div>

    <div v-else-if="project" class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <q-card bordered>
          <q-img v-if="project.imageUrl" :src="project.imageUrl" ratio="16/9" />
          <q-card-section>
            <div class="text-h5 q-mb-xs">{{ project.title }}</div>
            <div class="text-caption text-grey-7">
              Meta: {{ formatMoneyBRL(project.goalCents) }} •
              Limite: {{ formatDateTimeBR(project.deadline) }}
              <q-badge :color="isPast(project.deadline) ? 'grey-7' : 'positive'" class="q-ml-sm">
                {{ isPast(project.deadline) ? 'Encerrada' : 'Ativa' }}
              </q-badge>
            </div>
            <div class="q-mt-md">{{ project.description }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="Contribuir"
              :disable="isPast(project.deadline)"
              @click="openContrib"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle1">Informações</div>
            <div class="text-caption">ID: {{ project.id }}</div>
            <div class="text-caption">Owner: {{ project.ownerId }}</div>
            <div class="text-caption">Criado em: {{ formatDateTimeBR(project.createdAt) }}</div>
          </q-card-section>
        </q-card>

        <CommentsSection
          class="q-mt-md"
          :project-id="project.id"
          :project-owner-id="project.ownerId"
        />
      </div>
    </div>

    <ContributeDialog ref="dialogRef" :project-id="id" />
  </div>
</template>
