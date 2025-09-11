<template>
  <div class="q-pa-md q-mx-auto" style="max-width: 760px">
    <SignedOut>
      <q-card flat bordered class="q-pa-lg">
        <div class="text-h6 q-mb-md">Você precisa estar autenticado</div>
        <SignInButton mode="modal">
          <q-btn color="primary" label="Entrar com Clerk" />
        </SignInButton>
      </q-card>
    </SignedOut>

    <SignedIn>
      <q-card flat bordered class="q-pa-lg">
        <div class="text-h6 q-mb-md">Nova Campanha</div>

        <q-form @submit.prevent="submit">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.title"
                label="Título"
                :rules="[rules.required, rules.minTitle, rules.maxTitle]"
                :error="!!fieldErrors.title"
                :error-message="fieldErrors.title"
                dense
                filled
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.description"
                type="textarea"
                autogrow
                label="Descrição (opcional)"
                :error="!!fieldErrors.description"
                :error-message="fieldErrors.description"
                filled
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.goalReais"
                label="Meta (R$)"
                type="text"
                hint="Digite em reais, ex.: 150,00"
                :rules="[rules.required]"
                :error="!!fieldErrors.goalCents"
                :error-message="fieldErrors.goalCents"
                dense
                filled
                inputmode="decimal"
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="form.date"
                label="Data limite"
                type="date"
                :rules="[rules.required]"
                :error="!!fieldErrors.deadline"
                :error-message="fieldErrors.deadline"
                dense
                filled
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="form.time"
                label="Hora limite (opcional)"
                type="time"
                dense
                filled
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.imageUrl"
                label="Imagem (URL, opcional)"
                :rules="[rules.url]"
                :error="!!fieldErrors.imageUrl"
                :error-message="fieldErrors.imageUrl"
                dense
                filled
              />
            </div>
          </div>

          <div class="q-mt-lg flex items-center">
            <q-btn
              color="primary"
              label="Criar campanha"
              type="submit"
              :loading="loading"
            />
            <q-spinner v-if="loading" class="q-ml-md" />
          </div>
        </q-form>
      </q-card>
    </SignedIn>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/vue'
import { http } from 'src/utils/http'
import { Notify } from 'quasar'
import { reaisToCents } from 'src/utils/money'
import { mergeDateTimeToISO } from 'src/utils/datetime'

const router = useRouter()
const { getToken } = useAuth()

const loading = ref(false)

// estado do formulário
const form = reactive({
  title: '',
  description: '',
  goalReais: '',     // usuário digita em reais (ex.: 50,00)
  date: '',          // YYYY-MM-DD (QDate)
  time: '23:59',     // HH:mm (QTime) - default
  imageUrl: ''
})

// erros por campo (vindos do backend)
const fieldErrors = reactive<Record<string, string>>({})

// regras simples (frontend)
const rules = {
  required: (v: unknown) => (!!v || v === 0) || 'Obrigatório',
  minTitle: (v: string) => (v?.length >= 3) || 'Mínimo de 3 caracteres',
  maxTitle: (v: string) => (v?.length <= 120) || 'Máximo de 120 caracteres',
  url: (v: string) => (!v || /^https?:\/\//i.test(v)) || 'URL inválida (use http/https)'
}

async function submit() {
  fieldErrors.title = ''
  fieldErrors.description = ''
  fieldErrors.goalCents = ''
  fieldErrors.deadline = ''
  fieldErrors.imageUrl = ''

  // validação mínima frontend
  if (!form.title || form.title.length < 3) { fieldErrors.title = 'Título muito curto'; return }
  if (!form.goalReais) { fieldErrors.goalCents = 'Informe a meta em reais'; return }
  if (!form.date) { fieldErrors.deadline = 'Selecione a data limite'; return }

  const token = await getToken.value?.()
  if (!token) {
    Notify.create({ type: 'warning', message: 'Faça login para criar campanhas.' })
    return
  }

  const goalCents = reaisToCents(form.goalReais)
  const deadline = mergeDateTimeToISO(form.date, form.time)

  loading.value = true
  try {
    await http.post('/api/projects', {
      title: form.title,
      description: form.description || undefined,
      goalCents,
      deadline,
      imageUrl: form.imageUrl || undefined,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    Notify.create({ type: 'positive', message: 'Campanha criada com sucesso!' })
    // redireciona (ex.: para "Minhas campanhas")
    await router.push('/me')
  } catch (err: unknown) {
    const error = err as { response?: { status?: number; data?: { issues?: { fieldErrors?: Record<string, string | string[]> } } } }
    const status = error?.response?.status
    const resp = error?.response?.data

    if (status === 400 && resp?.issues?.fieldErrors) {
      // mapeia erros do Zod para os campos
      const fe = resp.issues.fieldErrors
      for (const key of Object.keys(fe)) {
        const msg = Array.isArray(fe[key]) ? fe[key][0] : String(fe[key])
        // backend usa 'deadline' e 'goalCents' — mantenha nomes iguais aqui
        fieldErrors[key] = msg
      }
      Notify.create({ type: 'negative', message: 'Verifique os campos destacados.' })
    } else if (status === 401) {
      Notify.create({ type: 'warning', message: 'Sessão expirada. Entre novamente.' })
      await router.push('/sign-in')
    } else {
      Notify.create({ type: 'negative', message: 'Erro ao criar campanha.' })
      console.error(err)
    }
  } finally {
    loading.value = false
  }
}
</script>
