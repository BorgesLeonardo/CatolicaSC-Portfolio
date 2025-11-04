<template>
  <q-page class="flex flex-center q-pa-xl">
    <div class="column items-center q-gutter-md">
      <q-spinner size="48px" color="primary" />
      <div class="text-h6">Retomando configuração de recebimentos…</div>
      <div class="text-subtitle2 text-grey-7">Aguarde, você será redirecionado ao Stripe</div>
      <q-btn color="primary" label="Continuar no Stripe" :loading="loading" @click="go" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import { connectService } from 'src/services'

const { getToken } = useAuth()
const loading = ref(false)

async function go() {
  loading.value = true
  try {
    const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
    setAuthToken(token || null)
    const { url } = await connectService.onboard('/projects/new')
    window.location.assign(url)
  } finally {
    loading.value = false
  }
}

onMounted(() => { void go() })
</script>


