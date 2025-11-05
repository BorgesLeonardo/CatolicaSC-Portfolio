<template>
	<q-page>
		<section class="legal-hero">
			<div class="container">
				<div class="hero-content">
					<div class="hero-badge"><q-icon name="gavel" class="q-mr-xs" />Termos de Uso</div>
					<h1 class="hero-title">Você precisa aceitar os Termos para continuar</h1>
					<p class="hero-subtitle">Leia atentamente os Termos de Uso. Para usar a plataforma, é necessário concordar com a versão vigente.</p>
					<div class="hero-actions">
						<q-btn color="primary" unelevated label="Ver Termos (arquivo público)" href="/legal/termos-uso-crowdfunding.md" target="_blank" />
						<q-btn flat color="white" icon="policy" label="Ver Política de Privacidade" to="/privacy" />
					</div>
				</div>
			</div>
		</section>

		<section class="q-py-xl bg-surface">
			<div class="container">
				<q-card flat bordered class="q-pa-md q-mx-auto" style="max-width: 880px;">
					<q-card-section>
						<div class="text-h6 q-mb-xs">Declaração de concordância</div>
						<p class="q-mt-xs">Ao clicar em "Concordo com os Termos", você declara que leu e concorda com a versão {{ termsVersion }} dos Termos de Uso e compreende as regras de uso da plataforma.</p>
					</q-card-section>
					<q-separator />
					<q-card-actions align="between" class="q-pa-md">
						<q-btn outline color="negative" icon="logout" :loading="signingOut" label="Não concordo" @click="decline" />
						<q-btn color="primary" unelevated icon="check_circle" :loading="saving" label="Concordo com os Termos" @click="accept" />
					</q-card-actions>
				</q-card>
			</div>
		</section>
	</q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@clerk/vue'
import { TERMS_VERSION, hasAcceptedCurrentTerms, setTermsAccepted } from 'src/utils/consent'

const route = useRoute()
const router = useRouter()
const { user } = useUser()

const saving = ref(false)
const signingOut = ref(false)
const termsVersion = TERMS_VERSION

function redirectAfter(): void {
  const target = typeof route.query.redirect === 'string' && route.query.redirect
    ? String(route.query.redirect)
    : '/'
  void router.replace(target)
}

function accept() {
  if (!user.value?.id) return
  saving.value = true
  try {
    setTermsAccepted(user.value.id)
    redirectAfter()
  } finally {
    saving.value = false
  }
}

async function decline() {
  signingOut.value = true
  try {
    const g = globalThis as unknown as { Clerk?: { signOut?: () => Promise<void> } }
    if (g?.Clerk?.signOut) {
      await g.Clerk.signOut()
    }
    await router.replace('/sign-in')
  } finally {
    signingOut.value = false
  }
}

onMounted(() => {
  const uid = user.value?.id
  if (uid && hasAcceptedCurrentTerms(uid)) {
    redirectAfter()
  }
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
</style>
