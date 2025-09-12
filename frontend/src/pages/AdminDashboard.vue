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
          <LiveStats 
            :stats="dashboardStats"
            :animated="true"
            layout="grid"
            :columns="4"
          />
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Analytics Card -->
          <DynamicCard
            variant="primary"
            size="lg"
            :elevated="true"
            :animated="true"
            title="Analytics Avançadas"
            subtitle="Métricas detalhadas de performance"
            icon="analytics"
            icon-color="primary"
            class="analytics-card"
          >
            <div class="analytics-content">
              <div class="chart-placeholder">
                <q-icon name="show_chart" size="4xl" color="grey-4" />
                <p class="chart-text">Gráficos de performance em tempo real</p>
              </div>
              <div class="analytics-metrics">
                <div class="metric">
                  <span class="metric-value">+23.5%</span>
                  <span class="metric-label">Crescimento este mês</span>
                </div>
                <div class="metric">
                  <span class="metric-value">R$ 45.2K</span>
                  <span class="metric-label">Receita total</span>
                </div>
              </div>
            </div>
          </DynamicCard>

          <!-- User Management Card -->
          <DynamicCard
            variant="secondary"
            size="lg"
            :elevated="true"
            :animated="true"
            title="Gerenciamento de Usuários"
            subtitle="Controle total de usuários e permissões"
            icon="people"
            icon-color="secondary"
            class="users-card"
          >
            <div class="users-content">
              <div class="user-stats">
                <div class="stat-item">
                  <q-icon name="person_add" color="positive" />
                  <div class="stat-info">
                    <span class="stat-number">+127</span>
                    <span class="stat-label">Novos usuários</span>
                  </div>
                </div>
                <div class="stat-item">
                  <q-icon name="verified_user" color="info" />
                  <div class="stat-info">
                    <span class="stat-number">98.2%</span>
                    <span class="stat-label">Taxa de verificação</span>
                  </div>
                </div>
              </div>
              <q-btn 
                flat 
                color="secondary" 
                label="Ver Todos Usuários"
                icon="arrow_forward"
                class="full-width q-mt-md"
              />
            </div>
          </DynamicCard>

          <!-- System Status Card -->
          <DynamicCard
            variant="success"
            size="lg"
            :elevated="true"
            :animated="true"
            title="Status do Sistema"
            subtitle="Monitoramento em tempo real"
            icon="monitor_heart"
            icon-color="positive"
            class="system-card"
          >
            <div class="system-content">
              <div class="status-indicators">
                <div class="status-item">
                  <div class="status-dot status-dot--online"></div>
                  <span>Servidor Principal</span>
                  <q-chip color="positive" text-color="white" size="sm">Online</q-chip>
                </div>
                <div class="status-item">
                  <div class="status-dot status-dot--online"></div>
                  <span>Base de Dados</span>
                  <q-chip color="positive" text-color="white" size="sm">Online</q-chip>
                </div>
                <div class="status-item">
                  <div class="status-dot status-dot--warning"></div>
                  <span>CDN</span>
                  <q-chip color="warning" text-color="white" size="sm">Lento</q-chip>
                </div>
              </div>
              <div class="system-metrics q-mt-md">
                <div class="metric-row">
                  <span>CPU:</span>
                  <q-linear-progress :value="0.65" color="positive" size="md" />
                  <span>65%</span>
                </div>
                <div class="metric-row">
                  <span>RAM:</span>
                  <q-linear-progress :value="0.42" color="info" size="md" />
                  <span>42%</span>
                </div>
              </div>
            </div>
          </DynamicCard>

          <!-- Quick Actions Card -->
          <DynamicCard
            variant="info"
            size="lg"
            :elevated="true"
            :animated="true"
            title="Ações Rápidas"
            subtitle="Controles administrativos essenciais"
            icon="admin_panel_settings"
            icon-color="info"
            class="actions-card"
          >
            <div class="actions-content">
              <div class="action-buttons">
                <q-btn 
                  unelevated 
                  color="primary" 
                  icon="backup"
                  label="Backup Sistema"
                  class="full-width q-mb-sm"
                />
                <q-btn 
                  unelevated 
                  color="secondary" 
                  icon="security"
                  label="Logs de Segurança"
                  class="full-width q-mb-sm"
                />
                <q-btn 
                  unelevated 
                  color="accent" 
                  icon="settings"
                  label="Configurações"
                  class="full-width q-mb-sm"
                />
                <q-btn 
                  unelevated 
                  color="warning" 
                  icon="bug_report"
                  label="Relatório de Bugs"
                  class="full-width"
                />
              </div>
            </div>
          </DynamicCard>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section q-mt-xl">
          <h2 class="section-title q-mb-lg">Atividade Recente</h2>
          <DynamicCard
            variant="default"
            size="lg"
            :elevated="true"
            :animated="true"
            class="activity-card"
          >
            <div class="activity-content">
              <q-list separator>
                <q-item v-for="activity in recentActivities" :key="activity.id">
                  <q-item-section avatar>
                    <q-avatar :color="activity.color" text-color="white">
                      <q-icon :name="activity.icon" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ activity.title }}</q-item-label>
                    <q-item-label caption>{{ activity.description }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption>{{ activity.time }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </DynamicCard>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DynamicCard from 'src/components/DynamicCard.vue'
import LiveStats from 'src/components/LiveStats.vue'

// Page state
const refreshing = ref(false)

// Dashboard stats
const dashboardStats = ref([
  {
    id: 'total-users',
    icon: 'people',
    label: 'Total de Usuários',
    value: 15670,
    format: 'number',
    change: 12.5,
    variant: 'primary',
    live: true
  },
  {
    id: 'total-revenue',
    icon: 'monetization_on',
    label: 'Receita Total',
    value: 284000,
    format: 'currency',
    change: 8.3,
    variant: 'success',
    live: true
  },
  {
    id: 'active-campaigns',
    icon: 'campaign',
    label: 'Campanhas Ativas',
    value: 1250,
    format: 'number',
    change: -2.1,
    variant: 'info',
    live: true
  },
  {
    id: 'success-rate',
    icon: 'trending_up',
    label: 'Taxa de Sucesso',
    value: 85,
    format: 'percentage',
    change: 5.2,
    variant: 'secondary',
    live: true,
    progress: 85
  }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    icon: 'person_add',
    title: 'Novo usuário registrado',
    description: 'João Silva criou uma conta',
    time: 'há 5 minutos',
    color: 'positive'
  },
  {
    id: 2,
    icon: 'campaign',
    title: 'Nova campanha criada',
    description: 'Projeto "Tecnologia Sustentável" foi publicado',
    time: 'há 15 minutos',
    color: 'primary'
  },
  {
    id: 3,
    icon: 'payment',
    title: 'Pagamento processado',
    description: 'Contribuição de R$ 500,00 recebida',
    time: 'há 32 minutos',
    color: 'secondary'
  },
  {
    id: 4,
    icon: 'security',
    title: 'Backup realizado',
    description: 'Backup automático do sistema concluído',
    time: 'há 1 hora',
    color: 'info'
  },
  {
    id: 5,
    icon: 'warning',
    title: 'Alerta de performance',
    description: 'CDN apresentando lentidão',
    time: 'há 2 horas',
    color: 'warning'
  }
])

// Methods
async function refreshData() {
  refreshing.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Update stats (simulate real-time data)
  dashboardStats.value.forEach(stat => {
    const randomChange = (Math.random() - 0.5) * 10
    stat.change = parseFloat(randomChange.toFixed(1))
    
    if (stat.format === 'number') {
      stat.value += Math.floor(Math.random() * 10)
    } else if (stat.format === 'currency') {
      stat.value += Math.floor(Math.random() * 1000)
    }
  })
  
  refreshing.value = false
}

onMounted(() => {
  // Auto-refresh every 30 seconds
  setInterval(() => {
    if (!refreshing.value) {
      void refreshData()
    }
  }, 30000)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

// === HEADER SECTION ===
.dashboard-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(99, 102, 241, 0.2);
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
    background: #10b981;
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
