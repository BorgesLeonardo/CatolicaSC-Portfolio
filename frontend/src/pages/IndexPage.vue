<template>
  <q-page>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <div class="container">
        <div class="row justify-center">
          <div class="col-12 col-md-10 col-lg-8 text-center hero-content">
            <div class="hero-badge fade-in-up">
              <q-icon name="rocket_launch" size="sm" class="q-mr-xs" />
              Plataforma de Crowdfunding
            </div>
            
            <h1 class="hero-title fade-in-up stagger-animation">
              Transforme suas <span class="gradient-text">ideias</span> em realidade
            </h1>
            
            <p class="hero-subtitle fade-in-up stagger-animation">
              Conecte-se com pessoas que acreditam no seu projeto. 
              Arrecade fundos de forma segura e transparente para tornar seus sonhos possíveis.
            </p>
            
            <div class="hero-cta fade-in-up stagger-animation">
              <q-btn 
                unelevated
                size="xl"
                color="white"
                text-color="primary"
                label="Criar Campanha"
                to="/projects/new"
                class="cta-primary hover-lift"
                icon="add_circle"
              />
              <q-btn 
                outline
                size="xl"
                color="white"
                label="Explorar Projetos"
                to="/projects"
                class="cta-secondary hover-lift"
                icon="explore"
              />
            </div>
            
            <!-- Trust Indicators -->
            <div class="trust-indicators fade-in-up stagger-animation">
              <div class="trust-item">
                <q-icon name="verified" color="white" size="sm" />
                <span>Pagamentos Seguros</span>
              </div>
              <div class="trust-item">
                <q-icon name="support" color="white" size="sm" />
                <span>Suporte 24/7</span>
              </div>
              <div class="trust-item">
                <q-icon name="trending_up" color="white" size="sm" />
                <span>Taxa de Sucesso 85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card modern-card--glass fade-in-up stagger-animation">
            <div class="stat-icon">
              <q-icon name="campaign" size="xl" color="primary" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(stats.totalProjects) }}+</div>
              <div class="stat-label">Campanhas Criadas</div>
              <div class="stat-description">Projetos inovadores em diversas categorias</div>
            </div>
          </div>
          
          <div class="stat-card modern-card--glass fade-in-up stagger-animation">
            <div class="stat-icon">
              <q-icon name="monetization_on" size="xl" color="secondary" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatMoney(stats.totalRaised) }}</div>
              <div class="stat-label">Total Arrecadado</div>
              <div class="stat-description">Investimento direto em sonhos e ideias</div>
            </div>
          </div>
          
          <div class="stat-card modern-card--glass fade-in-up stagger-animation">
            <div class="stat-icon">
              <q-icon name="group" size="xl" color="accent" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(stats.totalBackers) }}+</div>
              <div class="stat-label">Apoiadores Ativos</div>
              <div class="stat-description">Comunidade engajada e participativa</div>
            </div>
          </div>
          
          <div class="stat-card modern-card--glass fade-in-up stagger-animation">
            <div class="stat-icon">
              <q-icon name="trending_up" size="xl" color="positive" />
            </div>
            <div class="stat-content">
              <div class="stat-number">85%</div>
              <div class="stat-label">Taxa de Sucesso</div>
              <div class="stat-description">Projetos que atingem suas metas</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Campaigns -->
    <section class="q-py-xl bg-grey-1">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="section-title">Campanhas em Destaque</h2>
          <p class="section-subtitle">
            Descubra projetos incríveis que estão mudando o mundo
          </p>
        </div>

        <ModernLoading 
          v-if="loading"
          title="Carregando campanhas em destaque"
          subtitle="Descobrindo os melhores projetos para você"
        />

        <DynamicGrid 
          v-if="!loading"
          :items="featuredProjects"
          layout="grid"
          :animated="true"
          :responsive="true"
          min-item-width="350px"
          gap="32px"
          item-key="id"
        >
          <template #default="{ item: project }">
            <CampaignCard
              :project="project"
              :featured="true"
              @click="openProject"
              @favorite="handleFavorite"
            />
          </template>
        </DynamicGrid>

        <div class="text-center q-mt-xl">
          <q-btn
            unelevated
            color="primary"
            label="Ver Todas as Campanhas"
            to="/projects"
            size="lg"
            class="q-px-xl gradient-btn"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works-section q-py-xl bg-white">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-badge fade-in-up">
            <q-icon name="lightbulb" size="sm" class="q-mr-xs" color="primary" />
            Processo Simples
          </div>
          <h2 class="section-title fade-in-up">Como Funciona</h2>
          <p class="section-subtitle fade-in-up">
            Em apenas 3 passos simples, você pode começar sua campanha e transformar suas ideias em realidade
          </p>
        </div>

        <div class="steps-container">
          <div class="step-item fade-in-up stagger-animation">
            <div class="step-card modern-card hover-lift">
              <div class="step-icon">
                <q-icon name="create" size="2xl" color="primary" />
              </div>
              <h3 class="step-title">Crie sua Campanha</h3>
              <p class="step-description">
                Conte sua história de forma envolvente, defina sua meta financeira e adicione imagens atrativas para engajar seus apoiadores.
              </p>
              <ul class="step-features">
                <li>Editor intuitivo</li>
                <li>Templates profissionais</li>
                <li>Upload de imagens</li>
              </ul>
            </div>
            <div class="step-connector"></div>
          </div>
          
          <div class="step-item fade-in-up stagger-animation">
            <div class="step-card modern-card hover-lift">
              <div class="step-icon">
                <q-icon name="share" size="2xl" color="secondary" />
              </div>
              <h3 class="step-title">Compartilhe e Divulgue</h3>
              <p class="step-description">
                Utilize nossas ferramentas de marketing para divulgar sua campanha nas redes sociais e alcançar mais pessoas interessadas.
              </p>
              <ul class="step-features">
                <li>Compartilhamento automático</li>
                <li>Análise de engajamento</li>
                <li>Campanhas de email</li>
              </ul>
            </div>
            <div class="step-connector"></div>
          </div>
          
          <div class="step-item fade-in-up stagger-animation">
            <div class="step-card modern-card hover-lift">
              <div class="step-icon">
                <q-icon name="monetization_on" size="2xl" color="accent" />
              </div>
              <h3 class="step-title">Receba Apoio</h3>
              <p class="step-description">
                Receba contribuições seguras através do Stripe, acompanhe o progresso em tempo real e mantenha seus apoiadores informados.
              </p>
              <ul class="step-features">
                <li>Pagamentos seguros</li>
                <li>Dashboard em tempo real</li>
                <li>Comunicação direta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section q-py-xl bg-grey-1">
      <div class="container">
        <div class="text-center q-mb-xl">
          <div class="section-badge fade-in-up">
            <q-icon name="star" size="sm" class="q-mr-xs" />
            Histórias de Sucesso
          </div>
          <h2 class="section-title fade-in-up">O que nossos usuários dizem</h2>
          <p class="section-subtitle fade-in-up">
            Milhares de pessoas já transformaram suas ideias em realidade através da nossa plataforma
          </p>
        </div>
        
        <div class="testimonials-grid">
          <div class="testimonial-card modern-card fade-in-up stagger-animation">
            <div class="testimonial-content">
              <div class="testimonial-stars">
                <q-icon name="star" color="primary" size="sm" v-for="i in 5" :key="i" />
              </div>
              <p class="testimonial-text">
                "Consegui arrecadar R$ 50.000 para meu projeto de tecnologia educacional. A plataforma é intuitiva e o suporte é excepcional!"
              </p>
            </div>
            <div class="testimonial-author">
              <q-avatar size="md" color="primary" text-color="white">M</q-avatar>
              <div class="author-info">
                <div class="author-name">Maria Silva</div>
                <div class="author-role">Fundadora da EduTech</div>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card modern-card fade-in-up stagger-animation">
            <div class="testimonial-content">
              <div class="testimonial-stars">
                <q-icon name="star" color="primary" size="sm" v-for="i in 5" :key="i" />
              </div>
              <p class="testimonial-text">
                "Minha campanha para um projeto social superou a meta em 150%. A comunidade aqui é incrível e muito engajada!"
              </p>
            </div>
            <div class="testimonial-author">
              <q-avatar size="md" color="secondary" text-color="white">J</q-avatar>
              <div class="author-info">
                <div class="author-name">João Santos</div>
                <div class="author-role">Ativista Social</div>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card modern-card fade-in-up stagger-animation">
            <div class="testimonial-content">
              <div class="testimonial-stars">
                <q-icon name="star" color="primary" size="sm" v-for="i in 5" :key="i" />
              </div>
              <p class="testimonial-text">
                "Interface moderna, processo simples e resultados incríveis. Recomendo para qualquer empreendedor!"
              </p>
            </div>
            <div class="testimonial-author">
              <q-avatar size="md" color="info" text-color="white">A</q-avatar>
              <div class="author-info">
                <div class="author-name">Ana Costa</div>
                <div class="author-role">Designer de Produtos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Final CTA Section -->
    <section class="final-cta-section">
      <div class="cta-background">
        <div class="cta-shapes">
          <div class="cta-shape cta-shape-1"></div>
          <div class="cta-shape cta-shape-2"></div>
        </div>
      </div>
      
      <div class="container text-center">
        <div class="row justify-center">
          <div class="col-12 col-md-10 col-lg-8">
            <div class="cta-content">
              <div class="cta-badge fade-in-up">
                <q-icon name="rocket_launch" size="sm" class="q-mr-xs" />
                Comece Agora
              </div>
              
              <h2 class="cta-title fade-in-up">
                Pronto para <span class="gradient-text-white">transformar</span> sua ideia?
            </h2>
              
              <p class="cta-subtitle fade-in-up">
                Junte-se a milhares de empreendedores que já realizaram seus sonhos através da nossa plataforma. 
                Seu projeto pode ser o próximo sucesso!
              </p>
              
              <div class="cta-actions fade-in-up">
            <q-btn 
              unelevated
              size="xl"
              color="white"
              text-color="primary"
              label="Criar Minha Campanha"
              to="/projects/new"
                  class="cta-button-primary hover-lift"
                  icon="add_circle"
                />
                
                <q-btn 
                  flat
                  size="lg"
                  color="white"
                  label="Saiba Mais"
                  @click="scrollToHowItWorks"
                  class="cta-button-secondary hover-lift"
                  icon="info"
                />
              </div>
              
              <!-- Security badges -->
              <div class="security-badges fade-in-up">
                <div class="security-item">
                  <q-icon name="security" color="white" size="sm" />
                  <span>SSL Seguro</span>
                </div>
                <div class="security-item">
                  <q-icon name="verified_user" color="white" size="sm" />
                  <span>Dados Protegidos</span>
                </div>
                <div class="security-item">
                  <q-icon name="payment" color="white" size="sm" />
                  <span>Stripe Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
  
  <!-- Toast Notifications -->
  <ToastNotification />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { http } from 'src/utils/http'
import { formatMoneyBRL } from 'src/utils/format'
import type { Project, ProjectResponse } from 'src/components/models'
import CampaignCard from 'src/components/CampaignCard.vue'
import ModernLoading from 'src/components/ModernLoading.vue'
import DynamicGrid from 'src/components/DynamicGrid.vue'
import ToastNotification from 'src/components/ToastNotification.vue'
import { useProjectStats } from 'src/composables/useProjectStats'

const router = useRouter()
const loading = ref(false)
const featuredProjects = ref<Project[]>([])
const { updateStatsIfNeeded } = useProjectStats()

// Stats mockados - em produção viriam da API
const stats = ref({
  totalProjects: 1250,
  totalRaised: 2840000, // em centavos
  totalBackers: 15670
})

async function fetchFeaturedProjects() {
  loading.value = true
  try {
    // Atualiza estatísticas se necessário (silenciosamente)
    await updateStatsIfNeeded()
    
    const { data } = await http.get<ProjectResponse>('/api/projects', {
      params: {
        active: 1,
        pageSize: 6
      }
    })
    featuredProjects.value = data.items ?? []
  } catch (error) {
    console.error('Erro ao carregar campanhas em destaque:', error)
  } finally {
    loading.value = false
  }
}

function openProject(id: string) {
  void router.push(`/projects/${id}`)
}

function handleFavorite(project: Project) {
  console.log('Favorited project:', project.title)
  // Implementar lógica de favoritos
}

function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR')
}

function formatMoney(cents: number): string {
  return formatMoneyBRL(cents)
}

function scrollToHowItWorks() {
  const element = document.querySelector('.how-it-works-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  void fetchFeaturedProjects()
})
</script>

<style scoped lang="scss">
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

// === HERO SECTION ===
.hero-section {
  position: relative;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  
  .shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
    
    &.shape-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      right: 10%;
      animation-delay: 0s;
    }
    
    &.shape-2 {
      width: 200px;
      height: 200px;
      bottom: 20%;
      left: 5%;
      animation-delay: 2s;
    }
    
    &.shape-3 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 30%;
      animation-delay: 4s;
    }
  }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-cta {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 48px;
  
  .cta-primary {
    font-weight: 700;
    padding: 16px 32px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    
    &:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }
  }
  
  .cta-secondary {
    font-weight: 600;
    padding: 16px 32px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}

.trust-indicators {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  opacity: 0.9;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

// === STATS SECTION ===
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  padding: 32px 24px;
  text-align: center;
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-8px);
  }
}

.stat-icon {
  margin-bottom: 20px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
  line-height: 1;
  letter-spacing: -0.025em;
}

.stat-label {
  font-size: 1.125rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.stat-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

// === HOW IT WORKS SECTION ===
.section-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 24px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.step-item {
  position: relative;
}

.step-card {
  padding: 40px 32px;
  text-align: center;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}


.step-icon {
  margin-bottom: 24px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
}

.step-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
  flex: 1;
}

.step-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  li {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #1e40af;
    font-weight: 500;
    
    &::before {
      content: '\2713';
      margin-right: 8px;
      color: #1e40af;
      font-weight: bold;
    }
  }
}

.step-connector {
  display: none;
}

// === TESTIMONIALS SECTION ===
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.testimonial-stars {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #374151;
  font-style: italic;
  margin: 0;
  flex: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.author-role {
  font-size: 0.875rem;
  color: #64748b;
}

// === FINAL CTA SECTION ===
.final-cta-section {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 30%, #f97316 70%, #fb923c 100%);
  color: white;
  padding: 120px 0;
  position: relative;
  overflow: hidden;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.cta-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  
  .cta-shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 8s ease-in-out infinite;
    
    &.cta-shape-1 {
      width: 400px;
      height: 400px;
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }
    
    &.cta-shape-2 {
      width: 300px;
      height: 300px;
      bottom: -80px;
      left: -80px;
      animation-delay: 3s;
    }
  }
}

.cta-content {
  position: relative;
  z-index: 2;
}

.cta-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cta-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin-bottom: 24px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.gradient-text-white {
  color: white;
}

.cta-subtitle {
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  opacity: 0.95;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 48px;
  
  .cta-button-primary {
    font-weight: 700;
    padding: 16px 32px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    
    &:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }
  }
  
  .cta-button-secondary {
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 10px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.security-badges {
  display: flex;
    justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  opacity: 0.8;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

// === GRADIENT BUTTON ===
.gradient-btn {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #f97316 100%) !important;
  color: white !important;
  border: none !important;
  font-weight: 600 !important;
  
  &:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #ea580c 100%) !important;
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// === ANIMATIONS ===
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
    
    .q-btn {
      width: 100%;
      max-width: 300px;
    }
  }
  
  .trust-indicators {
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stat-card {
    padding: 24px 20px;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .testimonial-card {
    padding: 24px;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
    
    .q-btn {
    width: 100%;
      max-width: 300px;
    }
  }
  
  .security-badges {
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .step-card {
    padding: 32px 24px;
  }
  
  .trust-indicators,
  .security-badges {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
}
</style>
