<template>
	<q-page>
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="campaign" class="q-mr-xs" />Guia</div>
					<h1 class="hero-title">Melhores práticas para divulgação</h1>
					<p class="hero-subtitle">Como alcançar apoiadores antes, durante e depois do lançamento.</p>
				</div>
			</div>
		</section>

		<section class="q-py-xl bg-surface">
			<div class="container">
				<div class="row q-col-gutter-xl content-grid">
					<div class="col-12 col-md-9">
						<q-card flat bordered class="section-card q-mb-lg" id="pre">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="bolt" class="q-mr-sm" />1. Pré-lançamento</h3>
								<ul class="nice-list">
									<li>Crie lista de espera (e-mail/WhatsApp) com convite e data.</li>
									<li>Prepare materiais: imagens, vídeo teaser, perguntas e respostas.</li>
									<li>Defina metas de dia 1 (amigos/família) para tração inicial.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="lancamento">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="rocket_launch" class="q-mr-sm" />2. Lançamento</h3>
								<ul class="nice-list">
									<li>Anuncie em todos os canais no mesmo dia e horário.</li>
									<li>Use storytelling e um pedido específico (valor/ação).</li>
									<li>Incentive compartilhamentos com um pacote de mídias pronto.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="pos">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="auto_awesome" class="q-mr-sm" />3. Pós-lançamento</h3>
								<ul class="nice-list">
									<li>Atualizações semanais com progresso e próximos passos.</li>
									<li>Clipes curtos (reels) mostrando bastidores e resultados.</li>
									<li>Parcerias/comunidades alinhadas ao tema da campanha.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="mensagens">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="mail" class="q-mr-sm" />4. Mensagens eficazes</h3>
								<ul class="nice-list">
									<li>Mostre impacto por contribuição (R$ → resultado concreto).</li>
									<li>Prove urgência com marcos e prazos.</li>
									<li>Call to action único por publicação.</li>
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
								<q-item clickable @click="scrollTo('pre')"><q-item-section>Pré-lançamento</q-item-section></q-item>
								<q-item clickable @click="scrollTo('lancamento')"><q-item-section>Lançamento</q-item-section></q-item>
								<q-item clickable @click="scrollTo('pos')"><q-item-section>Pós-lançamento</q-item-section></q-item>
								<q-item clickable @click="scrollTo('mensagens')"><q-item-section>Mensagens</q-item-section></q-item>
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








