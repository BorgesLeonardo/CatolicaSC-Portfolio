<template>
	<q-page>
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="verified_user" class="q-mr-xs" />Guia</div>
					<h1 class="hero-title">Construindo confiança</h1>
					<p class="hero-subtitle">Transparência, atualizações e provas sociais para engajar.</p>
				</div>
			</div>
		</section>

		<section class="q-py-xl bg-surface">
			<div class="container">
				<div class="row q-col-gutter-xl content-grid">
					<div class="col-12 col-md-9">
						<q-card flat bordered class="section-card q-mb-lg" id="transparencia">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="visibility" class="q-mr-sm" />1. Transparência</h3>
								<ul class="nice-list">
									<li>Explique riscos, limitações e como usará os recursos.</li>
									<li>Mostre orçamento resumido e cronograma.</li>
									<li>Política clara de reembolsos e mudanças.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="atualizacoes">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="update" class="q-mr-sm" />2. Atualizações</h3>
								<ul class="nice-list">
									<li>Publique semanalmente progresso, aprendizados e próximos passos.</li>
									<li>Responda comentários com rapidez e cordialidade.</li>
									<li>Use métricas e fotos para evidenciar avanços.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="provas">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="reviews" class="q-mr-sm" />3. Provas sociais</h3>
								<ul class="nice-list">
									<li>Depoimentos de clientes/beneficiários.</li>
									<li>Parcerias e certificações relevantes.</li>
									<li>Materiais de imprensa e links verificados.</li>
								</ul>
							</q-card-section>
						</q-card>

						<q-card flat bordered class="section-card q-mb-lg" id="plano">
							<q-card-section>
								<h3 class="section-heading"><q-icon name="fact_check" class="q-mr-sm" />4. Riscos e plano B</h3>
								<ul class="nice-list">
									<li>Liste riscos principais e mitigadores.</li>
									<li>Defina gatilhos para ajustes de rota.</li>
									<li>Comunique mudanças com antecedência e respeito.</li>
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
								<q-item clickable @click="scrollTo('transparencia')"><q-item-section>Transparência</q-item-section></q-item>
								<q-item clickable @click="scrollTo('atualizacoes')"><q-item-section>Atualizações</q-item-section></q-item>
								<q-item clickable @click="scrollTo('provas')"><q-item-section>Provas sociais</q-item-section></q-item>
								<q-item clickable @click="scrollTo('plano')"><q-item-section>Riscos e plano B</q-item-section></q-item>
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






