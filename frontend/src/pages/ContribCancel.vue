<template>
  <q-page class="flex flex-center q-pa-xl">
    <div class="column items-center q-gutter-md">
      <q-icon name="cancel" color="negative" size="64px" />
      <div class="text-h5">Contribuição cancelada</div>
      <div class="text-subtitle2 text-grey-7">Você pode tentar novamente quando quiser.</div>
      <q-btn color="primary" label="Voltar ao projeto" @click="goBack" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  // Se tivermos guardado o último projeto em sessionStorage, usar
  const lastProjectId = sessionStorage.getItem('last_contrib_project_id')
  if (lastProjectId) {
    void router.replace(`/projects/${lastProjectId}`)
  } else {
    void router.replace('/projects')
  }
}
</script>


