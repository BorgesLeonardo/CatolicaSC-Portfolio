<template>
	<q-page>
		<div id="topo"></div>
		<!-- Hero padronizado -->
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="gavel" class="q-mr-xs" />Legal</div>
					<h1 class="hero-title">Termos de Uso</h1>
					<p class="hero-subtitle">Regras de uso da plataforma, responsabilidades e direitos.</p>
					<div class="hero-actions">
						<q-btn flat color="white" icon="print" label="Imprimir" @click="printPage" />
						<q-btn outline color="white" icon="policy" label="Ver Privacidade" to="/privacy" />
						<q-btn flat color="white" icon="cookie" label="Gerenciar Cookies" @click="openCookiesDialog" />
					</div>
					</div>
				</div>
		</section>

		<section class="q-py-xl bg-surface">
			<div class="container">
				<q-banner inline-actions class="bg-orange-2 text-orange-10 q-mb-lg">
					<strong>TODOs para validar:</strong>
					<span class="q-ml-sm">{{PLATAFORMA_URL}}, {{CONTROLADORA_RAZAO_SOCIAL}}, {{GATEWAYS_PAGAMENTO}}, {{FORO_CIDADE_UF}}.</span>
				</q-banner>

				<!-- Sumário (mobile) -->
				<div class="q-mb-xl lt-md">
					<h2 class="section-title q-mb-sm">Sumário</h2>
					<ul class="toc">
						<li><a href="#aceitacao">1. Aceitação dos Termos</a></li>
						<li><a href="#cadastro">2. Cadastro e elegibilidade</a></li>
						<li><a href="#campanhas">3. Campanhas</a></li>
						<li><a href="#apoios">4. Apoios/Contribuições</a></li>
						<li><a href="#pagamentos">5. Pagamentos e repasses</a></li>
						<li><a href="#propriedade">6. Propriedade intelectual</a></li>
						<li><a href="#conduta">7. Conduta e uso aceitável</a></li>
						<li><a href="#responsabilidades">8. Responsabilidades e isenções</a></li>
						<li><a href="#suspensao">9. Suspensão/encerramento</a></li>
						<li><a href="#privacidade">10. Privacidade</a></li>
						<li><a href="#comunicacoes">11. Comunicações e notificações</a></li>
						<li><a href="#foro">12. Lei aplicável e foro</a></li>
						<li><a href="#atualizacoes">13. Atualizações</a></li>
					</ul>
				</div>

				<div class="row q-col-gutter-xl content-grid">
					<div class="col-12 col-md-9">

					<q-card flat bordered class="section-card q-mb-lg" id="aceitacao">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="check_circle" class="q-mr-sm" />1. Aceitação dos Termos</h3>
						<p>Ao usar <strong>{{PLATAFORMA_NOME}}</strong> ({{PLATAFORMA_URL}}), você concorda com estes Termos. Se não concordar, não utilize a plataforma.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="cadastro">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="person_add" class="q-mr-sm" />2. Cadastro e elegibilidade</h3>
						<ul class="nice-list">
							<li><strong>Idade mínima:</strong> {{PUBLICO_ALVO}} (contas de menores são proibidas e bloqueadas).</li>
							<li><strong>Verificação:</strong> podemos solicitar KYC/antifraude e documentos.</li>
							<li><strong>Exatidão:</strong> você declara fornecer informações verdadeiras e atualizadas.</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="campanhas">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="campaign" class="q-mr-sm" />3. Campanhas</h3>
						<ul class="nice-list">
							<li><strong>Criação:</strong> objetivos, metas, prazos e recompensas claros; vedado conteúdo ilícito/ofensivo.</li>
							<li><strong>Transparência:</strong> atualize apoiadores sobre progresso, riscos e atrasos.</li>
							<li><strong>Cancelamento:</strong> a {{PLATAFORMA_NOME}} pode recusar, suspender ou remover campanhas que violem regras.</li>
							<li><strong>Proibições:</strong> captação para fins ilegais, lavagem de dinheiro ou sem autorizações exigidas.</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="apoios">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="favorite" class="q-mr-sm" />4. Apoios/Contribuições</h3>
						<ul class="nice-list">
							<li><strong>Funcionamento:</strong> contribuições são voluntárias; sucesso não é garantido.</li>
							<li><strong>Reembolsos/Chargeback:</strong> conforme {{GATEWAYS_PAGAMENTO}} e avaliação da {{PLATAFORMA_NOME}}; pode haver retenções.</li>
							<li><strong>Taxas:</strong> taxas de processamento/intermediação informadas antes da confirmação.</li>
							<li><strong>Atrasos:</strong> recompensas podem atrasar; criadores são responsáveis pela entrega.</li>
						</ul>
						<q-banner class="bg-amber-2 text-amber-10 q-mt-sm">Atenção: campanhas não garantem sucesso, entregas ou resultados.</q-banner>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="pagamentos">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="payments" class="q-mr-sm" />5. Pagamentos e repasses</h3>
						<ul class="nice-list">
							<li><strong>Intermediação:</strong> processados por {{GATEWAYS_PAGAMENTO}}; não armazenamos dados de cartão (somente tokens/IDs).</li>
							<li><strong>Tributos:</strong> criadores são responsáveis por tributos e documentos fiscais.</li>
							<li><strong>Retenções:</strong> valores podem ser retidos em disputas, suspeitas de fraude ou por exigência legal.</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="propriedade">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="copyright" class="q-mr-sm" />6. Propriedade intelectual</h3>
						<p>Você mantém a titularidade do conteúdo e concede à {{PLATAFORMA_NOME}} licença para exibição e promoção na plataforma. É proibida a violação de direitos de terceiros.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="conduta">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="shield" class="q-mr-sm" />7. Conduta e uso aceitável</h3>
						<p>É proibido fraude, SPAM, scraping abusivo, engenharia reversa, malware, exploração de vulnerabilidades, assédio, discurso de ódio ou qualquer conduta ilícita.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="responsabilidades">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="warning" class="q-mr-sm" />8. Responsabilidades e isenções</h3>
						<ul class="nice-list">
							<li><strong>Disponibilidade:</strong> esforços razoáveis, sem garantia de disponibilidade ininterrupta.</li>
							<li><strong>Terceiros:</strong> não respondemos por serviços de terceiros nem por atos/omissões de criadores.</li>
							<li><strong>Limitação:</strong> limitada às taxas de intermediação pagas nos últimos 12 meses, na máxima medida legal.</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="suspensao">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="block" class="q-mr-sm" />9. Suspensão/encerramento</h3>
						<p>Podemos suspender ou encerrar contas/campanhas que violem estes Termos, políticas internas ou a legislação. Encerramentos voluntários observam retenções legais e pendências.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="privacidade">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="policy" class="q-mr-sm" />10. Privacidade</h3>
						<p>O tratamento de dados segue a <router-link to="/privacy">Política de Privacidade</router-link>. Em caso de conflito, prevalece a Política.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="comunicacoes">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="notifications" class="q-mr-sm" />11. Comunicações e notificações</h3>
						<p>Comunicaremos por {{SUPORTE_CANAIS}} e pelo e-mail cadastrado. Preferências podem ser ajustadas e consentimentos de marketing, revogados.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="foro">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="gavel" class="q-mr-sm" />12. Lei aplicável e foro</h3>
						<p>Regidos pelas leis do Brasil. Foro eleito: <strong>{{FORO_CIDADE_UF}}</strong>, salvo disposições do CDC.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="atualizacoes">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="update" class="q-mr-sm" />13. Atualizações</h3>
						<p>Estes Termos podem ser atualizados. Manteremos versão e changelog.</p>
					</q-card-section>
				</q-card>

				<div class="version-box">
					<div class="row items-center q-col-gutter-sm">
						<q-chip size="sm" color="grey-2" text-color="grey-9" icon="article">Versão 1.0.0</q-chip>
						<q-chip size="sm" color="grey-2" text-color="grey-9" icon="event">Atualizada em 05/11/2025</q-chip>
					</div>
					<div class="changelog">Changelog: versão inicial com KYC/antifraude e política de reembolsos.</div>
				</div>

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
const activeId = ref<string>('aceitacao')
const cookieDialog = ref(false)
const prefs = ref({
  necessary: true,
  performance: false,
  functionality: false,
  marketing: false
})

const toc = [
  { id: 'aceitacao', label: '1. Aceitação' },
  { id: 'cadastro', label: '2. Cadastro' },
  { id: 'campanhas', label: '3. Campanhas' },
  { id: 'apoios', label: '4. Apoios' },
  { id: 'pagamentos', label: '5. Pagamentos' },
  { id: 'propriedade', label: '6. Propriedade' },
  { id: 'conduta', label: '7. Conduta' },
  { id: 'responsabilidades', label: '8. Responsabilidades' },
  { id: 'suspensao', label: '9. Suspensão' },
  { id: 'privacidade', label: '10. Privacidade' },
  { id: 'comunicacoes', label: '11. Comunicações' },
  { id: 'foro', label: '12. Foro' },
  { id: 'atualizacoes', label: '13. Atualizações' }
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
.content-grid { align-items: flex-start; }
.toc-card { position: sticky; top: 96px; border-radius: 14px; }
.toc-list :deep(.q-item) { border-left: 2px solid transparent; }
.toc-active { background: rgba(30,64,175,0.08) !important; border-left-color: #1e40af !important; }
.section-title { font-weight: 800; letter-spacing: -0.02em; }
.section-heading { font-weight: 800; margin-bottom: 8px; letter-spacing: -0.01em; }
.toc { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 6px 18px; padding-left: 16px; }
.toc a { color: #1e40af; text-decoration: none; }
.toc a:hover { text-decoration: underline; }
.back-top { margin-top: 6px; }
.section-card { border-radius: 14px; }
.version-box { border-top: 1px solid rgba(15, 23, 42, 0.1); padding-top: 12px; color: #64748b; font-size: .9rem; }
[data-theme='dark'] .legal-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
.fab-top { position: fixed; bottom: 24px; right: 24px; z-index: 1000; box-shadow: 0 6px 18px rgba(0,0,0,.18); }
[data-theme='dark'] .legal-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>


