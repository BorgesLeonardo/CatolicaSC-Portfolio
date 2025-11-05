<template>
	<q-dialog v-model="open" persistent>
		<q-card style="max-width: 820px; width: 100%">
			<q-card-section class="row items-center q-gutter-sm">
				<q-icon name="gavel" color="primary" />
				<div class="text-h6">Termos de Uso — Aceite Necessário</div>
				<q-space />
				<q-chip square color="grey-2" text-color="grey-9" size="sm">Versão {{ version }}</q-chip>
			</q-card-section>
			<q-separator />

			<!-- Reading progress -->
			<q-linear-progress :value="readProgress" color="primary" track-color="grey-3" size="8px" class="q-mb-sm" />

			<q-card-section class="q-pt-none">
				<q-tabs v-model="tab" dense active-color="primary" indicator-color="primary" class="text-primary">
					<q-tab name="resumo" label="Resumo" icon="list_alt" />
					<q-tab name="completo" label="Termos completos" icon="article" />
				</q-tabs>
				<q-separator />
				<q-tab-panels v-model="tab" animated>
					<q-tab-panel name="resumo">
						<div class="q-gutter-md">
							<q-expansion-item icon="info" label="O essencial" default-opened>
								<ul class="nice-list">
									<li>Você deve usar a plataforma de forma lícita e respeitosa.</li>
									<li>Campanhas e contribuições seguem regras de transparência e proibições.</li>
									<li>Pagamentos são processados por terceiros; não armazenamos dados de cartão.</li>
									<li>Podemos atualizar os Termos — avisaremos quando houver mudanças relevantes.</li>
								</ul>
							</q-expansion-item>
							<q-expansion-item icon="security" label="Privacidade e cookies">
								<p>O tratamento de dados segue a Política de Privacidade. Cookies não necessários dependem de consentimento e podem ser gerenciados a qualquer momento.</p>
							</q-expansion-item>
							<q-expansion-item icon="gavel" label="Responsabilidades">
								<ul class="nice-list">
									<li>Podemos suspender contas/campanhas que violem regras.</li>
									<li>Limitação de responsabilidade na máxima medida legal aplicável.</li>
								</ul>
							</q-expansion-item>
						</div>
					</q-tab-panel>
					<q-tab-panel name="completo">
						<div ref="scrollEl" class="terms-viewer" @scroll="onScroll">
							<div v-for="(s, idx) in termsSections" :key="idx" class="q-mb-md">
								<h4 class="q-mt-none q-mb-xs">{{ s.title }}</h4>
								<p v-for="(p, i) in s.paragraphs" :key="i" class="q-mt-none q-mb-xs">{{ p }}</p>
								<ul v-if="s.items && s.items.length" class="q-ml-md">
									<li v-for="(it, k) in s.items" :key="k">{{ it }}</li>
								</ul>
							</div>
						</div>
					</q-tab-panel>
				</q-tab-panels>
			</q-card-section>

			<q-separator />
			<q-card-section class="row items-center q-gutter-sm">
				<q-checkbox v-model="readChecked" color="primary" :label="'Li e concordo com a versão ' + version + ' dos Termos de Uso'" />
			</q-card-section>
			<q-card-actions align="between">
				<q-btn outline color="negative" icon="logout" :loading="signingOut" label="Não concordo" @click="decline" />
				<q-btn color="primary" unelevated icon="check_circle" :disable="!canAccept" :loading="saving" label="Concordo com os Termos" @click="accept" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useUser } from '@clerk/vue'
import { TERMS_VERSION, setTermsAccepted } from 'src/utils/consent'

interface Props {
  modelValue: boolean
  version?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  version: TERMS_VERSION
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'accepted'): void
  (e: 'declined'): void
}>()

const { user } = useUser()
const saving = ref(false)
const signingOut = ref(false)
const tab = ref<'resumo' | 'completo'>('resumo')
const open = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// Inline viewer state (plain text, not markdown)
interface TermsSection { title: string; paragraphs: string[]; items?: string[] }
const termsSections = ref<TermsSection[]>([
  {
    title: '1. Aceitação dos Termos',
    paragraphs: [
      'Ao usar a plataforma você concorda com estes Termos. Se não concordar, não utilize a plataforma.'
    ]
  },
  {
    title: '2. Cadastro e elegibilidade',
    paragraphs: [
      'Exigimos informações verdadeiras e atualizadas, podendo realizar verificações KYC/antifraude quando necessário.'
    ],
    items: ['Idade mínima conforme legislação aplicável', 'Bloqueio de contas em caso de fraude ou uso indevido']
  },
  {
    title: '3. Campanhas',
    paragraphs: [
      'Campanhas devem ter metas claras e respeitar as proibições legais e de conteúdo.'
    ],
    items: ['Transparência com apoiadores', 'Proibido conteúdo ilícito ou ofensivo']
  },
  {
    title: '4. Apoios e pagamentos',
    paragraphs: [
      'Pagamentos são processados por provedores terceirizados. Não armazenamos dados completos de cartão.'
    ]
  },
  {
    title: '5. Propriedade intelectual',
    paragraphs: [
      'Você mantém titularidade do conteúdo e concede licença para exibição e promoção na plataforma.'
    ]
  },
  {
    title: '6. Conduta e uso aceitável',
    paragraphs: [
      'É proibido fraude, spam, engenharia reversa, exploração de vulnerabilidades, assédio e qualquer conduta ilícita.'
    ]
  },
  {
    title: '7. Responsabilidades e isenções',
    paragraphs: [
      'Não garantimos disponibilidade ininterrupta. A responsabilidade é limitada na máxima medida legal.'
    ]
  },
  {
    title: '8. Suspensão/encerramento',
    paragraphs: [
      'Podemos suspender ou encerrar contas/campanhas que violem estes Termos ou a legislação.'
    ]
  },
  {
    title: '9. Privacidade e cookies',
    paragraphs: [
      'O tratamento de dados segue nossa Política de Privacidade. Cookies não necessários dependem de consentimento e podem ser gerenciados nas preferências.'
    ]
  },
  {
    title: '10. Lei aplicável e foro',
    paragraphs: [
      'Aplicam-se as leis do Brasil. Foro eleito conforme regras de proteção ao consumidor e legislação vigente.'
    ]
  },
  {
    title: '11. Atualizações',
    paragraphs: [
      'Estes Termos podem ser atualizados. Manteremos versão e data de atualização.'
    ]
  }
])

const scrollEl = ref<HTMLElement | null>(null)
const readChecked = ref(false)
const readProgress = ref(0)

const canAccept = computed(() => readChecked.value)

function onScroll(): void {
  const el = scrollEl.value
  if (!el) return
  const max = Math.max(1, el.scrollHeight - el.clientHeight)
  const prog = Math.min(1, Math.max(0, el.scrollTop / max))
  readProgress.value = prog
}

function accept(): void {
  const uid = user.value?.id
  if (!uid) return
  saving.value = true
  try {
    setTermsAccepted(uid)
    emit('accepted')
    open.value = false
  } finally {
    saving.value = false
  }
}

async function decline(): Promise<void> {
  signingOut.value = true
  try {
    const g = globalThis as unknown as { Clerk?: { signOut?: () => Promise<void> } }
    if (g?.Clerk?.signOut) {
      await g.Clerk.signOut()
    }
    emit('declined')
  } finally {
    signingOut.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    tab.value = 'resumo'
    readChecked.value = false
    readProgress.value = 0
    setTimeout(() => { onScroll() }, 50)
  }
})

onMounted(() => {
  // nothing to load (plain text terms)
})
</script>

<style scoped>
.terms-viewer { max-height: 340px; overflow: auto; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
.terms-pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 0.875rem; line-height: 1.4; margin: 0; color: #0f172a; }
</style>
