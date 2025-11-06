<template>
  <q-page>
    <section class="support-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge"><q-icon name="menu_book" class="q-mr-xs" />Suporte</div>
          <h1 class="hero-title">Guias</h1>
          <p class="hero-subtitle">Passo a passo para ter sucesso com sua campanha.</p>
        </div>
      </div>
    </section>

    <section class="q-py-xl bg-surface">
      <div class="container">
        <div class="row q-col-gutter-lg">
          <div v-for="(g, i) in guides" :key="i" class="col-12 col-md-6">
            <q-card flat bordered class="hover-card">
              <q-card-section>
                <div class="text-subtitle1 q-mb-xs">{{ g.title }}</div>
                <div class="text-caption text-grey-7 q-mb-md">{{ g.caption }}</div>
                <q-btn :to="`/guides/${g.slug}`" label="LER GUIA" color="primary" flat icon="menu_book" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
const guides = [
  { title: 'Como preparar a página da campanha', caption: 'Texto, imagens, vídeo e recompensas', slug: 'prepare' },
  { title: 'Melhores práticas para divulgação', caption: 'Como alcançar apoiadores', slug: 'promotion' },
  { title: 'Definindo meta e prazo', caption: 'Equilíbrio entre ambição e realismo', slug: 'goal-deadline' },
  { title: 'Construindo confiança', caption: 'Transparência e atualizações', slug: 'trust' }
]
</script>

<style scoped>
.container { max-width: 920px; margin: 0 auto; padding: 0 32px; }
.support-hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%); color: #fff; padding: 72px 0 56px; }
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 16px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0; }
.hover-card { transition: transform .15s ease, box-shadow .15s ease; border-radius: 14px; }
.hover-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.12); }
[data-theme='dark'] .support-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>


