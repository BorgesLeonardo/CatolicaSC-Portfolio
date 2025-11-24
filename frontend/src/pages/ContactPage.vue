<template>
  <q-page class="bg-surface">
    <section class="support-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge"><q-icon name="support_agent" class="q-mr-xs" />Suporte</div>
          <h1 class="hero-title">Contato</h1>
          <p class="hero-subtitle">Envie sua mensagem para nosso time de suporte.</p>
        </div>
      </div>
    </section>

    <section class="q-py-xl bg-surface">
      <div class="container">
        <q-card flat bordered class="contact-card">
          <q-card-section class="q-pa-lg">
            <q-form @submit.prevent="submit" class="q-gutter-md form-grid">
              <div class="row q-col-gutter-md items-stretch">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.name" label="Nome" outlined dense :rules="[v => !!v || 'Informe seu nome']">
                    <template #prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.email" label="E-mail" type="email" outlined dense :rules="[rules.email]">
                    <template #prepend>
                      <q-icon name="mail" />
                    </template>
                  </q-input>
                </div>
              </div>
              <q-select v-model="form.topic" :options="topics" label="Assunto" outlined dense emit-value map-options :rules="[v => !!v || 'Selecione um assunto']">
                <template #prepend>
                  <q-icon name="label" />
                </template>
              </q-select>
              <div class="message-field">
                <label class="message-label">Mensagem</label>
                <div class="message-wrapper">
                  <q-icon name="chat" class="message-icon" />
                  <textarea
                    ref="messageRef"
                    v-model="form.message"
                    class="message-textarea"
                    rows="4"
                    placeholder="Digite sua mensagem"
                    @input="resizeMessage"
                  />
                </div>
                <div class="message-hint">Descreva sua dúvida (mín. 10 caracteres)</div>
              </div>
              <div class="row justify-end">
                <q-btn label="Enviar" color="primary" type="submit" :loading="sending" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, nextTick } from 'vue'
import { Notify } from 'quasar'

const form = reactive({ name: '', email: '', topic: '', message: '' })
const sending = ref(false)
const messageRef = ref<HTMLTextAreaElement | null>(null)

const topics = [
  { label: 'Dúvida geral', value: 'general' },
  { label: 'Problemas com pagamento', value: 'payment' },
  { label: 'Ajuda com minha campanha', value: 'campaign' },
  { label: 'Sugestão de melhoria', value: 'suggestion' }
]

// Validação de e-mail sem regex para evitar backtracking (linear)
function isAlphaNumHyphen(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    const isDigit = ch >= 48 && ch <= 57
    const isUpper = ch >= 65 && ch <= 90
    const isLower = ch >= 97 && ch <= 122
    if (!(isDigit || isUpper || isLower || str[i] === '-')) return false
  }
  return true
}

function isSafeEmail(value: string): boolean {
  const v = String(value ?? '').trim()
  if (v.length === 0) return false
  const atIndex = v.indexOf('@')
  if (atIndex <= 0 || atIndex !== v.lastIndexOf('@') || atIndex === v.length - 1) return false
  const local = v.slice(0, atIndex)
  const domain = v.slice(atIndex + 1)
  if (local.length === 0 || domain.length === 0) return false
  if (domain.startsWith('.') || domain.endsWith('.')) return false
  const labels = domain.split('.')
  if (labels.length < 2) return false
  for (const label of labels) {
    if (label.length === 0 || label.length > 63) return false
    if (label.startsWith('-') || label.endsWith('-')) return false
    if (!isAlphaNumHyphen(label)) return false
  }
  // TLD mínimo 2 caracteres
  if (labels[labels.length - 1].length < 2) return false
  return true
}

const rules = {
  email: (v: string) => isSafeEmail(v) || 'E-mail inválido'
}

async function submit() {
  sending.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  sending.value = false
  if (!form.message || form.message.trim().length < 10) {
    Notify.create({ message: 'Descreva sua dúvida (mín. 10 caracteres).', color: 'warning', position: 'top-right' })
    return
  }
  Notify.create({ message: 'Mensagem enviada! Retornaremos em breve.', color: 'positive', position: 'top-right' })
  form.name = ''
  form.email = ''
  form.topic = ''
  form.message = ''
}

// Ajuste programático de altura do textarea (fallback para garantir autogrow)
function resizeMessage() {
  const maxHeight = Math.floor(window.innerHeight * 0.4) // 40vh
  const el = messageRef.value
  if (!el) return
  el.style.height = 'auto'
  const newHeight = Math.min(el.scrollHeight, maxHeight)
  el.style.height = newHeight + 'px'
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

watch(() => form.message, async () => {
  await nextTick()
  resizeMessage()
})

onMounted(() => {
  resizeMessage()
})
</script>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 0 32px; }
.support-hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%); color: #fff; padding: 72px 0 56px; }
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 16px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0; }
.contact-card { border-radius: 14px; }
.contact-card :deep(.q-card__section) { padding-top: 24px; padding-bottom: 24px; }
.contact-card :deep(.q-field:not(.q-field--textarea) .q-field__control) { height: 44px; border-radius: 12px; }
.contact-card :deep(.q-field--auto-height .q-field__control) { height: auto; }
[data-theme='dark'] .support-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }

/* Ajustes de UX */
.message-field { display: block; }
.message-label { display: block; font-size: 12px; color: #6b7280; margin-left: 44px; margin-bottom: 4px; }
.message-wrapper { position: relative; }
.message-icon { position: absolute; left: 12px; top: 12px; color: #64748b; z-index: 1; }
.message-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 12px 12px 40px;
  border: 1px solid #cfd4dc;
  border-radius: 12px;
  background: transparent;
  font-size: 14px;
  line-height: 1.4;
  min-height: 120px;
  max-height: 40vh;
  overflow: hidden;
  outline: none;
  resize: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.message-textarea:focus { border-color: #1e40af; box-shadow: 0 0 0 2px rgba(30,64,175,0.12); }
.message-hint { margin-top: 6px; font-size: 12px; color: #94a3b8; }
.contact-card :deep(input:-webkit-autofill),
.contact-card :deep(textarea:-webkit-autofill),
.contact-card :deep(select:-webkit-autofill) { 
  -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
  -webkit-text-fill-color: inherit !important;
  transition: background-color 9999s ease-out 0s;
}
[data-theme='dark'] .contact-card :deep(input:-webkit-autofill),
[data-theme='dark'] .contact-card :deep(textarea:-webkit-autofill),
[data-theme='dark'] .contact-card :deep(select:-webkit-autofill) { 
  -webkit-box-shadow: 0 0 0px 1000px #0b1220 inset !important;
}
</style>


