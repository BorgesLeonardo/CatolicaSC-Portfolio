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
        <div class="text-body2 text-grey-6 q-mb-lg">
          <q-icon name="info" class="q-mr-xs" />
          Campos marcados com * são obrigatórios
        </div>

        <q-form @submit.prevent="submit">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.title"
                label="Título *"
                :rules="[rules.required, rules.minTitle, rules.maxTitle]"
                :error="!!fieldErrors.title"
                :error-message="fieldErrors.title"
                dense
                filled
                required
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.description"
                type="textarea"
                autogrow
                label="Descrição *"
                :rules="[rules.required, rules.minDescription]"
                :error="!!fieldErrors.description"
                :error-message="fieldErrors.description"
                filled
                required
              />
            </div>

            <div class="col-12">
              <q-select
                v-model="form.categoryId"
                :options="categoryOptions"
                label="Categoria *"
                emit-value
                map-options
                option-value="id"
                option-label="name"
                :rules="[rules.required]"
                :error="!!fieldErrors.categoryId"
                :error-message="fieldErrors.categoryId"
                filled
                :loading="loadingCategories"
                required
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar v-if="scope.opt.icon">
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption v-if="scope.opt.description">
                        {{ scope.opt.description }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.goalReais"
                label="Meta (R$) *"
                type="text"
                hint="Digite em reais, ex.: 150,00"
                :rules="[rules.required, rules.minGoal]"
                :error="!!fieldErrors.goalCents"
                :error-message="fieldErrors.goalCents"
                dense
                filled
                inputmode="decimal"
                required
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="form.date"
                label="Data limite *"
                type="date"
                :rules="[rules.required, rules.futureDate]"
                :error="!!fieldErrors.deadline"
                :error-message="fieldErrors.deadline"
                dense
                filled
                required
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
                :rules="[rules.imageUrl]"
                :error="!!fieldErrors.imageUrl"
                :error-message="fieldErrors.imageUrl"
                dense
                filled
                lazy-rules
                placeholder="https://exemplo.com/imagem.jpg"
                hint="Cole aqui o link de uma imagem da sua campanha. Exemplos: picsum.photos/800/600 ou imgur.com"
              >
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>
              </q-input>
              
              <!-- Preview da imagem -->
              <div v-if="form.imageUrl && form.imageUrl.length > 10" class="q-mt-sm">
                <div class="text-caption text-grey-6 q-mb-xs">Preview da imagem:</div>
                <q-img 
                  :src="form.imageUrl" 
                  style="max-width: 200px; max-height: 120px; border-radius: 8px;"
                  fit="cover"
                  loading="lazy"
                >
                  <template v-slot:error>
                    <div class="text-negative text-caption">
                      <q-icon name="error" class="q-mr-xs" />
                      URL inválida ou imagem não encontrada
                    </div>
                  </template>
                  <template v-slot:loading>
                    <div class="text-grey-6 text-caption">
                      <q-spinner size="sm" class="q-mr-xs" />
                      Carregando imagem...
                    </div>
                  </template>
                </q-img>
              </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/vue'
import { http } from 'src/utils/http'
import { Notify } from 'quasar'
import { reaisToCents } from 'src/utils/money'
import { mergeDateTimeToISO } from 'src/utils/datetime'
import { categoriesService } from 'src/services/categories'
import type { Category } from 'src/components/models'

const router = useRouter()
const { getToken } = useAuth()

const loading = ref(false)
const loadingCategories = ref(false)

// categorias disponíveis
const categoryOptions = ref<Category[]>([])

// estado do formulário
const form = reactive({
  title: '',
  description: '',
  goalReais: '',     // usuário digita em reais (ex.: 50,00)
  date: '',          // YYYY-MM-DD (QDate)
  time: '23:59',     // HH:mm (QTime) - default
  imageUrl: '',
  categoryId: ''     // ID da categoria selecionada
})

// erros por campo (vindos do backend)
const fieldErrors = reactive<Record<string, string>>({})

// carrega categorias ao montar o componente
onMounted(async () => {
  try {
    loadingCategories.value = true
    categoryOptions.value = await categoriesService.getAll()
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    Notify.create({ 
      type: 'warning', 
      message: 'Não foi possível carregar as categorias' 
    })
  } finally {
    loadingCategories.value = false
  }
})


// regras simples (frontend)
const rules = {
  required: (v: unknown) => (!!v || v === 0) || 'Campo obrigatório',
  minTitle: (v: string) => (v?.length >= 3) || 'Título deve ter pelo menos 3 caracteres',
  maxTitle: (v: string) => (v?.length <= 120) || 'Título deve ter no máximo 120 caracteres',
  minDescription: (v: string) => (v?.length >= 10) || 'Descrição deve ter pelo menos 10 caracteres',
  minGoal: (v: string) => {
    const numValue = parseFloat(v?.replace(',', '.') || '0')
    return numValue > 0 || 'Meta deve ser maior que zero'
  },
  futureDate: (v: string) => {
    if (!v) return true
    const selectedDate = new Date(v)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today || 'Data deve ser hoje ou no futuro'
  },
  imageUrl: (v: string) => {
    if (!v) return true // Campo opcional
    
    // Se não começar com http/https, não valida ainda (pode estar digitando)
    if (!v.startsWith('http://') && !v.startsWith('https://')) {
      return true // Permite continuar digitando
    }
    
    // Só valida URL se parecer completa
    if (v.length > 10) {
      try {
        new URL(v)
        return true
      } catch {
        return 'URL inválida. Use http:// ou https://'
      }
    }
    
    return true
  }
}

async function submit() {
  console.log('🚀 Iniciando criação de campanha...')
  
  fieldErrors.title = ''
  fieldErrors.description = ''
  fieldErrors.goalCents = ''
  fieldErrors.deadline = ''
  fieldErrors.imageUrl = ''
  fieldErrors.categoryId = ''

  // validação mínima frontend
  if (!form.title || form.title.length < 3) { 
    fieldErrors.title = 'Título deve ter pelo menos 3 caracteres'
    return 
  }
  if (!form.description || form.description.length < 10) { 
    fieldErrors.description = 'Descrição deve ter pelo menos 10 caracteres'
    return 
  }
  if (!form.categoryId) { 
    fieldErrors.categoryId = 'Selecione uma categoria'
    return 
  }
  if (!form.goalReais) { 
    fieldErrors.goalCents = 'Informe a meta em reais'
    return 
  }
  if (!form.date) { 
    fieldErrors.deadline = 'Selecione a data limite'
    return 
  }
  
  console.log('✅ Validações passaram, enviando para backend...')
  
  // Validação de data futura
  const selectedDate = new Date(form.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (selectedDate < today) {
    fieldErrors.deadline = 'Data deve ser hoje ou no futuro'
    return
  }

  console.log('🔐 Obtendo token de autenticação...')
  let token
  try {
    token = await getToken.value?.()
    console.log('✅ Token obtido:', token ? 'Token válido' : 'Token nulo')
  } catch (error) {
    console.error('❌ Erro ao obter token:', error)
    Notify.create({ type: 'negative', message: 'Erro de autenticação. Faça login novamente.' })
    return
  }
  
  if (!token) {
    console.log('❌ Token não disponível')
    Notify.create({ type: 'warning', message: 'Faça login para criar campanhas.' })
    return
  }

  const goalCents = reaisToCents(form.goalReais)
  const deadline = mergeDateTimeToISO(form.date, form.time)

  loading.value = true
  console.log('📤 Enviando requisição para o backend...')
  console.log('📋 Dados:', {
    title: form.title,
    description: form.description,
    goalCents,
    deadline,
    imageUrl: form.imageUrl || undefined,
    categoryId: form.categoryId,
  })
  
  try {
    const response = await http.post('/api/projects', {
      title: form.title,
      description: form.description,
      goalCents,
      deadline,
      imageUrl: form.imageUrl || undefined,
      categoryId: form.categoryId,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const createdProject = response.data
    console.log('✅ Resposta do backend:', response)
    console.log('✅ Campanha criada:', createdProject)
    console.log('🆔 ID da campanha:', createdProject?.id)
    
    if (!createdProject?.id) {
      console.error('❌ ID da campanha não encontrado na resposta!')
      try {
        Notify.create({ 
          type: 'warning', 
          message: 'Campanha criada, mas redirecionando para listagem.',
          timeout: 2000
        })
      } catch (notifyError) {
        console.error('❌ Erro no Notify:', notifyError)
      }
      // Fallback para listagem se não tiver ID
      try {
        await router.push('/')
      } catch {
        window.location.href = '/'
      }
      return
    }
    
    try {
      Notify.create({ 
        type: 'positive', 
        message: 'Campanha criada com sucesso! Redirecionando para suas campanhas...',
        timeout: 2000
      })
    } catch (notifyError) {
      console.error('❌ Erro no Notify:', notifyError)
    }
    
    // Limpa o formulário
    form.title = ''
    form.description = ''
    form.goalReais = ''
    form.date = ''
    form.time = '23:59'
    form.imageUrl = ''
    form.categoryId = ''
    
    // Redireciona para a página "Minhas Campanhas"
    console.log('🔄 Redirecionando para Minhas Campanhas: /me')
    try {
      await router.push('/me')
      console.log('✅ Redirecionamento concluído!')
    } catch (routerError) {
      console.error('❌ Erro no redirecionamento:', routerError)
      // Fallback
      window.location.href = '/#/me'
    }
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
      void router.push('/sign-in')
    } else {
      Notify.create({ type: 'negative', message: 'Erro ao criar campanha.' })
      console.error(err)
    }
  } finally {
    loading.value = false
  }
}
</script>
