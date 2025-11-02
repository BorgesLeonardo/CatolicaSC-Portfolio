<template>
  <q-page class="bg-surface q-py-xl">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h2 class="section-title">Minhas Assinaturas</h2>
          <div class="text-subtitle2 text-muted">Gerencie suas assinaturas recorrentes</div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" flat icon="refresh" label="Atualizar" :loading="loading" @click="reload" />
        </div>
      </div>

      <DynamicCard variant="default" size="lg" :elevated="true" :animated="true">
        <div class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-input v-model="q" dense outlined clearable placeholder="Buscar por campanha" :aria-label="'Buscar assinatura por título'" />
            </div>
            <div class="col-6 col-md-3">
              <q-select v-model="statusFilter" :options="statusOptions" emit-value map-options dense outlined label="Status" />
            </div>
            <div class="col-6 col-md-3">
              <q-select v-model="intervalFilter" :options="intervalOptions" emit-value map-options dense outlined label="Intervalo" />
            </div>
          </div>

          <div v-if="loading" class="q-gutter-sm" role="status" aria-live="polite">
            <q-skeleton type="text" width="40%" />
            <q-skeleton type="rect" height="54px" />
            <q-skeleton type="rect" height="54px" />
            <q-skeleton type="rect" height="54px" />
          </div>

          <div v-else>
            <div v-if="!filteredItems.length" class="empty-state column items-center q-py-xl">
              <q-icon name="autorenew" size="56px" color="grey-5" class="q-mb-sm" />
              <div class="text-h6 q-mb-xs">Nenhuma assinatura encontrada</div>
              <div class="text-caption text-muted q-mb-md">Ajuste os filtros ou explore campanhas para assinar.</div>
              <q-btn color="primary" label="Explorar campanhas" to="/projects" />
            </div>

            <q-list v-else separator bordered>
              <q-item v-for="s in pageItems" :key="s.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar icon="subscriptions" color="primary" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ s.projectTitle }}</q-item-label>
                  <q-item-label caption>
                    {{ s.priceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }} / {{ s.interval === 'YEAR' ? 'ano' : 'mês' }} · Início: {{ formatDate(s.createdAt) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-chip :color="statusColor(s.status)" text-color="white" dense>{{ statusLabel(s.status) }}</q-chip>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn dense size="sm" outline color="primary" icon="open_in_new" label="Ver campanha" :to="`/projects/${s.projectId}`" />
                    <q-separator vertical spaced class="lt-md" />

                    <q-btn-dropdown
                      dense
                      size="sm"
                      color="negative"
                      unelevated
                      :disable="!s.cancelable"
                      :loading="isLoading(s.id)"
                      label="Cancelar"
                      icon="do_not_disturb_on"
                      dropdown-icon="arrow_drop_down"
                    >
                      <q-list dense>
                        <q-item clickable v-close-popup @click="confirmCancel(s.id, false, s.projectTitle)" :disable="isLoading(s.id)">
                          <q-item-section avatar>
                            <q-icon name="cancel" color="negative" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>Cancelar agora</q-item-label>
                            <q-item-label caption>Interrompe cobranças imediatamente</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="confirmCancel(s.id, true, s.projectTitle)" :disable="isLoading(s.id)">
                          <q-item-section avatar>
                            <q-icon name="schedule" color="warning" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>Cancelar ao fim do período</q-item-label>
                            <q-item-label caption>Mantém acesso até o fim do ciclo</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-md row justify-end" v-if="maxPage > 1">
              <q-pagination v-model="page" :max="maxPage" boundary-numbers direction-links @update:model-value="onPageChange" />
            </div>
          </div>
        </div>
      </DynamicCard>
    </div>

    <q-dialog v-model="confirmOpen">
      <q-card>
        <q-card-section class="text-h6">Confirmar cancelamento</q-card-section>
        <q-card-section>
          Tem certeza que deseja {{ cancelAtEnd ? 'agendar o cancelamento para o fim do período' : 'cancelar imediatamente' }}
          <span v-if="pendingTitle">da assinatura de <strong>{{ pendingTitle }}</strong></span>?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Voltar" v-close-popup />
          <q-btn color="negative" :loading="confirmLoading" label="Confirmar" @click="doCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import DynamicCard from 'src/components/DynamicCard.vue'
import { subscriptionsService, type MySubscriptionItem } from 'src/services'
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import { Notify } from 'quasar'

const { getToken, isSignedIn } = useAuth()

const items = ref<MySubscriptionItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// Filters
const q = ref('')
const statusFilter = ref<'ALL' | MySubscriptionItem['status']>('ALL')
const intervalFilter = ref<'ALL' | 'MONTH' | 'YEAR'>('ALL')
const statusOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Em atraso', value: 'PAST_DUE' },
  { label: 'Cancelados', value: 'CANCELED' },
]
const intervalOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Mensal', value: 'MONTH' },
  { label: 'Anual', value: 'YEAR' },
]

const confirmOpen = ref(false)
const confirmLoading = ref(false)
const pendingId = ref<string | null>(null)
const pendingTitle = ref<string>('')
const cancelAtEnd = ref(false)
const loadingNowId = ref<string | null>(null)
const loadingEndId = ref<string | null>(null)

function statusColor(status: MySubscriptionItem['status']): string {
  if (status === 'ACTIVE') return 'positive'
  if (status === 'PAST_DUE') return 'warning'
  if (status === 'CANCELED') return 'negative'
  return 'grey'
}

function statusLabel(status: MySubscriptionItem['status']): string {
  if (status === 'ACTIVE') return 'ATIVA'
  if (status === 'PAST_DUE') return 'EM ATRASO'
  if (status === 'CANCELED') return 'CANCELADA'
  return 'INCOMPLETA'
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('pt-BR') } catch { return iso }
}

async function reload() {
  loading.value = true
  try {
    const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
    setAuthToken(token || null)
    const res = await subscriptionsService.listMine(page.value, pageSize.value)
    items.value = res.items
    total.value = res.total
  } catch {
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const normalizedQ = computed(() => q.value.trim().toLowerCase())
const filteredItems = computed(() => {
  let arr = items.value.slice()
  if (statusFilter.value !== 'ALL') arr = arr.filter(i => i.status === statusFilter.value)
  if (intervalFilter.value !== 'ALL') arr = arr.filter(i => i.interval === intervalFilter.value)
  if (normalizedQ.value) arr = arr.filter(i => i.projectTitle.toLowerCase().includes(normalizedQ.value))
  return arr
})

const maxPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const pageItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
})

function onPageChange() {
  // no-op: computed pageItems reacts automatically
}

function confirmCancel(id: string, atEnd: boolean, title?: string) {
  pendingId.value = id
  cancelAtEnd.value = atEnd
  pendingTitle.value = title || ''
  confirmOpen.value = true
}

async function doCancel() {
  if (!pendingId.value) return
  confirmLoading.value = true
  try {
    if (cancelAtEnd.value) {
      loadingEndId.value = pendingId.value
    } else {
      loadingNowId.value = pendingId.value
    }
    await subscriptionsService.cancel(pendingId.value, cancelAtEnd.value)
    Notify.create({ type: 'positive', message: cancelAtEnd.value ? 'Cancelamento agendado' : 'Assinatura cancelada' })
    confirmOpen.value = false
    await reload()
  } catch {
    Notify.create({ type: 'negative', message: 'Falha ao cancelar.' })
  } finally {
    confirmLoading.value = false
    loadingNowId.value = null
    loadingEndId.value = null
  }
}

function isLoading(id: string): boolean {
  return loadingNowId.value === id || loadingEndId.value === id
}

onMounted(async () => {
  if (!isSignedIn.value) return
  await reload()
})

watch([q, statusFilter, intervalFilter], () => { page.value = 1 })
</script>

<style scoped>
.section-title { margin: 0; }
.empty-state { text-align: center; }
</style>


