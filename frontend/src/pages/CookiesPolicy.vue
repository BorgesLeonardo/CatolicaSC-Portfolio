<template>
	<q-page>
		<div id="topo"></div>
		<!-- Hero padronizado -->
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="cookie" class="q-mr-xs" />Cookies</div>
					<h1 class="hero-title">Política de Cookies</h1>
					<p class="hero-subtitle">Como utilizamos cookies e tecnologias semelhantes e como você pode gerenciá-los.</p>
					<div class="hero-actions">
						<q-btn color="primary" unelevated label="Ver arquivo público (.md)" href="/legal/politica-de-cookies-crowdfunding.md" target="_blank" />
						<q-btn outline color="white" icon="table_view" label="Inventário (CSV)" href="/legal/cookies-inventario-crowdfunding.csv" target="_blank" />
						<q-btn flat color="white" icon="print" label="Imprimir" @click="printPage" />
						<q-btn flat color="white" icon="tune" label="Gerenciar Cookies" @click="openCookiesDialog" />
					</div>
				</div>
			</div>
		</section>

		<!-- Conteúdo -->
		<section class="q-py-xl bg-surface">
			<div class="container">
				<div class="row q-col-gutter-xl content-grid">
					<div class="col-12 col-md-9">
						<q-card flat bordered class="section-card q-mb-lg" id="o-que-sao">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="info" class="q-mr-sm" />1. O que são cookies e tecnologias similares</h3>
								<p>Cookies são arquivos de texto que o navegador armazena para habilitar funcionalidades essenciais, lembrar preferências e melhorar o produto. Tecnologias similares incluem pixels/tags, localStorage/sessionStorage e, em apps, identificadores/SDKs.</p>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="categorias">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="category" class="q-mr-sm" />2. Categorias e bases legais</h3>
								<ul class="nice-list">
									<li><strong>Estritamente necessários</strong>: execução de contrato/legítimo interesse.</li>
									<li><strong>Desempenho/Analíticos</strong>: consentimento.</li>
									<li><strong>Funcionais</strong>: consentimento.</li>
									<li><strong>Publicidade</strong>: consentimento.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="gestao">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="tune" class="q-mr-sm" />3. Como gerenciar</h3>
								<p>Use o botão “Gerenciar Cookies” (acima ou no rodapé) para escolher por categoria: aceitar tudo, rejeitar tudo ou salvar preferências. Você pode alterar a qualquer momento. A revogação não retroage.</p>
								<div class="q-mt-sm row items-center q-col-gutter-sm">
									<q-btn outline color="primary" icon="cookie" label="Gerenciar Cookies" @click="openCookiesDialog" />
									<q-btn flat color="primary" icon="policy" label="Ver Política de Privacidade" to="/privacy" />
								</div>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="inventario">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="list_alt" class="q-mr-sm" />4. Inventário e registro</h3>
								<p>Veja o inventário público em CSV e o arquivo da política com a tabela completa. O registro de consentimento segue o modelo JSON divulgado.</p>
								<div class="q-mt-sm row items-center q-col-gutter-sm">
									<q-btn flat color="primary" label="Inventário (CSV)" href="/legal/cookies-inventario-crowdfunding.csv" target="_blank" />
									<q-btn flat color="primary" label="Schema de Consentimento (JSON)" href="/legal/consent-schema-crowdfunding.json" target="_blank" />
								</div>
							</q-card-section>
						</q-card>
					</div>

					<div class="col-12 col-md-3 gt-sm">
						<q-card flat bordered class="toc-card">
							<q-card-section class="q-pb-none">
								<div class="text-subtitle1 text-weight-bold q-mb-sm">Navegação</div>
							</q-card-section>
							<q-separator />
							<q-list dense class="toc-list">
								<q-item v-for="item in toc" :key="item.id" clickable :active="activeId === item.id" @click="scrollTo(item.id)" active-class="toc-active">
									<q-item-section>{{ item.label }}</q-item-section>
								</q-item>
							</q-list>
						</q-card>
					</div>
				</div>
			</div>
		</section>

		<q-btn v-show="showBackToTop" class="fab-top" color="primary" icon="keyboard_arrow_up" round @click="toTop" aria-label="Voltar ao topo" />

		<!-- Cookie Preferences Dialog -->
		<q-dialog v-model="cookieDialog">
			<q-card style="max-width: 640px; width: 100%">
				<q-card-section class="row items-center q-gutter-sm">
					<q-icon name="cookie" color="primary" />
					<div class="text-h6">Preferências de Cookies</div>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<p>Controle quais categorias de cookies deseja habilitar. Cookies necessários são sempre ativos para funcionamento básico.</p>
					<q-list separator>
						<q-item>
							<q-item-section>
								<q-item-label>Necessários</q-item-label>
								<q-item-label caption>Autenticação, segurança, prevenção a fraude.</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-toggle color="primary" v-model="prefs.necessary" disable />
							</q-item-section>
						</q-item>
						<q-item>
							<q-item-section>
								<q-item-label>Desempenho/Analytics</q-item-label>
								<q-item-label caption>Métricas agregadas de uso (ex.: GA4).</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-toggle color="primary" v-model="prefs.performance" />
							</q-item-section>
						</q-item>
						<q-item>
							<q-item-section>
								<q-item-label>Funcionalidade</q-item-label>
								<q-item-label caption>Lembrar preferências, melhorar experiência.</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-toggle color="primary" v-model="prefs.functionality" />
							</q-item-section>
						</q-item>
						<q-item>
							<q-item-section>
								<q-item-label>Marketing</q-item-label>
								<q-item-label caption>Personalização de anúncios quando aplicável.</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-toggle color="primary" v-model="prefs.marketing" />
							</q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
				<q-separator />
				<q-card-actions align="between">
					<div class="row q-gutter-sm">
						<q-btn flat color="negative" label="Rejeitar Todos" @click="rejectAll" />
						<q-btn flat color="positive" label="Aceitar Todos" @click="acceptAll" />
					</div>
					<div>
						<q-btn color="primary" unelevated label="Salvar Preferências" @click="savePrefs" />
					</div>
				</q-card-actions>
			</q-card>
		</q-dialog>
	</q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showBackToTop = ref(false)
const activeId = ref<string>('o-que-sao')
const cookieDialog = ref(false)
const prefs = ref({
  necessary: true,
  performance: false,
  functionality: false,
  marketing: false
})

const toc = [
  { id: 'o-que-sao', label: '1. O que são' },
  { id: 'categorias', label: '2. Categorias' },
  { id: 'gestao', label: '3. Como gerenciar' },
  { id: 'inventario', label: '4. Inventário' }
]

let observer: IntersectionObserver | null = null

function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function printPage() {
  window.print()
}

function openCookiesDialog() {
  cookieDialog.value = true
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function savePrefs() {
  try {
    localStorage.setItem('consent_prefs', JSON.stringify(prefs.value))
    const exp = new Date()
    exp.setFullYear(exp.getFullYear() + 1)
    document.cookie = `consent_prefs=${encodeURIComponent(JSON.stringify(prefs.value))}; expires=${exp.toUTCString()}; path=/`
  } catch (_e) { void _e }
  cookieDialog.value = false
}

function acceptAll() {
  prefs.value.performance = true
  prefs.value.functionality = true
  prefs.value.marketing = true
  savePrefs()
}

function rejectAll() {
  prefs.value.performance = false
  prefs.value.functionality = false
  prefs.value.marketing = false
  savePrefs()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  try {
    const stored = localStorage.getItem('consent_prefs')
    if (stored) Object.assign(prefs.value, JSON.parse(stored))
  } catch (_e) { void _e }

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id
        break
      }
    }
  }, { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.2, 0.6, 1] })

  toc.forEach(i => {
    const el = document.getElementById(i.id)
    if (el) observer?.observe(el)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.container { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
.legal-hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%); color: #fff; padding: 72px 0 40px; }
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display:inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 14px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0 0 16px 0; }
.hero-actions { display:flex; justify-content:center; gap:12px; }
.section-title { font-weight: 800; letter-spacing: -0.02em; }
.section-heading { font-weight: 800; margin-bottom: 8px; letter-spacing: -0.01em; }
.toc { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 6px 18px; padding-left: 16px; }
.toc a { color: #1e40af; text-decoration: none; }
.toc a:hover { text-decoration: underline; }
.back-top { margin-top: 6px; }
.section-card { border-radius: 14px; }
.version-box { border-top: 1px solid rgba(15, 23, 42, 0.1); padding-top: 12px; color: #64748b; font-size: .9rem; }
.fab-top { position: fixed; bottom: 24px; right: 24px; z-index: 1000; box-shadow: 0 6px 18px rgba(0,0,0,.18); }
.toc-card { position: sticky; top: 96px; border-radius: 14px; }
.toc-list :deep(.q-item) { border-left: 2px solid transparent; }
.toc-active { background: rgba(30,64,175,0.08) !important; border-left-color: #1e40af !important; }
[data-theme='dark'] .legal-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>
