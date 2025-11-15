<template>
  <q-page class="bg-surface">
    <!-- Hero padronizado -->
    <section class="support-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge"><q-icon name="support" class="q-mr-xs" />Suporte</div>
          <h1 class="hero-title">Central de Ajuda</h1>
          <p class="hero-subtitle">Encontre respostas rápidas ou fale com a gente.</p>

          <div class="search-wrapper">
            <q-input
              v-model="search"
              outlined
              dense
              placeholder="Buscar ajuda (ex.: pagamentos, assinatura)"
              :debounce="300"
              clearable
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </section>

    <section class="q-py-xl bg-surface">
      <div class="container">
        <div class="row q-col-gutter-lg q-mb-xl">
          <div class="col-12 col-md-4">
            <q-card flat bordered class="hover-card" @click="go('/faq')">
              <q-card-section class="row items-center">
                <q-icon name="quiz" color="primary" size="md" class="q-mr-md" />
                <div>
                  <div class="text-subtitle1">FAQ</div>
                  <div class="text-caption text-grey-7">Perguntas frequentes</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4">
            <q-card flat bordered class="hover-card" @click="go('/guides')">
              <q-card-section class="row items-center">
                <q-icon name="menu_book" color="primary" size="md" class="q-mr-md" />
                <div>
                  <div class="text-subtitle1">Guias</div>
                  <div class="text-caption text-grey-7">Passo a passo para usar a plataforma</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4">
            <q-card flat bordered class="hover-card" @click="go('/contact')">
              <q-card-section class="row items-center">
                <q-icon name="support_agent" color="primary" size="md" class="q-mr-md" />
                <div>
                  <div class="text-subtitle1">Contato</div>
                  <div class="text-caption text-grey-7">Fale com nosso suporte</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div>
          <h2 class="section-title q-mb-md">Tópicos populares</h2>
          <q-list bordered separator class="rounded-borders card-list">
            <q-item v-for="(item, i) in filteredPopular" :key="i" clickable @click="go(item.to)">
              <q-item-section avatar>
                <q-icon :name="item.icon" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
                <q-item-label caption>{{ item.caption }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')

const popular = [
  { to: '/faq', icon: 'payments', label: 'Pagamentos e reembolsos', caption: 'Como funcionam as contribuições' },
  { to: '/guides', icon: 'upload_file', label: 'Imagens e vídeos', caption: 'Dicas para materiais da campanha' },
  { to: '/contact', icon: 'mail', label: 'Falar com suporte', caption: 'Canais oficiais de atendimento' }
]

function go(path: string) {
  void router.push(path)
}

const filteredPopular = computed(() => {
  const q = (search.value || '').toLowerCase().trim()
  if (!q) return popular
  return popular.filter(p =>
    p.label.toLowerCase().includes(q) ||
    p.caption.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
.container { max-width: 1120px; margin: 0 auto; padding: 0 32px; }

.support-hero { 
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%);
  color: #fff;
  padding: 72px 0 56px;
}
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 16px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0 0 20px 0; }
.search-wrapper { max-width: 640px; margin: 0 auto; }
.search-input :deep(.q-field__control) {
  border-radius: 14px;
  height: 52px;
  background: #ffffff; /* fundo branco */
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 16px rgba(2, 6, 23, 0.06);
}
.search-input :deep(.q-field__inner) { align-items: center; }
.search-input :deep(.q-field__prepend) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 12px;
  color: #64748b; /* cor da lupa */
}
.search-input :deep(.q-field__prepend .q-icon) { font-size: 20px; }
.search-input :deep(.q-field__native) {
  background: transparent;
  color: #0f172a;
  padding-top: 12px;
  padding-bottom: 12px;
}
.search-input :deep(.q-placeholder) { color: rgba(15, 23, 42, 0.6); }
.search-input :deep(.q-field--focused .q-field__control) {
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.14);
}

.section-title { font-weight: 800; letter-spacing: -0.02em; }
.hover-card { cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; border-radius: 14px; }
.hover-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.12); }
.card-list { border-radius: 14px; }

[data-theme='dark'] .support-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>


