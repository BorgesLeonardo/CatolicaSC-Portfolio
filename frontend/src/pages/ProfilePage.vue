<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card class="rounded-borders">
          <q-card-section>
            <h1 class="text-h4 text-weight-700 q-mb-md">
              Meu Perfil
            </h1>
            
            <div v-if="user" class="q-gutter-md">
              <q-input
                :model-value="user.firstName"
                label="Nome"
                outlined
                readonly
              />
              <q-input
                :model-value="user.lastName"
                label="Sobrenome"
                outlined
                readonly
              />
              <q-input
                :model-value="user.emailAddresses[0]?.emailAddress"
                label="E-mail"
                outlined
                readonly
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="rounded-borders">
          <q-card-section>
            <h2 class="text-h6 text-weight-600 q-mb-md">
              Estatísticas
            </h2>
            
            <div class="q-gutter-md">
              <div class="text-center">
                <div class="text-h4 text-weight-700 text-primary">
                  {{ ownedProjects.length }}
                </div>
                <div class="text-caption text-grey-7">
                  Campanhas criadas
                </div>
              </div>
              
              <div class="text-center">
                <div class="text-h4 text-weight-700 text-primary">
                  {{ supportingProjects.length }}
                </div>
                <div class="text-caption text-grey-7">
                  Campanhas apoiadas
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClerk } from '@clerk/vue'
import { useProjectsStore } from '../stores/useProjectsStore'

const { user } = useClerk()
const projectsStore = useProjectsStore()

const ownedProjects = computed(() => projectsStore.owned)
const supportingProjects = computed(() => projectsStore.collaborating)

onMounted(async () => {
  try {
    await projectsStore.fetch()
  } catch (error) {
    console.error('Erro ao carregar projetos:', error)
  }
})
</script>
