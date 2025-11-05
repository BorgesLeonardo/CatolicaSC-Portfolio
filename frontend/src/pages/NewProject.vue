<template>
  <q-page class="bg-surface">
  <!-- Hero padrão -->
  <section class="support-hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-badge"><q-icon name="add_circle" class="q-mr-xs" />Nova Campanha</div>
        <h1 class="hero-title">Nova Campanha</h1>
        <p class="hero-subtitle">Preencha os detalhes da sua campanha</p>
      </div>
    </div>
  </section>
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
      <q-card v-if="connectLoading" flat bordered class="q-pa-lg">
        <div class="row items-center">
          <q-spinner class="q-mr-sm" />
          <div class="text-body2">Verificando conexão com Stripe...</div>
        </div>
      </q-card>

      <q-card v-else-if="!connectStatus?.connected || !connectStatus?.chargesEnabled || !connectStatus?.payoutsEnabled" flat bordered class="q-pa-lg">
        <div class="text-h6 q-mb-md">Habilite recebimentos no Stripe</div>
        <div class="text-body2 text-muted q-mb-lg">
          Para criar uma campanha, é necessário estar conectado ao Stripe e com cobranças e saques habilitados.
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-auto">
            <q-btn color="primary" label="Conectar ao Stripe" @click="connectOnboard" />
          </div>
          <div class="col-auto">
            <q-btn flat label="Ir ao Dashboard" to="/dashboard" />
          </div>
        </div>
      </q-card>

      <q-card v-else flat bordered class="q-pa-lg">
        <div class="text-body2 text-muted q-mb-lg">
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

            <div class="col-12">
              <q-option-group
                v-model="form.fundingType"
                type="radio"
                :options="fundingTypeOptions"
                inline
                label="Tipo de Campanha *"
              />
            </div>

            <div class="col-12 col-md-6" v-if="form.fundingType === 'DIRECT'">
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

            <!-- Para campanhas recorrentes não há campo de meta -->

            <div class="col-12 col-md-3" v-if="form.fundingType === 'DIRECT'">
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

            <div class="col-12 col-md-3" v-if="form.fundingType === 'DIRECT'">
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
                <q-icon name="perm_media" class="q-mr-xs" />
                Mídia da Campanha (Imagem ou Vídeo)
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-toggle v-model="useVideo" color="primary" label="Usar vídeo em vez de imagem" />
                </div>
              </div>

              <div v-if="!useVideo">
                <q-file
                  v-model="selectedImage"
                  accept="image/*"
                  max-file-size="5242880"
                  :error="!!fieldErrors.image"
                  :error-message="fieldErrors.image"
                  filled
                  @rejected="onImageRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="add" />
                  </template>
                </q-file>

                <div class="text-caption text-muted q-mt-xs">
                  Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
                </div>

                <!-- Preview da imagem selecionada -->
                <div v-if="selectedImage" class="q-mt-md">
                  <div class="text-caption text-muted q-mb-sm">Preview da imagem:</div>
                  <div class="row justify-center">
                    <div class="col-6 col-sm-4 col-md-3">
                      <div class="relative-position">
                        <q-img 
                          :src="imagePreviewUrl" 
                          style="height: 200px; border-radius: 8px;"
                          fit="cover"
                        >
                          <template v-slot:error>
                            <div class="text-negative text-caption text-center">
                              <q-icon name="error" class="q-mr-xs" />
                              Erro ao carregar
                            </div>
                          </template>
                          <template v-slot:loading>
                            <div class="text-muted text-caption text-center">
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
                          @click="removeImage()"
                        />

                        <!-- Nome do arquivo -->
                        <div class="text-caption text-center q-mt-xs text-muted">
                          {{ selectedImage.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else>
                <q-file
                  v-model="selectedVideo"
                  accept="video/*"
                  max-file-size="104857600"
                  :error="!!fieldErrors.video"
                  :error-message="fieldErrors.video"
                  filled
                >
                  <template v-slot:prepend>
                    <q-icon name="videocam" />
                  </template>
                </q-file>

                <div class="text-caption text-muted q-mt-xs">
                  Formatos aceitos: MP4, WebM, etc. Tamanho máximo: 100MB.
                </div>

                <div v-if="selectedVideo" class="q-mt-md">
                  <div class="text-caption text-muted q-mb-sm">Preview do vídeo:</div>
                  <video :src="videoPreviewUrl" controls style="width: 100%; max-height: 360px; border-radius: 8px;" />
                </div>

                <div class="q-mt-lg">
                  <div class="text-subtitle2 q-mb-sm">
                    <q-icon name="image" class="q-mr-xs" />
                    Capa do Vídeo (opcional)
                  </div>
                  <q-file
                    v-model="selectedCover"
                    accept="image/*"
                    max-file-size="5242880"
                    filled
                  >
                    <template v-slot:prepend>
                      <q-icon name="image" />
                    </template>
                  </q-file>
                  <div v-if="selectedCover" class="q-mt-md">
                    <q-img :src="coverPreviewUrl" style="height: 200px; border-radius: 8px;" fit="cover" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Assinatura (recorrente) -->
            <div class="col-12" v-if="form.fundingType === 'RECURRING'">
              <q-separator class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm">
                <q-icon name="autorenew" class="q-mr-xs" />
                Assinatura recorrente
              </div>
              <div class="row q-col-gutter-md items-center">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="form.subscriptionPriceReais"
                    label="Preço mensal/anual (R$)"
                    type="text"
                    inputmode="decimal"
                    :rules="[rules.required]"
                    debounce="200"
                    lazy-rules
                    :error="!!fieldErrors.subscriptionPriceCents"
                    :error-message="fieldErrors.subscriptionPriceCents"
                    dense
                    filled
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="form.subscriptionInterval"
                    :options="subscriptionIntervalOptions"
                    label="Intervalo"
                    emit-value
                    map-options
                    :rules="[rules.required]"
                    :error="!!fieldErrors.subscriptionInterval"
                    :error-message="fieldErrors.subscriptionInterval"
                    dense
                    filled
                  />
                </div>
              </div>
              <div class="text-caption text-muted q-mt-xs">
                Defina o preço e o intervalo da assinatura.
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
              <span class="text-caption text-muted">
                {{ uploadingImages ? 'Enviando imagem...' : 'Criando campanha...' }}
              </span>
            </div>
          </div>
        </q-form>
      </q-card>
    </SignedIn>
  </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/vue'
import { http, setAuthToken } from 'src/utils/http'
import { Notify } from 'quasar'
import { reaisToCents } from 'src/utils/money'
import { mergeDateTimeToISO } from 'src/utils/datetime'
import { categoriesService } from 'src/services/categories'
import { projectImagesService } from 'src/services/project-images'
import { projectVideosService } from 'src/services/project-videos'
import { connectService } from 'src/services/connect'
import type { Category } from 'src/components/models'
// Atualiza embedUrl quando videoUrl muda (YouTube/Vimeo)
function computeEmbed(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  return ''
}

// moved below after refs are declared


const router = useRouter()
const { getToken } = useAuth()

const loading = ref(false)
const loadingCategories = ref(false)
const connectLoading = ref(true)

// categorias disponíveis
const categoryOptions = ref<Category[]>([])

// estado do formulário
const form = reactive({
  title: '',
  description: '',
  fundingType: 'DIRECT' as 'DIRECT' | 'RECURRING',
  goalReais: '',              // para DIRECT
  recurringGoalReais: '',     // para RECURRING
  date: '',                  // YYYY-MM-DD (QDate)
  time: '23:59',             // HH:mm (QTime) - default
  categoryId: '',            // ID da categoria selecionada
  subscriptionPriceReais: '',
  subscriptionInterval: undefined as undefined | 'MONTH' | 'YEAR'
})

// opções de intervalo para assinatura recorrente
const subscriptionIntervalOptions = [
  { label: 'Mensal', value: 'MONTH' },
  { label: 'Anual', value: 'YEAR' },
]

const fundingTypeOptions = [
  { label: 'Pagamento direto (doação única)', value: 'DIRECT' },
  { label: 'Pagamento recorrente (assinaturas)', value: 'RECURRING' },
]

// mídia: imagem ou vídeo
const selectedImage = ref<File | null>(null)
const selectedVideo = ref<File | null>(null)
const selectedCover = ref<File | null>(null)
const uploadingImages = ref(false)
const useVideo = ref(false)
const videoUrl = ref('')
const embedUrl = ref('')
const connectStatus = ref<{ connected: boolean; chargesEnabled: boolean; payoutsEnabled: boolean } | null>(null)

watch(videoUrl, (val) => {
  embedUrl.value = computeEmbed(val || '')
})

// Preview URLs (memoized to avoid reload on re-render)
const imagePreviewUrl = ref<string | null>(null)
const videoPreviewUrl = ref<string | null>(null)
const coverPreviewUrl = ref<string | null>(null)

function revokeUrl(url: string | null) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}

watch(selectedImage, (file) => {
  // revoke previous then set new
  revokeUrl(imagePreviewUrl.value)
  imagePreviewUrl.value = file ? URL.createObjectURL(file) : null
})

watch(selectedVideo, (file) => {
  revokeUrl(videoPreviewUrl.value)
  videoPreviewUrl.value = file ? URL.createObjectURL(file) : null
})

watch(selectedCover, (file) => {
  revokeUrl(coverPreviewUrl.value)
  coverPreviewUrl.value = file ? URL.createObjectURL(file) : null
})

onUnmounted(() => {
  revokeUrl(imagePreviewUrl.value)
  revokeUrl(videoPreviewUrl.value)
  revokeUrl(coverPreviewUrl.value)
})

// erros por campo (vindos do backend)
const fieldErrors = reactive<Record<string, string>>({})

// carrega categorias ao montar o componente
onMounted(async () => {
  try {
    loadingCategories.value = true
    categoryOptions.value = await categoriesService.getAll()
  } catch {
  // noop: removed debug log
    Notify.create({ 
      type: 'warning', 
      message: 'Não foi possível carregar as categorias' 
    })
  } finally {
    loadingCategories.value = false
  }
})

onMounted(async () => {
  connectLoading.value = true
  try {
    const token = await getToken.value?.()
    setAuthToken(token || null)
    const status = await connectService.status()
    connectStatus.value = status
  } catch {
    connectStatus.value = { connected: false, chargesEnabled: false, payoutsEnabled: false }
  } finally {
    connectLoading.value = false
  }
})

function removeImage() {
  selectedImage.value = null
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

async function connectOnboard() {
  const token = await getToken.value?.()
  setAuthToken(token || null)
  const { url } = await connectService.onboard('/projects/new')
  try { sessionStorage.setItem('connect_return_path', '/projects/new') } catch (_err) { if (import.meta.env.DEV) console.debug(_err) }
  window.location.assign(url)
}

function getSubmitButtonLabel(): string {
  if (uploadingImages.value) {
    return 'Enviando imagem...'
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
    // Aceita 'YYYY-MM-DD' ou 'DD/MM/YYYY' e compara em horário local
    let y: number, m: number, d: number
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const parts = v.split('-').map(Number)
      y = parts[0]; m = parts[1]; d = parts[2]
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      const parts = v.split('/').map(Number)
      d = parts[0]; m = parts[1]; y = parts[2]
    } else {
      return 'Data inválida'
    }
    const selectedDate = new Date(y, (m - 1), d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const cmp = selectedDate.getTime() - today.getTime()
    if (cmp > 0) return true
    if (cmp < 0) return 'Data deve ser hoje ou no futuro'

    // mesma data: validar horário
    const [hh, mm] = String(form.time || '23:59').split(':').map(Number)
    const selectedDateTime = new Date(y, (m - 1), d, hh, mm, 0)
    const now = new Date()
    return selectedDateTime.getTime() >= now.getTime() || 'Hora deve ser no futuro'
  },
  image: (file: File | null) => {
    if (!file) return true // Campo opcional
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return `Arquivo ${file.name} excede o limite de 5MB`
    }
    
    if (!file.type.startsWith('image/')) {
      return `Arquivo ${file.name} não é uma imagem válida`
    }
    
    return true
  }
}

async function submit() {
  // noop: removed debug log
  
  fieldErrors.title = ''
  fieldErrors.description = ''
  fieldErrors.goalCents = ''
  fieldErrors.deadline = ''
  fieldErrors.image = ''
  fieldErrors.video = ''
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
  if (form.fundingType === 'DIRECT') {
    if (!form.goalReais) { 
      fieldErrors.goalCents = 'Informe a meta em reais'
      return 
    }
  } else {
    if (!form.subscriptionPriceReais) {
      fieldErrors.subscriptionPriceCents = 'Informe o preço da assinatura'
      return
    }
    if (!form.subscriptionInterval) {
      fieldErrors.subscriptionInterval = 'Selecione o intervalo da assinatura'
      return
    }
  }
  if (form.fundingType === 'DIRECT') {
    if (!form.date) { 
      fieldErrors.deadline = 'Selecione a data limite'
      return 
    }
  }
  // validações específicas acima por tipo
  
  // noop: removed debug log
  
  // Validação de data futura (apenas para DIRECT)
  if (form.fundingType === 'DIRECT' && form.date) {
    // Parse local: aceita 'YYYY-MM-DD' ou 'DD/MM/YYYY'
    let y: number, m: number, d: number
    if (/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      const parts = form.date.split('-').map(Number)
      y = parts[0]; m = parts[1]; d = parts[2]
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(form.date)) {
      const parts = form.date.split('/').map(Number)
      d = parts[0]; m = parts[1]; y = parts[2]
    } else {
      fieldErrors.deadline = 'Data inválida'
      return
    }
    const selectedDate = new Date(y, (m - 1), d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cmp = selectedDate.getTime() - today.getTime()
    if (cmp < 0) {
      fieldErrors.deadline = 'Data deve ser hoje ou no futuro'
      return
    }
    if (cmp === 0) {
      const [hh, mm] = String(form.time || '23:59').split(':').map(Number)
      const selectedDateTime = new Date(y, (m - 1), d, hh, mm, 0)
      const now = new Date()
      if (selectedDateTime.getTime() < now.getTime()) {
        fieldErrors.deadline = 'Hora deve ser no futuro'
        return
      }
    }
  }

  // noop: removed debug log
  let token
  try {
    token = await getToken.value?.()
    // noop: removed debug log
  } catch {
    // noop: removed debug log
    Notify.create({ type: 'negative', message: 'Erro de autenticação. Faça login novamente.' })
    return
  }
  
  if (!token) {
    // noop: removed debug log
    Notify.create({ type: 'warning', message: 'Faça login para criar campanhas.' })
    return
  }

  const goalCents = form.fundingType === 'DIRECT' ? reaisToCents(form.goalReais) : undefined
  const subscriptionPriceCents = form.fundingType === 'RECURRING' && form.subscriptionPriceReais
    ? reaisToCents(form.subscriptionPriceReais)
    : undefined
  const deadline = form.fundingType === 'DIRECT' ? mergeDateTimeToISO(form.date, form.time) : undefined

  loading.value = true
  // noop: removed debug log
  
  // Configurar token globalmente
  setAuthToken(token)
  
  try {
    // Primeiro, cria o projeto sem imagens
    const response = await http.post('/api/projects', {
      title: form.title,
      description: form.description,
      fundingType: form.fundingType,
      goalCents,
      deadline,
      categoryId: form.categoryId,
      hasImage: !useVideo.value && !!selectedImage.value,
      hasVideo: useVideo.value && !!selectedVideo.value,
      subscriptionPriceCents,
      subscriptionInterval: form.subscriptionInterval,
    })
    
    // Se houver imagem selecionada, fazer upload dela
    if (!useVideo.value && selectedImage.value) {
      // noop: removed debug log
      uploadingImages.value = true
      
      try {
        await projectImagesService.uploadImages(
          response.data.id, 
          [selectedImage.value]
        )
        // noop: removed debug log
      } catch {
        // noop: removed debug log
        Notify.create({
          type: 'warning',
          message: 'Campanha criada, mas houve erro no upload da imagem.',
          timeout: 3000
        })
      } finally {
        uploadingImages.value = false
      }
    }

    // Se houver vídeo/capa selecionados, iniciar uploads em paralelo em segundo plano (não bloquear criação)
    // Se houver vídeo selecionado, validar tamanho e fazer upload
    if (useVideo.value && selectedVideo.value) {
      try {
        const maxBytes = 100 * 1024 * 1024 // 100MB (mesmo limite do backend)
        if (selectedVideo.value.size > maxBytes) {
          Notify.create({ type: 'negative', message: 'O vídeo excede o limite de 100MB.' })
        } else {
          await projectVideosService.uploadVideo(response.data.id, selectedVideo.value)
        }
      } catch {
        Notify.create({ type: 'warning', message: 'Campanha criada, mas houve erro no upload do vídeo.' })
      }
    }

    // Se houver capa selecionada, enviar como primeira imagem
    if (useVideo.value && selectedCover.value) {
      try {
        await projectImagesService.uploadImages(response.data.id, [selectedCover.value])
      } catch {
        // noop: removed debug log
      }
    }

    const createdProject = response.data
    // noop: removed debug log
    
    if (!createdProject?.id) {
      // noop: removed debug log
      try {
        Notify.create({ 
          type: 'warning', 
          message: 'Campanha criada, mas redirecionando para listagem.',
          timeout: 2000
        })
      } catch {
        // noop: removed debug log
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
    } catch {
      // noop: removed debug log
    }
    
    // Limpa o formulário
    form.title = ''
    form.description = ''
    form.fundingType = 'DIRECT'
    form.goalReais = ''
    form.date = ''
    form.time = '23:59'
    form.categoryId = ''
    selectedImage.value = null
    selectedVideo.value = null
    selectedCover.value = null
    useVideo.value = false
    
    // Redireciona para a página "Minhas Campanhas"
    // noop: removed debug log
    try {
      await router.push('/me')
      // noop: removed debug log
    } catch {
      // noop: removed debug log
      // Fallback
      window.location.href = '/#/me'
    }
  } catch (err: unknown) {
    const error = err as { response?: { status?: number; data?: { issues?: { fieldErrors?: Record<string, string | string[]> }, error?: string, message?: string } } }
    const status = error?.response?.status
    const resp = error?.response?.data

    if (status === 422 && resp?.details?.fieldErrors) {
      const fe = resp.details.fieldErrors
      for (const key of Object.keys(fe)) {
        const msg = Array.isArray(fe[key]) ? fe[key][0] : String(fe[key])
        fieldErrors[key] = msg
      }
      Notify.create({ type: 'negative', message: 'Verifique os campos destacados.' })
    } else if (status === 422 && resp?.message) {
      Notify.create({ type: 'negative', message: resp.message })
    } else if (status === 400 && resp?.issues?.fieldErrors) {
      // mapeia erros do Zod para os campos
      const fe = resp.issues.fieldErrors
      for (const key of Object.keys(fe)) {
        const msg = Array.isArray(fe[key]) ? fe[key][0] : String(fe[key])
        // backend usa 'deadline' e 'goalCents' — mantenha nomes iguais aqui
        fieldErrors[key] = msg
      }
      Notify.create({ type: 'negative', message: 'Verifique os campos destacados.' })
    } else if (status === 429) {
      Notify.create({ type: 'warning', message: 'Muitas tentativas. Tente novamente em instantes.' })
    } else if (status === 409 && resp?.error === 'IdempotencyConflict') {
      Notify.create({ type: 'warning', message: 'Requisição duplicada com payload diferente.' })
    } else if (status === 401) {
      Notify.create({ type: 'warning', message: 'Sessão expirada. Entre novamente.' })
      void router.push('/sign-in')
    } else {
      Notify.create({ type: 'negative', message: 'Erro ao criar campanha.' })
      // noop: removed debug log
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container { max-width: 1120px; margin: 0 auto; padding: 0 32px; }

/* Hero padrão */
.support-hero { 
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 40%, #f97316 100%);
  color: #fff;
  padding: 56px 0 44px;
}
.hero-content { text-align: center; max-width: 820px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items:center; gap:6px; background: rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.15); padding:6px 14px; border-radius:9999px; font-weight:600; margin-bottom: 14px; }
.hero-title { font-size: clamp(2rem,4vw,3rem); font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.02em; }
.hero-subtitle { opacity: .95; margin: 0; }
[data-theme='dark'] .support-hero { background: linear-gradient(135deg, #0b1220 0%, #1e3a8a 40%, #9a3412 100%); }
</style>
