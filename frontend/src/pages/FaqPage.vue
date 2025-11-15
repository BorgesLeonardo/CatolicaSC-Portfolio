<template>
  <q-page class="bg-surface">
    <section class="support-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge"><q-icon name="quiz" class="q-mr-xs" />Suporte</div>
          <h1 class="hero-title">FAQ</h1>
          <p class="hero-subtitle">Principais dúvidas sobre o uso da plataforma.</p>
        </div>
      </div>
    </section>

    <section class="q-py-xl bg-surface">
      <div class="container">
        <q-list bordered class="rounded-borders faq-list">
          <q-expansion-item
            v-for="(faq, i) in faqs"
            :key="i"
            expand-icon="expand_more"
            :label="faq.q"
          >
            <q-card flat>
              <q-card-section class="text-body2">{{ faq.a }}</q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
const faqs = [
  { q: 'Como crio uma campanha?', a: 'Acesse Campanhas > Criar Projeto, preencha as informações básicas, meta e prazo. Publique quando estiver pronto.' },
  { q: 'Como realizar uma contribuição?', a: 'Abra a página da campanha e clique em Contribuir. O pagamento é processado com segurança pela Stripe.' },
  { q: 'Posso editar minha campanha depois de publicar?', a: 'Sim. Você pode atualizar descrição, imagens e metas (quando permitido) em Minhas Campanhas.' },
  { q: 'Como funcionam reembolsos?', a: 'Projetos com problemas podem ser analisados. Entre em contato com o suporte com o número do pedido.' },
  { q: 'Assinaturas recorrentes estão disponíveis?', a: 'Sim, campanhas podem habilitar assinaturas mensais. O cancelamento é possível a qualquer momento.' }
]
</script>

<style scoped>
.container { max-width: 920px; margin: 0 auto; padding: 0 32px; }
.support-hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%); color: #fff; padding: 72px 0 56px; }
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 16px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0; }
.faq-list { border-radius: 14px; }
[data-theme='dark'] .support-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>


