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
              <div class="text-subtitle2 q-mb-sm">
                <q-icon name="image" class="q-mr-xs" />
                Imagens da Campanha (máximo 5)
              </div>
              
              <q-file
                v-model="selectedImages"
                multiple
                accept="image/*"
                max-files="5"
                max-file-size="5242880"
                :error="!!fieldErrors.images"
                :error-message="fieldErrors.images"
                filled
                counter
                @rejected="onImageRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:append>
                  <q-icon name="add" />
                </template>
              </q-file>
              
              <div class="text-caption text-grey-6 q-mt-xs">
                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB por imagem.
              </div>
              
              <!-- Preview das imagens selecionadas -->
              <div v-if="selectedImages && selectedImages.length > 0" class="q-mt-md">
                <div class="text-caption text-grey-6 q-mb-sm">Preview das imagens:</div>
                <div class="row q-col-gutter-sm">
                  <div 
                    v-for="(image, index) in selectedImages" 
                    :key="index"
                    class="col-6 col-sm-4 col-md-3"
                  >
                    <div class="relative-position">
                      <q-img 
                        :src="getImagePreview(image)" 
                        style="height: 120px; border-radius: 8px;"
                        fit="cover"
                        loading="lazy"
                      >
                        <template v-slot:error>
                          <div class="text-negative text-caption text-center">
                            <q-icon name="error" class="q-mr-xs" />
                            Erro ao carregar
                          </div>
                        </template>
                        <template v-slot:loading>
                          <div class="text-grey-6 text-caption text-center">
                            <q-spinner size="sm" class="q-mr-xs" />
                            Carregando...
                          </div>
                        </template>
                      </q-img>
                      
                      <!-- Botão para remover imagem -->
                      <q-btn
                        round
                        dense
                        color="negative"
                        icon="close"
                        size="sm"
                        class="absolute-top-right q-ma-xs"
                        @click="removeImage(index)"
                      />
                      
                      <!-- Nome do arquivo -->
                      <div class="text-caption text-center q-mt-xs text-grey-7">
                        {{ image.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="q-mt-lg flex items-center">
            <q-btn
              color="primary"
              :label="getSubmitButtonLabel()"
              type="submit"
              :loading="loading || uploadingImages"
            />
            <div v-if="loading || uploadingImages" class="q-ml-md">
              <q-spinner class="q-mr-sm" />
              <span class="text-caption text-grey-6">
                {{ uploadingImages ? 'Enviando imagens...' : 'Criando campanha...' }}
              </span>
            </div>
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
import { projectImagesService } from 'src/services/project-images'
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
  categoryId: ''     // ID da categoria selecionada
})

// imagens selecionadas
const selectedImages = ref<File[]>([])
const uploadingImages = ref(false)

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

// funções para manipular imagens
function getImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

function removeImage(index: number) {
  selectedImages.value.splice(index, 1)
}

function onImageRejected(rejectedEntries: { file: File; failedPropValidation: string }[]) {
  const reasons = rejectedEntries.map(entry => {
    if (entry.failedPropValidation === 'max-file-size') {
      return `${entry.file.name}: arquivo muito grande (máximo 5MB)`
    }
    if (entry.failedPropValidation === 'accept') {
      return `${entry.file.name}: formato não aceito`
    }
    if (entry.failedPropValidation === 'max-files') {
      return 'Máximo de 5 imagens permitidas'
    }
    return `${entry.file.name}: arquivo rejeitado`
  })
  
  Notify.create({
    type: 'negative',
    message: reasons.join(', '),
    timeout: 5000
  })
}

function getSubmitButtonLabel(): string {
  if (uploadingImages.value) {
    return 'Enviando imagens...'
  }
  if (loading.value) {
    return 'Criando...'
  }
  return 'Criar campanha'
}

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
  images: (files: File[]) => {
    if (!files || files.length === 0) return true // Campo opcional
    if (files.length > 5) return 'Máximo de 5 imagens permitidas'
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        return `Arquivo ${file.name} excede o limite de 5MB`
      }
      
      if (!file.type.startsWith('image/')) {
        return `Arquivo ${file.name} não é uma imagem válida`
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
  fieldErrors.images = ''
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
    categoryId: form.categoryId,
    imagesCount: selectedImages.value.length,
  })
  
  try {
    // Primeiro, cria o projeto sem imagens
    const response = await http.post('/api/projects', {
      title: form.title,
      description: form.description,
      goalCents,
      deadline,
      categoryId: form.categoryId,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Se houver imagens selecionadas, fazer upload delas
    if (selectedImages.value.length > 0) {
      console.log('📸 Fazendo upload de', selectedImages.value.length, 'imagens...')
      uploadingImages.value = true
      
      try {
        await projectImagesService.uploadImages(
          response.data.id, 
          selectedImages.value, 
          token
        )
        console.log('✅ Imagens enviadas com sucesso!')
      } catch (uploadError) {
        console.error('❌ Erro ao fazer upload das imagens:', uploadError)
        Notify.create({
          type: 'warning',
          message: 'Campanha criada, mas houve erro no upload das imagens.',
          timeout: 3000
        })
      } finally {
        uploadingImages.value = false
      }
    }

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
    form.categoryId = ''
    selectedImages.value = []
    
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
