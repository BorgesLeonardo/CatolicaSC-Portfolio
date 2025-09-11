<!-- src/components/ContributeDialog.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@clerk/vue'
import { http } from 'src/utils/http'
import { Notify } from 'quasar'
import { reaisToCents } from 'src/utils/money'
import type { CheckoutResponse } from 'src/components/models'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{ (e: 'hide'): void }>()
const open = ref(false)
const amountReais = ref('')
const loading = ref(false)

const { isSignedIn, getToken } = useAuth()

function show() { open.value = true }
function hide() { open.value = false; emit('hide') }

async function submit() {
  if (!isSignedIn.value) {
    Notify.create({ type: 'warning', message: 'Entre para contribuir.' })
    return
  }
  const amountCents = reaisToCents(amountReais.value)
  if (!amountCents || amountCents < 100) {
    Notify.create({ type: 'warning', message: 'Valor mínimo: R$ 1,00' })
    return
  }
  loading.value = true
  try {
    const token = await getToken.value?.()
    const { data } = await http.post<CheckoutResponse>('/api/contributions/checkout', {
      projectId: props.projectId,
      amountCents
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl
    } else {
      Notify.create({ type: 'negative', message: 'Falha ao iniciar checkout.' })
    }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string }; status?: number } }
    const code = error?.response?.data?.error
    if (code === 'ProjectClosed') {
      Notify.create({ type: 'negative', message: 'Campanha encerrada.' })
    } else if (error?.response?.status === 401) {
      Notify.create({ type: 'warning', message: 'Sessão expirada. Entre novamente.' })
    } else if (error?.response?.status === 404) {
      Notify.create({ type: 'negative', message: 'Campanha não encontrada.' })
    } else {
      Notify.create({ type: 'negative', message: 'Erro ao iniciar contribuição.' })
      console.error(err)
    }
  } finally {
    loading.value = false
  }
}

defineExpose({ show, hide })
</script>

<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 360px">
      <q-card-section class="text-h6">Contribuir com a campanha</q-card-section>
      <q-card-section>
        <q-input v-model="amountReais" label="Valor (R$)" inputmode="decimal" dense filled />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="hide" />
        <q-btn color="primary" :loading="loading" label="Continuar" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
