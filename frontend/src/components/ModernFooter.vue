<template>
  <footer class="modern-footer">
    <!-- Main Footer Content -->
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="brand-logo">
              <q-icon name="campaign" size="lg" color="primary" />
              <span class="brand-name">Crowdfunding</span>
            </div>
            <p class="brand-description">
              Transformando ideias em realidade através do poder da comunidade. 
              Conectamos sonhadores com apoiadores para criar um futuro melhor.
            </p>
            <div class="social-links">
              <q-btn 
                flat 
                round 
                icon="fab fa-facebook" 
                class="social-btn"
                aria-label="Facebook"
              />
              <q-btn 
                flat 
                round 
                icon="fab fa-twitter" 
                class="social-btn"
                aria-label="Twitter"
              />
              <q-btn 
                flat 
                round 
                icon="fab fa-instagram" 
                class="social-btn"
                aria-label="Instagram"
              />
              <q-btn 
                flat 
                round 
                icon="fab fa-linkedin" 
                class="social-btn"
                aria-label="LinkedIn"
              />
            </div>
          </div>
          
          <!-- Quick Links -->
          <div class="footer-section">
            <h4 class="section-title">Navegação</h4>
            <ul class="footer-links">
              <li><router-link to="/" class="footer-link">Início</router-link></li>
              <li><router-link to="/projects" class="footer-link">Campanhas</router-link></li>
              <li><router-link to="/projects/new" class="footer-link">Criar Projeto</router-link></li>
              <li><a href="#" class="footer-link" @click="scrollToHowItWorks">Como Funciona</a></li>
            </ul>
          </div>
          
          <!-- Categories -->
          <div class="footer-section">
            <h4 class="section-title">Categorias</h4>
            <ul class="footer-links">
              <li><a href="#" class="footer-link" @click.prevent="goToCategory('Tecnologia')">Tecnologia</a></li>
              <li><a href="#" class="footer-link" @click.prevent="goToCategory('Arte & Design')">Arte & Design</a></li>
              <li><a href="#" class="footer-link" @click.prevent="goToCategory('Educação')">Educação</a></li>
              <li><a href="#" class="footer-link" @click.prevent="goToCategory('Saúde')">Saúde</a></li>
              <li><a href="#" class="footer-link" @click.prevent="goToCategory('Meio Ambiente')">Meio Ambiente</a></li>
            </ul>
          </div>
          
          <!-- Support -->
          <div class="footer-section">
            <h4 class="section-title">Suporte</h4>
            <ul class="footer-links">
              <li><router-link to="/help" class="footer-link">Central de Ajuda</router-link></li>
              <li><router-link to="/contact" class="footer-link">Contato</router-link></li>
              <li><router-link to="/faq" class="footer-link">FAQ</router-link></li>
              <li><router-link to="/guides" class="footer-link">Guias</router-link></li>
              
            </ul>
          </div>
          
          <!-- Newsletter -->
          <div class="footer-section footer-newsletter">
            <h4 class="section-title">Fique por dentro</h4>
            <p class="newsletter-description">
              Receba as últimas novidades sobre projetos incríveis e dicas para campanhas de sucesso.
            </p>
            <div class="newsletter-form">
              <q-input
                v-model="email"
                placeholder="Seu e-mail"
                outlined
                dense
                class="newsletter-input"
              >
                <template #append>
                  <q-btn
                    flat
                    dense
                    icon="send"
                    color="primary"
                    @click="subscribeNewsletter"
                    class="newsletter-btn"
                    :loading="subscribing"
                  />
                </template>
              </q-input>
            </div>
            <div class="trust-badges">
              <div class="trust-item">
                <q-icon name="security" size="sm" color="positive" />
                <span>Dados Seguros</span>
              </div>
              <div class="trust-item">
                <q-icon name="verified" size="sm" color="primary" />
                <span>SSL Certificado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} Crowdfunding. Todos os direitos reservados.</p>
          </div>
          
          <div class="legal-links">
            <router-link to="/terms" class="legal-link">Termos de Uso</router-link>
            <router-link to="/privacy" class="legal-link">Política de Privacidade</router-link>
            <router-link to="/cookies" class="legal-link">Cookies</router-link>
          </div>
          
          <div class="payment-methods">
            <span class="payment-label">Pagamentos seguros via:</span>
            <div class="payment-icons">
              <q-icon name="credit_card" size="sm" color="grey-6" />
              <span class="payment-text">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { slugify } from 'src/utils/slug'

const router = useRouter()
const email = ref('')
const subscribing = ref(false)

const currentYear = computed(() => new Date().getFullYear())

function scrollToHowItWorks() {
  // If not on home page, navigate to home first
  if (router.currentRoute.value.path !== '/') {
    void router.push('/').then(() => {
      setTimeout(() => {
        const element = document.querySelector('.how-it-works-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    })
  } else {
    const element = document.querySelector('.how-it-works-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

function goToCategory(name: string) {
  void router.push({ path: '/projects', query: { category: slugify(name) } })
}

async function subscribeNewsletter() {
  if (!email.value) return
  
  subscribing.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Show success message (implement with your notification system)
  // noop: removed debug log
  email.value = ''
  subscribing.value = false
}
</script>

<style scoped lang="scss">
.modern-footer {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
}

.footer-main {
  padding: 80px 0 40px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 48px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

// === BRAND SECTION ===
.footer-brand {
  @media (max-width: 640px) {
    text-align: center;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    justify-content: center;
  }
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
}

.brand-description {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 0.925rem;
}

.social-links {
  display: flex;
  gap: 8px;
  
  @media (max-width: 640px) {
    justify-content: center;
  }
}

.social-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  transition: all var(--transition-base);
  
  &:hover {
    background: rgba(30, 64, 175, 0.2);
    color: #1e40af;
    transform: translateY(-2px);
  }
}

// === FOOTER SECTIONS ===
.footer-section {
  @media (max-width: 640px) {
    text-align: center;
  }
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 20px;
  letter-spacing: -0.025em;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.925rem;
  transition: all var(--transition-fast);
  display: inline-block;
  
  &:hover {
    color: #1e40af;
    transform: translateX(4px);
  }
}

// === NEWSLETTER SECTION ===
.footer-newsletter {
  @media (max-width: 768px) {
    grid-column: 1 / -1;
  }
}

.newsletter-description {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.newsletter-form {
  margin-bottom: 20px;
}

.newsletter-input {
  .q-field__control {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    
    &:hover {
      border-color: rgba(30, 64, 175, 0.5);
    }
  }
  
  .q-field__native {
    color: #e2e8f0;
  }
  
  .q-field__label {
    color: #94a3b8;
  }
}

.newsletter-btn {
  color: #1e40af;
  
  &:hover {
    background: rgba(30, 64, 175, 0.1);
  }
}

.trust-badges {
  display: flex;
  gap: 20px;
  
  @media (max-width: 640px) {
    justify-content: center;
  }
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #94a3b8;
}

// === FOOTER BOTTOM ===
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 0;
  background: rgba(0, 0, 0, 0.2);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

.copyright {
  p {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0;
  }
}

.legal-links {
  display: flex;
  gap: 24px;
  
  @media (max-width: 640px) {
    gap: 16px;
  }
}

.legal-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
  
  &:hover {
    color: #1e40af;
  }
}

.payment-methods {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-label {
  color: #64748b;
  font-size: 0.8125rem;
}

.payment-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.payment-text {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

// === RESPONSIVE DESIGN ===
@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }
  
  .footer-main {
    padding: 60px 0 32px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .footer-main {
    padding: 48px 0 24px;
  }
  
  .footer-grid {
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .footer-main {
    padding: 40px 0 20px;
  }
  
  .footer-grid {
    gap: 32px;
  }
  
  .legal-links {
    flex-direction: column;
    gap: 12px;
  }
  
  .payment-methods {
    flex-direction: column;
    gap: 8px;
  }
}

// === DARK MODE ENHANCEMENTS ===
// Dark mode removed - manual theme control only
</style>
