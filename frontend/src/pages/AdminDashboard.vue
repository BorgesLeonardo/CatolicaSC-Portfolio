<template>
  <q-page class="dashboard-page">
    <!-- Dashboard Header -->
    <section class="dashboard-header q-py-lg bg-gradient-to-r">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title fade-in-up">
              Dashboard
            </h1>
            <p class="page-subtitle fade-in-up stagger-animation">
              Painel administrativo completo com métricas, análises e controles avançados
            </p>
          </div>
          <div class="header-actions fade-in-up stagger-animation">
            <q-btn 
              unelevated
              color="primary"
              icon="refresh"
              label="Atualizar Dados"
              @click="refreshData"
              :loading="refreshing"
              class="action-btn"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Dashboard Content -->
    <section class="dashboard-content q-py-xl">
      <div class="container">
        <!-- Stats Overview -->
        <div class="stats-section q-mb-xl">
          <h2 class="section-title q-mb-lg">Visão Geral</h2>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3"><KpiCard label="Total apoiado" :value="metrics?.totalSupportedBRL" format="currency" icon="volunteer_activism" icon-color="primary"/></div>
            <div class="col-12 col-sm-6 col-md-3"><KpiCard label="Arrecadado nas minhas campanhas" :value="metrics?.totalRaisedOnMyCampaignsBRL" format="currency" icon="savings" icon-color="primary"/></div>
            <div class="col-12 col-sm-6 col-md-3"><KpiCard label="Campanhas ativas" :value="metrics?.activeCampaigns" format="int" icon="campaign" icon-color="primary"/></div>
            <div class="col-12 col-sm-6 col-md-3"><KpiCard label="Taxa de sucesso" :value="metrics?.successRatePct" format="percent" icon="trending_up" icon-color="primary"/></div>
          </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <DynamicCard
            variant="primary"
            size="lg"
            :elevated="true"
            :animated="true"
            title="Contribuições por mês"
            subtitle="Últimos 12 meses em BRL"
            icon="bar_chart"
            icon-color="primary"
            class="analytics-card"
          >
            <ChartCard type="bar" :labels="tsBarLabels" :series="tsValues" title="" :currency="true"/>
            <div class="q-mt-sm text-caption text-grey-7">Média mensal: {{ avgMonthlyFormatted }}</div>
          </DynamicCard>

          <DynamicCard
            variant="secondary"
            size="lg"
            :elevated="true"
            :animated="true"
            title="Minhas campanhas por categoria"
            subtitle="Distribuição por categoria"
            icon="pie_chart"
            icon-color="secondary"
            class="users-card"
          >
            <ChartCard type="pie" :labels="catLabels" :series="catValues" title="" :currency="true" :show-legend="true"/>
          </DynamicCard>

          <!-- System Status Card -->
          

          <!-- Quick Actions Card -->
          
        </div>
        <!-- My Campaigns Table -->
        <div class="q-mt-xl">
          <h2 class="section-title q-mb-lg">Minhas Campanhas</h2>
          <DynamicCard variant="default" size="lg" :elevated="true" :animated="true">
            <div class="q-pa-md">
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
            </div>
          </DynamicCard>

          <div class="q-mt-lg">
            <DynamicCard variant="primary" size="lg" :elevated="true" :animated="true" title="Top 5 campanhas por arrecadação" icon="leaderboard" icon-color="primary">
              <ChartCard type="bar" :labels="topLabels" :series="topValues" title="" :currency="true"/>
            </DynamicCard>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import DynamicCard from 'src/components/DynamicCard.vue'
import KpiCard from 'src/components/dashboard/KpiCard.vue'
import ChartCard from 'src/components/dashboard/ChartCard.vue'
import { useDashboardStore } from 'src/stores/dashboard'
import ExportCsvButton from 'src/components/dashboard/ExportCsvButton.vue'

const refreshing = ref(false)
const { getToken, isSignedIn } = useAuth()
const store = useDashboardStore()

const metrics = computed(() => store.metrics)
const tsBarLabels = computed(() => store.timeseries.map(p => {
  // Expecting period as YYYY-MM
  const [year, month] = p.period.split('-').map(s => parseInt(s, 10))
  if (!year || !month) return p.period
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}))
const tsValues = computed(() => store.timeseries.map(p => p.amount))
const catLabels = computed(() => store.campaignsMetrics?.byCategory.map(c => c.category) || [])
const catValues = computed(() => store.campaignsMetrics?.byCategory.map(c => c.raised) || [])
const topLabels = computed(() => store.campaignsMetrics?.topByRaised.map(t => t.title) || [])
const topValues = computed(() => store.campaignsMetrics?.topByRaised.map(t => t.raised) || [])

// Table state
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
    progress: `${Math.min(100, Math.floor((i.raised / Math.max(1, i.goal)) * 100))}% (${i.raised.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/${i.goal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
    contributions: i.contributions,
    deadline: new Date(i.deadline).toLocaleDateString('pt-BR')
  }))
})

async function refreshData() {
  if (!isSignedIn.value) return
  refreshing.value = true
  const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
  setAuthToken(token || null)
  await Promise.all([
    store.fetchMetrics(),
    store.fetchTimeseries(),
    store.fetchCampaignsMetrics(),
    store.fetchCampaignsList({ page: pagination.value.page, pageSize: pagination.value.rowsPerPage, status: filterStatus.value || undefined, q: filterQ.value || undefined }),
  ])
  if (store.campaignsList) pagination.value.rowsNumber = store.campaignsList.total
  refreshing.value = false
}

onMounted(() => { void refreshData() })

async function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
  setAuthToken(token || null)
  await store.fetchCampaignsList({ page: pagination.value.page, pageSize: pagination.value.rowsPerPage, status: filterStatus.value || undefined, q: filterQ.value || undefined })
  if (store.campaignsList) pagination.value.rowsNumber = store.campaignsList.total
}

watch([filterQ, filterStatus], async () => {
  pagination.value.page = 1
  const token = await (typeof getToken === 'function' ? getToken() : getToken.value?.())
  setAuthToken(token || null)
  await store.fetchCampaignsList({ page: 1, pageSize: pagination.value.rowsPerPage, status: filterStatus.value || undefined, q: filterQ.value || undefined })
  if (store.campaignsList) pagination.value.rowsNumber = store.campaignsList.total
})

const avgMonthlyFormatted = computed(() => {
  const values = tsValues.value
  if (!values.length) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avg)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

// === HEADER SECTION ===
.dashboard-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #f97316 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dashboard-pattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dashboard-pattern)"/></svg>') repeat;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
}

.page-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 16px 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
}

// === DASHBOARD GRID ===
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

// === CARD SPECIFIC STYLES ===
.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: rgba(30, 64, 175, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(30, 64, 175, 0.2);
}

.chart-text {
  margin-top: 16px;
  color: #64748b;
  font-weight: 500;
}

.analytics-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.metric-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 4px;
}

// Users Card
.users-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

// System Card
.system-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-indicators {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &--online {
    background: #1e40af;
  }
  
  &--warning {
    background: #f59e0b;
  }
  
  &--error {
    background: #ef4444;
  }
}

.system-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-row {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  gap: 12px;
  align-items: center;
  font-size: 0.875rem;
}

// Actions Card
.actions-content {
  display: flex;
  flex-direction: column;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// Activity Section
.activity-content {
  max-height: 400px;
  overflow-y: auto;
}

// === ANIMATIONS ===
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.stagger-animation {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-metrics {
    grid-template-columns: 1fr;
  }
  
  .metric-row {
    grid-template-columns: 80px 1fr 50px;
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 32px 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .dashboard-grid {
    gap: 20px;
  }
}
</style>
