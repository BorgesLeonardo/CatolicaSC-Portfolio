<template>
  <q-page padding>
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
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import ExportCsvButton from 'src/components/dashboard/ExportCsvButton.vue'
import ChartCard from 'src/components/dashboard/ChartCard.vue'
import { useDashboardStore } from 'src/stores/dashboard'

const { getToken } = useAuth()
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

const topLabels = computed(() => store.campaignsMetrics?.topByRaised.map(t => t.title) || [])
const topValues = computed(() => store.campaignsMetrics?.topByRaised.map(t => t.raised) || [])

async function load() {
  const token = await getToken.value?.()
  setAuthToken(token || null)
  await Promise.all([
    store.fetchCampaignsList({ page: pagination.value.page, pageSize: pagination.value.rowsPerPage, status: filterStatus.value || undefined, q: filterQ.value || undefined }),
    store.fetchCampaignsMetrics(),
  ])
  if (store.campaignsList) pagination.value.rowsNumber = store.campaignsList.total
}

onMounted(() => { void load() })

async function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  await load()
}

watch([filterQ, filterStatus], async () => {
  pagination.value.page = 1
  await load()
})
</script>



