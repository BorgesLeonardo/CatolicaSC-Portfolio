<template>
  <q-page class="flex flex-center q-pa-xl">
    <div class="column items-center q-gutter-md">
      <q-icon name="check_circle" color="positive" size="64px" />
      <div class="text-h5">Assinatura confirmada!</div>
      <div class="text-subtitle2 text-grey-7">Atualizando estatísticas e redirecionando...</div>
      <q-btn color="primary" label="Ir ao Dashboard" @click="goDashboard" :loading="loading" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStats } from 'src/composables/useProjectStats'

const router = useRouter()
const { forceUpdateStats } = useProjectStats()
const loading = ref(false)

async function goDashboard() {
  loading.value = true
  try {
    await forceUpdateStats()
  } finally {
    void router.replace('/dashboard')
  }
}

onMounted(() => { void goDashboard() })
</script>









