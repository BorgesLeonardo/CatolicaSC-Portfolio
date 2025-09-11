<template>
  <q-page>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row justify-center">
          <div class="col-12 col-md-10 col-lg-8 text-center">
            <h1 class="hero-title fade-in-up">
              Transforme suas ideias em realidade
            </h1>
            <p class="hero-subtitle fade-in-up">
              Conecte-se com pessoas que acreditam no seu projeto. 
              Arrecade fundos de forma segura e transparente para tornar seus sonhos possíveis.
            </p>
            <div class="hero-cta fade-in-up">
              <q-btn 
                unelevated
                size="lg"
                color="white"
                text-color="primary"
                label="Criar Campanha"
                to="/projects/new"
                class="q-mr-md"
              />
              <q-btn 
                outline
                size="lg"
                color="white"
                label="Ver Campanhas"
                to="/projects"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="q-py-xl bg-white">
      <div class="container">
        <div class="row q-col-gutter-lg text-center">
          <div class="col-12 col-md-4">
            <div class="stat-item">
              <div class="text-h3 text-weight-bold text-primary">{{ formatNumber(stats.totalProjects) }}+</div>
              <div class="text-h6 text-grey-7">Campanhas Criadas</div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="stat-item">
              <div class="text-h3 text-weight-bold text-secondary">{{ formatMoney(stats.totalRaised) }}</div>
              <div class="text-h6 text-grey-7">Arrecadado</div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="stat-item">
              <div class="text-h3 text-weight-bold text-accent">{{ formatNumber(stats.totalBackers) }}+</div>
              <div class="text-h6 text-grey-7">Apoiadores</div>
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

        <q-inner-loading :showing="loading">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>

        <div v-if="!loading" class="row q-col-gutter-lg">
          <div 
            v-for="project in featuredProjects" 
            :key="project.id" 
            class="col-12 col-md-6 col-lg-4"
          >
            <CampaignCard
              :project="project"
              :featured="true"
              @click="openProject"
              @favorite="handleFavorite"
            />
          </div>
        </div>

        <div class="text-center q-mt-xl">
          <q-btn 
            unelevated
            color="primary"
            label="Ver Todas as Campanhas"
            to="/projects"
            size="lg"
            class="q-px-xl"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="q-py-xl bg-white">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="section-title">Como Funciona</h2>
          <p class="section-subtitle">
            Em apenas 3 passos simples, você pode começar sua campanha
          </p>
        </div>

        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-4 text-center">
            <div class="how-it-works-item">
              <div class="step-icon">
                <q-icon name="create" size="xl" color="primary" />
              </div>
              <h3 class="text-h5 text-weight-bold q-mb-md">1. Crie sua Campanha</h3>
              <p class="text-grey-7">
                Conte sua história, defina sua meta e adicione imagens atrativas para engajar seus apoiadores.
              </p>
            </div>
          </div>
          
          <div class="col-12 col-md-4 text-center">
            <div class="how-it-works-item">
              <div class="step-icon">
                <q-icon name="share" size="xl" color="secondary" />
              </div>
              <h3 class="text-h5 text-weight-bold q-mb-md">2. Compartilhe</h3>
              <p class="text-grey-7">
                Divulgue sua campanha nas redes sociais, entre amigos e familiares para alcançar mais pessoas.
              </p>
            </div>
          </div>
          
          <div class="col-12 col-md-4 text-center">
            <div class="how-it-works-item">
              <div class="step-icon">
                <q-icon name="monetization_on" size="xl" color="accent" />
              </div>
              <h3 class="text-h5 text-weight-bold q-mb-md">3. Receba Apoio</h3>
              <p class="text-grey-7">
                Receba contribuições seguras através do Stripe e acompanhe o progresso da sua campanha.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="q-py-xl" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
      <div class="container text-center">
        <div class="row justify-center">
          <div class="col-12 col-md-8">
            <h2 class="text-h3 text-white text-weight-bold q-mb-md">
              Pronto para começar?
            </h2>
            <p class="text-h6 text-white q-mb-xl" style="opacity: 0.9;">
              Junte-se a milhares de pessoas que já realizaram seus sonhos através da nossa plataforma.
            </p>
            <q-btn 
              unelevated
              size="xl"
              color="white"
              text-color="primary"
              label="Criar Minha Campanha"
              to="/projects/new"
              class="text-weight-bold q-px-xl"
            />
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { http } from 'src/utils/http'
import { formatMoneyBRL } from 'src/utils/format'
import type { Project, ProjectResponse } from 'src/components/models'
import CampaignCard from 'src/components/CampaignCard.vue'

const router = useRouter()
const loading = ref(false)
const featuredProjects = ref<Project[]>([])

// Stats mockados - em produção viriam da API
const stats = ref({
  totalProjects: 1250,
  totalRaised: 2840000, // em centavos
  totalBackers: 15670
})

async function fetchFeaturedProjects() {
  loading.value = true
  try {
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

onMounted(() => {
  void fetchFeaturedProjects()
})
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.campaign-placeholder {
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-item {
  padding: 20px 0;
}

.how-it-works-item {
  padding: 40px 20px;
  
  .step-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
}

@media (max-width: 768px) {
  .hero-cta .q-btn {
    width: 100%;
    margin-bottom: 12px;
  }
}
</style>
