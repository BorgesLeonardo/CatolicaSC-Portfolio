<template>
  <q-page class="flex flex-center q-pa-xl">
    <div class="column items-center q-gutter-md">
      <q-spinner size="48px" color="primary" />
      <div class="text-h6">Finalizando sua configuração de recebimentos…</div>
      <div class="text-subtitle2 text-grey-7">Verificando status e redirecionando</div>
      <q-btn color="primary" label="Ir ao Dashboard agora" :loading="loading" @click="go" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import { connectService } from 'src/services'

const router = useRouter()
const route = useRoute()
const { getToken } = useAuth()
const loading = ref(false)

async function go() {
  loading.value = true
    try {
    const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
    setAuthToken(token || null)
    try {
      await connectService.status()
    } catch (_err) {
      if (import.meta.env.DEV) console.debug(_err)
    }

    // Prefer redirect query param, then saved path, then dashboard
    const qRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    let target = qRedirect || '/projects/new'
    try {
      const saved = sessionStorage.getItem('connect_return_path')
      if (!qRedirect && saved) target = saved
    } catch (_err) {
      if (import.meta.env.DEV) console.debug(_err)
    }
    try { sessionStorage.removeItem('connect_return_path') } catch (_err) { if (import.meta.env.DEV) console.debug(_err) }

    if (router.currentRoute.value.fullPath !== target) {
      await router.replace(target)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => { void go() })
</script>


