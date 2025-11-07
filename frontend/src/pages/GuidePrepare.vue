<template>
	<q-page>
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="menu_book" class="q-mr-xs" />Guia</div>
					<h1 class="hero-title">Como preparar a página da campanha</h1>
					<p class="hero-subtitle">Texto, imagens, vídeo e recompensas que convertem.</p>
				</div>
			</div>
		</section>

		<section class="q-py-xl bg-surface">
			<div class="container">
				<div class="row q-col-gutter-xl content-grid">
					<div class="col-12 col-md-9">
						<q-card flat bordered class="section-card q-mb-lg" id="estrutura">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="article" class="q-mr-sm" />1. Estrutura da página</h3>
								<ul class="nice-list">
									<li><strong>Título claro:</strong> objetivo + benefício principal.</li>
									<li><strong>Resumo inicial:</strong> 2–3 linhas com o porquê e para quê.</li>
									<li><strong>História:</strong> problema, solução, impacto esperado.</li>
									<li><strong>CTA visível:</strong> botões de apoiar acima da dobra.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="midia">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="movie" class="q-mr-sm" />2. Mídia (imagens e vídeo)</h3>
								<ul class="nice-list">
									<li>Vídeo curto (60–120s) com pitch, equipe e pedido claro.</li>
									<li>Imagens nítidas do produto/beneficiários antes/depois.</li>
									<li>Capriche nas capas: contraste, legibilidade e identidade visual.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="recompensas">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="card_giftcard" class="q-mr-sm" />3. Recompensas</h3>
								<ul class="nice-list">
									<li>De 3 a 6 níveis; comece com uma opção acessível.</li>
									<li>Descrição objetiva do que será entregue e quando.</li>
									<li>Crie um nível "recomendado" com melhor valor percebido.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="checklist">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="playlist_add_check" class="q-mr-sm" />4. Checklist final</h3>
								<ul class="nice-list">
									<li>Ortografia revisada e links funcionando.</li>
									<li>Transparência sobre riscos e próximos passos.</li>
									<li>Plano de atualização para a comunidade.</li>
								</ul>
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
								<q-item clickable @click="scrollTo('estrutura')"><q-item-section>Estrutura</q-item-section></q-item>
								<q-item clickable @click="scrollTo('midia')"><q-item-section>Mídia</q-item-section></q-item>
								<q-item clickable @click="scrollTo('recompensas')"><q-item-section>Recompensas</q-item-section></q-item>
								<q-item clickable @click="scrollTo('checklist')"><q-item-section>Checklist</q-item-section></q-item>
							</q-list>
						</q-card>
					</div>
				</div>
			</div>
		</section>
	</q-page>
</template>

<script setup lang="ts">
function scrollTo(id: string) {
	const el = document.getElementById(id)
	if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.container { max-width: 1120px; margin: 0 auto; padding: 0 32px; }
.legal-hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%); color: #fff; padding: 72px 0 40px; }
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display:inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 14px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0 0 16px 0; }
.content-grid { align-items: flex-start; }
.toc-card { position: sticky; top: 96px; border-radius: 14px; }
.section-heading { font-weight: 800; margin-bottom: 8px; letter-spacing: -0.01em; }
.section-card { border-radius: 14px; }
[data-theme='dark'] .legal-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>






