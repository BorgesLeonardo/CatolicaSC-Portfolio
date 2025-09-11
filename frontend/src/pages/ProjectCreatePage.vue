<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-lg-8">
        <q-card class="rounded-borders">
          <q-card-section>
            <div class="text-center q-mb-lg">
              <h1 class="text-h4 text-weight-700 q-mb-sm">
                Criar Nova Campanha
              </h1>
              <p class="text-body1 text-grey-7">
                Preencha as informações abaixo para criar sua campanha
              </p>
            </div>

            <q-stepper
              v-model="step"
              ref="stepper"
              color="primary"
              animated
              flat
              class="no-shadow"
            >
              <!-- Step 1: Basic Info -->
              <q-step
                :name="1"
                title="Informações Básicas"
                icon="info"
                :done="step > 1"
              >
                <q-form @submit="nextStep" class="q-gutter-md">
                  <q-input
                    v-model="form.name"
                    label="Nome da campanha *"
                    outlined
                    :rules="[val => !!val || 'Nome é obrigatório']"
                    hint="Escolha um nome claro e atrativo"
                  />

                  <q-input
                    v-model="form.description"
                    label="Descrição *"
                    type="textarea"
                    outlined
                    rows="4"
                    :rules="[val => !!val || 'Descrição é obrigatória']"
                    hint="Descreva sua campanha de forma detalhada"
                  />

                  <q-input
                    v-model="form.ownerName"
                    label="Seu nome *"
                    outlined
                    :rules="[val => !!val || 'Nome é obrigatório']"
                    hint="Como você gostaria de ser identificado"
                  />
                </q-form>
              </q-step>

              <!-- Step 2: Goal & Deadline -->
              <q-step
                :name="2"
                title="Meta & Prazo"
                icon="flag"
                :done="step > 2"
              >
                <q-form @submit="nextStep" class="q-gutter-md">
                  <q-input
                    v-model.number="form.goal"
                    label="Meta de arrecadação (R$) *"
                    type="number"
                    outlined
                    :rules="[val => val > 0 || 'Meta deve ser maior que zero']"
                    hint="Valor em reais que você deseja arrecadar"
                  />

                  <q-input
                    v-model="form.endsAt"
                    label="Data de término *"
                    type="date"
                    outlined
                    :rules="[val => !!val || 'Data é obrigatória']"
                    hint="Quando sua campanha deve terminar"
                  />
                </q-form>
              </q-step>

              <!-- Step 3: Media -->
              <q-step
                :name="3"
                title="Mídia"
                icon="image"
                :done="step > 3"
              >
                <q-form @submit="nextStep" class="q-gutter-md">
                  <q-file
                    v-model="form.imageFile"
                    label="Imagem da campanha"
                    outlined
                    accept="image/*"
                    max-file-size="5242880"
                    @rejected="onFileRejected"
                  >
                    <template #hint>
                      Imagem opcional (máximo 5MB)
                    </template>
                  </q-file>

                  <div v-if="form.imageFile" class="q-mt-md">
                    <q-img
                      :src="imagePreview"
                      style="max-width: 300px; max-height: 200px"
                      class="rounded-borders"
                    />
                  </div>
                </q-form>
              </q-step>

              <!-- Step 4: Review -->
              <q-step
                :name="4"
                title="Revisão"
                icon="preview"
              >
                <div class="q-gutter-md">
                  <h3 class="text-h6 text-weight-600">Revise suas informações:</h3>
                  
                  <q-card flat bordered class="q-pa-md">
                    <div class="row q-gutter-md">
                      <div v-if="imagePreview" class="col-12 col-md-4">
                        <q-img
                          :src="imagePreview"
                          class="rounded-borders"
                          style="width: 100%; height: 150px"
                        />
                      </div>
                      <div class="col">
                        <h4 class="text-h6 text-weight-600 q-mb-sm">
                          {{ form.name }}
                        </h4>
                        <p class="text-body2 text-grey-7 q-mb-sm">
                          por {{ form.ownerName }}
                        </p>
                        <p class="text-body2 q-mb-sm">
                          {{ form.description }}
                        </p>
                        <div class="row q-gutter-md">
                          <div class="text-body2">
                            <strong>Meta:</strong> R$ {{ formatMoney(form.goal) }}
                          </div>
                          <div class="text-body2">
                            <strong>Término:</strong> {{ formatDate(form.endsAt) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
              </q-step>

              <!-- Stepper Actions -->
              <template #navigation>
                <q-stepper-navigation>
                  <q-btn
                    v-if="step > 1"
                    flat
                    color="primary"
                    label="Voltar"
                    @click="previousStep"
                    class="q-mr-sm"
                  />
                  <q-btn
                    v-if="step < 4"
                    color="primary"
                    :label="step === 3 ? 'Revisar' : 'Continuar'"
                    @click="nextStep"
                    :loading="loading"
                  />
                  <q-btn
                    v-else
                    color="primary"
                    label="Criar Campanha"
                    @click="createProject"
                    :loading="loading"
                  />
                </q-stepper-navigation>
              </template>
            </q-stepper>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useProjectsStore } from '../stores/useProjectsStore'

const router = useRouter()
const $q = useQuasar()
const projectsStore = useProjectsStore()

const step = ref(1)
const loading = ref(false)

const form = ref({
  name: '',
  description: '',
  ownerName: '',
  goal: 0,
  endsAt: '',
  imageFile: null as File | null,
})

const imagePreview = computed(() => {
  if (form.value.imageFile) {
    return URL.createObjectURL(form.value.imageFile)
  }
  return null
})

const nextStep = () => {
  if (step.value < 4) {
    step.value++
  }
}

const previousStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const onFileRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'Arquivo muito grande. Máximo 5MB.',
  })
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const createProject = async () => {
  loading.value = true
  
  try {
    const projectData = {
      name: form.value.name,
      description: form.value.description,
      ownerName: form.value.ownerName,
      goal: form.value.goal * 100, // Convert to cents
      endsAt: form.value.endsAt,
    }

    const project = await projectsStore.create(projectData)
    
    $q.notify({
      type: 'positive',
      message: 'Campanha criada com sucesso!',
    })

    await router.push(`/projects/${project.id}`)
  } catch (error) {
    console.error('Erro ao criar campanha:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao criar campanha. Tente novamente.',
    })
  } finally {
    loading.value = false
  }
}
</script>
