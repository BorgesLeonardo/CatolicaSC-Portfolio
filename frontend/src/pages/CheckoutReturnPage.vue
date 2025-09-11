<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="row full-width">
      <div class="col-12 col-md-6 col-lg-4 offset-md-3 offset-lg-4">
        <q-card class="rounded-borders text-center">
          <q-card-section class="q-pa-xl">
            <div v-if="isSuccess" class="q-mb-lg">
              <q-icon
                name="check_circle"
                size="4rem"
                color="positive"
                class="q-mb-md"
              />
              <h1 class="text-h4 text-weight-700 q-mb-sm text-positive">
                Contribuição realizada!
              </h1>
              <p class="text-body1 text-grey-7">
                Obrigado por sua contribuição! Sua doação foi processada com sucesso.
              </p>
            </div>

            <div v-else class="q-mb-lg">
              <q-icon
                name="cancel"
                size="4rem"
                color="negative"
                class="q-mb-md"
              />
              <h1 class="text-h4 text-weight-700 q-mb-sm text-negative">
                Contribuição cancelada
              </h1>
              <p class="text-body1 text-grey-7">
                Sua contribuição foi cancelada. Você pode tentar novamente a qualquer momento.
              </p>
            </div>

            <div class="q-gutter-md">
              <q-btn
                color="primary"
                :label="isSuccess ? 'Ver campanha' : 'Tentar novamente'"
                :to="isSuccess ? `/projects/${projectId}` : '/projects'"
                size="lg"
                class="q-px-xl"
              />
              <q-btn
                flat
                color="primary"
                label="Voltar ao início"
                to="/"
                size="lg"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isSuccess = computed(() => {
  return route.path.includes('/success')
})

const projectId = computed(() => {
  return route.query.projectId as string
})
</script>
