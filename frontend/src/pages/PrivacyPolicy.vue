<template>
	<q-page>
		<div id="topo"></div>
		<!-- Hero padronizado -->
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="shield" class="q-mr-xs" />Privacidade</div>
					<h1 class="hero-title">Política de Privacidade</h1>
					<p class="hero-subtitle">Como tratamos seus dados pessoais e como você pode exercer seus direitos.</p>
					<div class="hero-actions">
						<q-btn color="primary" unelevated label="Baixar .md" type="a" href="/legal/politica-privacidade-crowdfunding.md" target="_blank" />
						<q-btn flat color="white" icon="print" label="Imprimir" @click="printPage" />
						<q-btn flat color="white" icon="cookie" label="Gerenciar Cookies" @click="openCookiesDialog" />
						<q-btn outline color="white" icon="mail" label="Contato do DPO" :href="`mailto:${dpoEmail}`" />
					</div>
				</div>
			</div>
		</section>

		<!-- Conteúdo -->
		<section class="q-py-xl bg-surface">
			<div class="container">
				<q-banner inline-actions class="bg-orange-2 text-orange-10 q-mb-lg">
					<strong>TODOs para validar:</strong>
					<span class="q-ml-sm">{{PLATAFORMA_URL}}, {{CONTROLADORA_RAZAO_SOCIAL}}, {{CONTROLADORA_CNPJ}}, {{ENCARREGADO_NOME}}/{{ENCARREGADO_EMAIL}}/{{ENCARREGADO_CANAL}}, {{FORO_CIDADE_UF}}.</span>
					<template #action>
						<q-btn flat color="orange-10" label="Ver arquivo público" type="a" href="/legal/politica-privacidade-crowdfunding.md" target="_blank" />
					</template>
				</q-banner>

				<!-- Sumário (mobile) -->
				<div class="q-mb-xl lt-md">
					<h2 class="section-title q-mb-sm">Sumário</h2>
					<ul class="toc">
						<li><a href="#quem-somos">1. Quem somos</a></li>
						<li><a href="#dados">2. Quais dados tratamos</a></li>
						<li><a href="#finalidades">3. Finalidades e bases legais</a></li>
						<li><a href="#cookies">4. Cookies e tecnologias similares</a></li>
						<li><a href="#compartilhamento">5. Com quem compartilhamos</a></li>
						<li><a href="#transferencias">6. Transferências internacionais</a></li>
						<li><a href="#seguranca">7. Segurança da informação</a></li>
						<li><a href="#retencao">8. Retenção e descarte</a></li>
						<li><a href="#direitos">9. Direitos dos titulares</a></li>
						<li><a href="#menores">10. Uso por menores</a></li>
						<li><a href="#atualizacoes">11. Atualizações desta Política</a></li>
						<li><a href="#contato">12. Contato do Encarregado/DPO</a></li>
					</ul>
				</div>

				<div class="row q-col-gutter-xl content-grid">
					<div class="col-12 col-md-9">
						<!-- Seções -->
						<q-card flat bordered class="section-card q-mb-lg" id="quem-somos">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="info" class="q-mr-sm" />1. Quem somos</h3>
						<p><strong>Controladora:</strong> {{CONTROLADORA_RAZAO_SOCIAL}} (CNPJ: {{CONTROLADORA_CNPJ}}), com sede em {{CONTROLADORA_ENDERECO}}. Operamos a plataforma <strong>{{PLATAFORMA_NOME}}</strong> em <strong>{{PLATAFORMA_URL}}</strong>.</p>
						<p><strong>Encarregado/DPO:</strong> {{ENCARREGADO_NOME}} — {{ENCARREGADO_EMAIL}} — {{ENCARREGADO_CANAL}}.</p>
						<p>Seguimos a LGPD, o Marco Civil da Internet e normas da ANPD.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="dados">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="folder" class="q-mr-sm" />2. Quais dados tratamos</h3>
						<ul class="nice-list">
							<li><strong>Conta/Identificação:</strong> nome, e-mail, CPF/CNPJ, data de nascimento, telefone.</li>
							<li><strong>Campanhas:</strong> título, descrição, mídia, metas, recompensas.</li>
							<li><strong>Transações:</strong> valores, horários, <em>tokens/IDs</em> do pagamento (não armazenamos PAN/CVV).</li>
							<li><strong>Fiscais:</strong> emissão de notas e relatórios.</li>
							<li><strong>Uso:</strong> logs, IP, device, analytics (com consentimento quando aplicável).</li>
							<li><strong>Comunicação:</strong> newsletter, atualizações, suporte.</li>
							<li><strong>Antifraude/KYC:</strong> documentos e validações quando exigidos.</li>
							<li><strong>Cookies:</strong> necessários, desempenho, funcionalidade e publicidade.</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="finalidades">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="playlist_add_check" class="q-mr-sm" />3. Finalidades e bases legais</h3>
						<ul class="nice-list">
							<li><strong>Execução de contrato:</strong> cadastro, login, campanhas, apoios, repasses, comunicações transacionais.</li>
							<li><strong>Obrigação legal/regulatória:</strong> fiscal/contábil, prevenção à lavagem de dinheiro.</li>
							<li><strong>Legítimo interesse (com LIA):</strong> segurança, antifraude, melhorias, analytics restrito.</li>
							<li><strong>Consentimento:</strong> marketing e cookies não necessários (revogável a qualquer tempo).</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="cookies">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="cookie" class="q-mr-sm" />4. Cookies e tecnologias similares</h3>
						<p>Utilizamos cookies necessários à operação e, com seu consentimento, cookies para análise e publicidade. Você pode gerenciar preferências no link “Gerenciar Cookies” do rodapé.</p>
						<q-markup-table flat bordered class="q-mt-md">
						<thead>
							<tr>
								<th>Nome</th>
								<th>Tipo</th>
								<th>Finalidade</th>
								<th>Duração</th>
								<th>Terceiro</th>
								<th>Base legal</th>
							</tr>
						</thead>
						<tbody>
							<tr><td>session_id</td><td>Necessário</td><td>Manter sessão</td><td>Sessão</td><td>{{PLATAFORMA_NOME}}</td><td>Contrato</td></tr>
							<tr><td>csrf_token</td><td>Necessário</td><td>Proteção CSRF</td><td>Sessão</td><td>{{PLATAFORMA_NOME}}</td><td>Segurança/Legítimo interesse</td></tr>
							<tr><td>ga_cookie</td><td>Desempenho</td><td>Métricas agregadas</td><td>13 meses</td><td>Google Analytics</td><td>Consentimento</td></tr>
							<tr><td>consent_prefs</td><td>Funcionalidade</td><td>Preferências</td><td>12 meses</td><td>{{PLATAFORMA_NOME}}</td><td>Legítimo interesse</td></tr>
						</tbody>
						</q-markup-table>
						<div class="q-mt-sm row items-center q-col-gutter-sm">
							<q-btn outline color="primary" icon="cookie" label="Gerenciar Cookies" @click="goCookies" />
							<q-btn flat color="primary" icon="help_outline" label="Saiba mais" to="/help" />
						</div>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="compartilhamento">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="share" class="q-mr-sm" />5. Com quem compartilhamos</h3>
						<ul class="nice-list">
							<li><strong>Pagamentos:</strong> {{GATEWAYS_PAGAMENTO}}</li>
							<li><strong>Hospedagem/Infra:</strong> Vercel, AWS S3</li>
							<li><strong>Autenticação:</strong> Clerk</li>
							<li><strong>Analytics:</strong> {{ANALYTICS}} (apenas com consentimento)</li>
							<li><strong>Comunicação:</strong> Provedor de e-mail ({{SUPORTE_CANAIS}})</li>
						</ul>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="transferencias">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="public" class="q-mr-sm" />6. Transferências internacionais</h3>
						<p>Podem ocorrer com provedores globais. Aplicamos cláusulas padrão, avaliações e medidas suplementares (criptografia/minimização).</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="seguranca">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="security" class="q-mr-sm" />7. Segurança da informação</h3>
						<ul class="nice-list">
							<li><strong>Técnicos:</strong> TLS, criptografia em repouso quando aplicável, segregação, backups, monitoramento, MFA admin.</li>
							<li><strong>Organizacionais:</strong> menor privilégio, gestão de acesso, logs, treinamentos.</li>
						</ul>
						<p>Incidentes relevantes serão comunicados à ANPD e aos titulares. Canal: {{ENCARREGADO_EMAIL}} (SLA inicial até 72h úteis).</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="retencao">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="schedule" class="q-mr-sm" />8. Retenção e descarte</h3>
						<q-markup-table flat bordered>
						<thead>
							<tr><th>Categoria</th><th>Prazo</th><th>Fundamento</th></tr>
						</thead>
						<tbody>
							<tr><td>Dados cadastrais</td><td>Conta ativa + 6 meses</td><td>Contrato/Interesse legítimo limitado</td></tr>
							<tr><td>Campanhas</td><td>Vigência + 12 meses</td><td>Contrato/Histórico</td></tr>
							<tr><td>Financeiro</td><td>5 anos</td><td>Obrigação legal</td></tr>
							<tr><td>Logs de segurança</td><td>{{RETENCAO_LOGS}}</td><td>Interesse legítimo</td></tr>
							<tr><td>Marketing (consentido)</td><td>Até revogação</td><td>Consentimento</td></tr>
						</tbody>
						</q-markup-table>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="direitos">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="how_to_reg" class="q-mr-sm" />9. Direitos dos titulares</h3>
						<p>Para exercer seus direitos (acesso, correção, portabilidade, eliminação, informação, revogação, oposição), contate: {{ENCARREGADO_EMAIL}} / {{ENCARREGADO_CANAL}}. Resposta em até 15 dias, mediante comprovação de identidade.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="menores">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="child_care" class="q-mr-sm" />10. Uso por menores</h3>
						<p>{{MENORES_POLITICA}}. Em tentativas de uso indevido, bloquearemos a conta e trataremos solicitações de eliminação.</p>
					</q-card-section>
				</q-card>

				<q-card flat bordered class="section-card q-mb-lg" id="atualizacoes">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="update" class="q-mr-sm" />11. Atualizações desta Política</h3>
						<p>Esta Política pode ser atualizada para refletir mudanças legais ou operacionais. Manteremos versão e changelog.</p>
					</q-card-section>
				</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="contato">
					<q-card-section>
						<h3 class="section-heading"><q-icon name="contact_mail" class="q-mr-sm" />12. Contato do Encarregado/DPO</h3>
						<p>{{ENCARREGADO_NOME}} — {{ENCARREGADO_EMAIL}} — {{ENCARREGADO_CANAL}}</p>
					</q-card-section>
				</q-card>

						<div class="version-box">
					<div class="row items-center q-col-gutter-sm">
						<q-chip size="sm" color="grey-2" text-color="grey-9" icon="article">Versão 1.0.0</q-chip>
						<q-chip size="sm" color="grey-2" text-color="grey-9" icon="event">Atualizada em 05/11/2025</q-chip>
					</div>
					<div class="changelog">Changelog: versão inicial com mapeamento de dados, cookies e retenção.</div>
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

const dpoEmail = '{{ENCARREGADO_EMAIL}}'
const showBackToTop = ref(false)
const activeId = ref<string>('quem-somos')
const cookieDialog = ref(false)
const prefs = ref({
  necessary: true,
  performance: false,
  functionality: false,
  marketing: false
})

const toc = [
  { id: 'quem-somos', label: '1. Quem somos' },
  { id: 'dados', label: '2. Quais dados tratamos' },
  { id: 'finalidades', label: '3. Finalidades e bases legais' },
  { id: 'cookies', label: '4. Cookies e tecnologias' },
  { id: 'compartilhamento', label: '5. Compartilhamento' },
  { id: 'transferencias', label: '6. Transferências' },
  { id: 'seguranca', label: '7. Segurança' },
  { id: 'retencao', label: '8. Retenção' },
  { id: 'direitos', label: '9. Direitos' },
  { id: 'menores', label: '10. Menores' },
  { id: 'atualizacoes', label: '11. Atualizações' },
  { id: 'contato', label: '12. Contato' }
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
  // Load stored prefs
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
[data-theme='dark'] .legal-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
.fab-top { position: fixed; bottom: 24px; right: 24px; z-index: 1000; box-shadow: 0 6px 18px rgba(0,0,0,.18); }
[data-theme='dark'] .legal-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>


