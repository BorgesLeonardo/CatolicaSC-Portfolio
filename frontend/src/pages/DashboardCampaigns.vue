<template>
  <q-page padding class="bg-surface">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-input v-model="filterQ" dense outlined placeholder="Buscar por título" debounce="400"/>
      </div>
      <div class="col-12 col-md-3">
        <q-select v-model="filterStatus" dense outlined :options="statusOptions" emit-value map-options label="Status"/>
      </div>
      <div class="col-12 col-md-3">
        <ExportCsvButton :filename="'minhas-campanhas'" :rows="tableRows" :columns="csvColumns"/>
      </div>
      <div class="col-12 col-md-3">
        <div class="row items-center q-col-gutter-sm q-mb-xs">
          <div class="col-auto" v-if="connectStatus">
            <q-chip :color="connectStatus.connected ? 'positive' : 'negative'" text-color="white" dense>
              {{ connectStatus.connected ? 'Conectado ao Stripe' : 'Não conectado' }}
            </q-chip>
          </div>
          <div class="col-auto" v-if="connectStatus">
            <q-chip :color="connectStatus.payoutsEnabled ? 'positive' : 'warning'" text-color="white" dense>
              {{ connectStatus.payoutsEnabled ? 'Saques habilitados' : 'Saques pendentes' }}
            </q-chip>
          </div>
        </div>
        <div class="row items-center q-col-gutter-sm">
          <div class="col-auto">
            <q-btn color="primary" label="Habilitar recebimentos" @click="connectOnboard" :disable="connectStatus?.chargesEnabled === true" />
          </div>
          <div class="col-auto">
            <q-btn color="secondary" label="Abrir painel Stripe" @click="openConnectDashboard" :disable="!connectStatus?.connected" />
          </div>
        </div>
      </div>
    </div>

    <q-table
      :rows="tableRows"
      :columns="tableColumns"
      row-key="id"
      :loading="store.campaignsListLoading"
      :pagination="pagination"
      @request="onRequest"
      flat
      dense
    />

    <div class="q-mt-xl">
      <ChartCard type="bar" :labels="topLabels" :series="topValues" title="Top 5 campanhas por arrecadação"/>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import { connectService } from 'src/services'
import ExportCsvButton from 'src/components/dashboard/ExportCsvButton.vue'
import ChartCard from 'src/components/dashboard/ChartCard.vue'
import { useDashboardStore } from 'src/stores/dashboard'
import { useProjectStats } from 'src/composables/useProjectStats'

const { getToken, isSignedIn } = useAuth()
const route = useRoute()
const { updateStatsIfNeeded } = useProjectStats()
const store = useDashboardStore()

const filterQ = ref('')
const filterStatus = ref<string | null>(null)
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Rascunho', value: 'DRAFT' },
  { label: 'Publicado', value: 'PUBLISHED' },
  { label: 'Arquivado', value: 'ARCHIVED' },
]

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const tableColumns = [
  { name: 'title', label: 'Título', field: 'title', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'progress', label: 'Progresso', field: 'progress', align: 'left' },
  { name: 'contributions', label: 'Contribuições', field: 'contributions', align: 'right' },
  { name: 'deadline', label: 'Data fim', field: 'deadline', align: 'left' },
]

const csvColumns = [
  { name: 'title', label: 'Título' },
  { name: 'status', label: 'Status' },
  { name: 'raised', label: 'Arrecadado (BRL)' },
  { name: 'goal', label: 'Meta (BRL)' },
  { name: 'contributions', label: 'Contribuições' },
  { name: 'deadline', label: 'Data fim' },
]

const tableRows = computed(() => {
  const items = store.campaignsList?.items || []
  return items.map(i => ({
    id: i.id,
    title: i.title,
    status: i.status,
    raised: i.raised,
    goal: i.goal,
    progress: `${Math.min(100, Math.floor((i.raised / Math.max(1, i.goal)) * 100))}% (${i.raised.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/${i.goal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
    contributions: i.contributions,
    deadline: new Date(i.deadline).toLocaleDateString('pt-BR')
  }))
})

function normalizeLabel(label: string): string {
  if (!label) return ''
  const firstLine = String(label).split(/\r?\n/)[0]
  const trimmed = firstLine.trim()
  return trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed
}
const topLabels = computed(() => store.campaignsMetrics?.topByRaised.map(t => normalizeLabel(t.title)) || [])
const topValues = computed(() => store.campaignsMetrics?.topByRaised.map(t => t.raised) || [])

const connectStatus = ref<{ connected: boolean; chargesEnabled: boolean; payoutsEnabled: boolean } | null>(null)

async function load() {
  const token = await getToken.value?.()
  setAuthToken(token || null)
  await Promise.all([
    store.fetchCampaignsList({ page: pagination.value.page, pageSize: pagination.value.rowsPerPage, status: filterStatus.value || undefined, q: filterQ.value || undefined }),
    store.fetchCampaignsMetrics(),
  ])
  if (store.campaignsList) pagination.value.rowsNumber = store.campaignsList.total
}

onMounted(async () => {
  await updateStatsIfNeeded()
  if (isSignedIn.value) {
    void load()
    void loadConnectStatus()
  } else {
    const stop = watch(isSignedIn, (signed) => {
      if (signed) {
        void load()
        void loadConnectStatus()
        stop()
      }
    })
  }
})

async function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  await load()
}

watch([filterQ, filterStatus], async () => {
  pagination.value.page = 1
  await load()
})

async function connectOnboard() {
  const returnPath = route.fullPath || '/dashboard/campaigns'
  const { url } = await connectService.onboard(returnPath)
  try { sessionStorage.setItem('connect_return_path', returnPath) } catch (_err) { if (import.meta.env.DEV) console.debug(_err) }
  window.location.assign(url)
}

async function openConnectDashboard() {
  const { url } = await connectService.dashboardLink()
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function loadConnectStatus() {
  const token = await getToken.value?.()
  setAuthToken(token || null)
  try {
    const res = await connectService.status()
    connectStatus.value = res
  } catch {
    connectStatus.value = { connected: false, chargesEnabled: false, payoutsEnabled: false }
  }
}
</script>

<style scoped>
/* Dark-mode contrast improvements for dashboard tables */
[data-theme='dark'] .q-table thead th { color: #e5e7eb; }
[data-theme='dark'] .q-table tbody td { color: #cbd5e1; }
[data-theme='dark'] .q-input .q-field__native, 
[data-theme='dark'] .q-select .q-field__native { color: #e5e7eb; }
[data-theme='dark'] .q-input .q-field__label, 
[data-theme='dark'] .q-select .q-field__label { color: #cbd5e1; }
</style>
