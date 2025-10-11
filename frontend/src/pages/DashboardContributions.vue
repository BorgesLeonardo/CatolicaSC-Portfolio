<template>
  <q-page padding class="bg-surface">
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-input v-model="filterQ" dense outlined placeholder="Buscar campanha" debounce="400"/>
      </div>
      <div class="col-12 col-md-3">
        <q-select v-model="filterStatus" dense outlined :options="statusOptions" emit-value map-options label="Status"/>
      </div>
      <div class="col-12 col-md-3">
        <ExportCsvButton :filename="'minhas-contribuicoes'" :rows="tableRows" :columns="csvColumns"/>
      </div>
    </div>

    <q-table
      :rows="tableRows"
      :columns="tableColumns"
      row-key="id"
      :loading="store.myContributionsLoading"
      :pagination="pagination"
      @request="onRequest"
      flat
      dense
    />

    <div class="q-mt-xl">
      <ChartCard type="line" :labels="tsLabels" :series="tsValues" title="Contribuições por mês"/>
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
import { useProjectStats } from 'src/composables/useProjectStats'

const { getToken, isSignedIn } = useAuth()
const { updateStatsIfNeeded } = useProjectStats()
const store = useDashboardStore()

const filterQ = ref('')
const filterStatus = ref<string | null>(null)
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Sucesso', value: 'SUCCEEDED' },
  { label: 'Falhou', value: 'FAILED' },
  { label: 'Reembolsado', value: 'REFUNDED' },
]

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const tableColumns = [
  { name: 'projectTitle', label: 'Campanha', field: 'projectTitle', align: 'left' },
  { name: 'amount', label: 'Valor', field: 'amount', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'createdAt', label: 'Data', field: 'createdAt', align: 'left' },
]

const csvColumns = [
  { name: 'projectTitle', label: 'Campanha' },
  { name: 'amount', label: 'Valor (BRL)' },
  { name: 'status', label: 'Status' },
  { name: 'createdAt', label: 'Data' },
]

const tableRows = computed(() => {
  const items = store.myContributions?.items || []
  return items.map(i => ({
    id: i.id,
    projectTitle: i.projectTitle,
    amount: i.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    status: i.status,
    createdAt: new Date(i.createdAt).toLocaleDateString('pt-BR')
  }))
})

const tsLabels = computed(() => store.timeseries.map(p => p.period))
const tsValues = computed(() => store.timeseries.map(p => p.amount))

async function load() {
  const token = await getToken.value?.()
  setAuthToken(token || null)
  await Promise.all([
    store.fetchMyContributions({ page: pagination.value.page, pageSize: pagination.value.rowsPerPage, status: filterStatus.value || undefined }),
    store.fetchTimeseries(),
  ])
  if (store.myContributions) pagination.value.rowsNumber = store.myContributions.total
}

onMounted(async () => {
  await updateStatsIfNeeded()
  if (isSignedIn.value) {
    void load()
  } else {
    const stop = watch(isSignedIn, (signed) => {
      if (signed) {
        void load()
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
</script>



