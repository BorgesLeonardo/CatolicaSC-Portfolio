<template>
  <q-dialog 
    v-model="isOpen" 
    persistent 
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="edit-project-dialog bg-surface">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="header-content">
          <div class="header-info">
            <q-icon name="edit" size="md" color="primary" />
            <div class="header-text">
              <h2 class="dialog-title">Editar Campanha</h2>
              <p class="dialog-subtitle">Atualize as informações da sua campanha ativa</p>
            </div>
          </div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="closeDialog"
            size="lg"
            class="close-btn"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Form Content -->
      <q-card-section class="dialog-content">
        <div class="form-container">
          <q-form @submit="handleSubmit" class="edit-form">
            <!-- Project Video (when there is no video yet OR when marked for removal but no new file) -->
            <div class="form-section" v-if="(!currentVideoUrl && !pendingNewVideoFile) || (currentVideoUrl && pendingRemoveVideo && !pendingNewVideoFile)">
              <h3 class="section-title">
                <q-icon name="videocam" class="q-mr-sm" />
                {{ currentVideoUrl && pendingRemoveVideo ? 'Vídeo será removido ao salvar' : 'Adicionar Vídeo' }}
              </h3>

              <div class="video-upload-section">
                <div class="text-caption text-muted">Formatos aceitos: MP4, WebM, etc. Tamanho máximo: 100MB.</div>
                <div class="video-actions">
                  <q-btn 
                    outline 
                    color="primary" 
                    icon="upload"
                    :label="currentVideoUrl && pendingRemoveVideo ? 'Adicionar novo Vídeo' : 'Adicionar Vídeo'"
                    @click="triggerVideoUpload"
                    class="upload-btn"
                  >
                  </q-btn>
                  <q-btn
                    v-if="currentVideoUrl && pendingRemoveVideo"
                    flat
                    color="grey-7"
                    icon="undo"
                    label="Desfazer remoção"
                    @click="cancelPendingVideoChange"
                  />
                  <input
                    ref="videoInputEmpty"
                    type="file"
                    accept="video/*"
                    @change="handleVideoUpload"
                    style="display: none"
                  />
                </div>
              </div>
            </div>

            <!-- Project Video (preview of selected new file) -->
            <div class="form-section" v-if="pendingNewVideoFile">
              <h3 class="section-title">
                <q-icon name="videocam" class="q-mr-sm" />
                Pré-visualização do novo vídeo (será aplicado ao salvar)
              </h3>
              <div class="video-upload-section">
                <div class="current-video">
                  <video :src="pendingNewVideoPreviewUrl || ''" controls style="width: 100%; max-height: 360px; border-radius: 8px;" />
                </div>
                <div class="video-actions">
                  <q-btn 
                    outline 
                    color="primary" 
                    icon="upload"
                    label="Trocar Vídeo"
                    @click="triggerVideoUpload"
                    class="upload-btn"
                  />
                  <q-btn
                    flat
                    color="grey-7"
                    icon="close"
                    label="Cancelar"
                    @click="cancelPendingVideoChange"
                  />
                  <input
                    ref="videoInput"
                    type="file"
                    accept="video/*"
                    @change="handleVideoUpload"
                    style="display: none"
                  />
                </div>
              </div>
            </div>

            <!-- Project Video (only when there is a video and no pending new file or removal) -->
            <div class="form-section" v-if="currentVideoUrl && !pendingRemoveVideo && !pendingNewVideoFile">
              <h3 class="section-title">
                <q-icon name="videocam" class="q-mr-sm" />
                Vídeo da Campanha
              </h3>

              <div class="video-upload-section">
                <div class="current-video">
                  <video :src="currentVideoUrl" controls style="width: 100%; max-height: 360px; border-radius: 8px;" />
                </div>

                <div class="video-actions">
                  <q-btn 
                    outline 
                    color="primary" 
                    icon="upload"
                    label="Alterar Vídeo"
                    @click="triggerVideoUpload"
                    class="upload-btn"
                  >
                  </q-btn>
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    label="Remover Vídeo"
                    @click="removeVideo"
                  />
                  <input
                    ref="videoInput"
                    type="file"
                    accept="video/*"
                    @change="handleVideoUpload"
                    style="display: none"
                  />
                </div>
              </div>
            </div>

            <!-- Project Image -->
            <div class="form-section">
              <h3 class="section-title">
                <q-icon name="image" class="q-mr-sm" />
                {{ imageSectionTitle }}
              </h3>
              
              <div class="image-upload-section">
                <!-- Current Image -->
                <div v-if="pendingNewImagePreviewUrl" class="current-image">
                  <img :src="pendingNewImagePreviewUrl" alt="Pré-visualização da imagem" class="preview-image native-preview" />
                </div>
                <div v-else-if="currentImages.length > 0 && !pendingRemoveImage" class="current-image">
                  <img :src="getImageUrl(currentImages[0].url)" alt="Capa atual" class="preview-image native-preview" />
                  <div class="image-overlay">
                    <q-btn 
                      flat 
                      round 
                      icon="delete" 
                      color="negative"
                      @click="removeImage()"
                      class="remove-image-btn"
                    />
                  </div>
                </div>
                
                <!-- Placeholder when no image -->
                <div v-else class="image-placeholder">
                  <q-icon name="add_photo_alternate" size="3rem" class="icon-muted" />
                  <p class="placeholder-text">
                    {{ pendingRemoveImage ? 'Imagem será removida ao salvar' : 'Nenhuma imagem selecionada' }}
                  </p>
                </div>
                
                <!-- Upload Actions -->
                <div class="image-actions">
                  <q-btn 
                    outline 
                    color="primary" 
                    icon="upload"
                    :label="(currentImages.length > 0 && !pendingRemoveImage) ? 'Alterar Imagem' : 'Adicionar Imagem'"
                    @click="triggerImageUpload"
                    class="upload-btn"
                  >
                  </q-btn>
                  <q-btn
                    v-if="pendingRemoveImage"
                    flat
                    color="grey-7"
                    icon="undo"
                    label="Desfazer remoção"
                    @click="cancelPendingImageChange"
                  />
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  style="display: none"
                />
                </div>
              </div>
            </div>

            <!-- Basic Information -->
            <div class="form-section">
              <h3 class="section-title">
                <q-icon name="info" class="q-mr-sm" />
                Informações Básicas
              </h3>
              
              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">Título da Campanha *</label>
                  <q-input
                    v-model="formData.title"
                    outlined
                    dense
                    placeholder="Digite o título da sua campanha"
                    :rules="[val => !!val || 'Título é obrigatório']"
                    class="form-input"
                    maxlength="100"
                    counter
                  >
                    <template #prepend>
                      <q-icon name="title" color="primary" />
                    </template>
                  </q-input>
                </div>

                <div class="form-field">
                  <label class="field-label">Categoria *</label>
                  <q-select
                    v-model="formData.categoryId"
                    :options="categories"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    outlined
                    dense
                    placeholder="Selecione uma categoria"
                    :loading="loadingCategories"
                    :rules="[val => !!val || 'Categoria é obrigatória']"
                    class="form-input"
                  >
                    <template #prepend>
                      <q-icon name="category" color="primary" />
                    </template>
                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          {{ loadingCategories ? 'Carregando...' : 'Nenhuma categoria disponível' }}
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="form-field full-width">
                  <label class="field-label">Descrição</label>
                  <q-input
                    v-model="formData.description"
                    outlined
                    type="textarea"
                    rows="4"
                    placeholder="Descreva sua campanha, objetivos e como os recursos serão utilizados"
                    class="form-input"
                    maxlength="2000"
                    counter
                  >
                    <template #prepend>
                      <q-icon name="description" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Financial and Timeline -->
            <div class="form-section">
              <h3 class="section-title">
                <q-icon name="monetization_on" class="q-mr-sm" />
                Meta Financeira e Prazo
              </h3>
              
              <div class="form-grid">
                <div class="form-field" v-if="!isSubscription">
                  <label class="field-label">Meta de Arrecadação *</label>
                  <q-input
                    v-model="goalAmountInput"
                    outlined
                    dense
                    placeholder="0,00"
                    :rules="[val => parseBRLToCents(String(val)) >= 1000 || 'Meta mínima é R$ 10,00']"
                    class="form-input"
                    @blur="normalizeGoalAmount"
                  >
                    <template #prepend>
                      <q-icon name="attach_money" color="primary" />
                    </template>
                    <template #append>
                      <span class="currency-label">BRL</span>
                    </template>
                  </q-input>
                </div>

                <div class="form-field" v-if="isSubscription">
                  <label class="field-label">Preço da Assinatura *</label>
                  <q-input
                    v-model="subscriptionPriceInput"
                    outlined
                    dense
                    placeholder="0,00"
                    :rules="[val => parseBRLToCents(String(val)) >= 500 || 'Preço mínimo é R$ 5,00']"
                    class="form-input"
                    @blur="normalizeSubscriptionPrice"
                  >
                    <template #prepend>
                      <q-icon name="payments" color="primary" />
                    </template>
                    <template #append>
                      <span class="currency-label">BRL</span>
                    </template>
                  </q-input>
                </div>

                <div class="form-field">
                  <label class="field-label">Data Limite *</label>
                  <q-input
                    v-model="formData.deadline"
                    outlined
                    dense
                    type="datetime-local"
                    :rules="[val => !!val && new Date(val) > new Date() || 'Data deve ser futura']"
                    class="form-input"
                    :min="minDate"
                  >
                    <template #prepend>
                      <q-icon name="schedule" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Project Status Info -->
            <div class="form-section">
              <div class="status-info">
                <q-icon name="info" color="info" class="q-mr-sm" />
                <div class="status-text">
                  <strong>Importante:</strong> Algumas alterações podem afetar contribuidores existentes. 
                  Certifique-se de comunicar mudanças significativas aos apoiadores.
                </div>
              </div>
            </div>
          </q-form>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="dialog-actions">
        <div class="actions-container">
          <div class="action-info">
            <q-icon name="edit" class="icon-muted" />
            <span class="info-text">Última edição: {{ formatLastUpdate }}</span>
          </div>
          
          <div class="action-buttons">
            <q-btn 
              flat 
              label="Cancelar" 
              @click="closeDialog"
              class="cancel-btn"
            />
            <q-btn 
              color="primary" 
              label="Salvar Alterações"
              @click="handleSubmit"
              :loading="saving"
              :disable="!isFormValid"
              class="save-btn"
            >
              <template #loading>
                <q-spinner-hourglass class="on-left" />
                Salvando...
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useAuth } from '@clerk/vue'
import { setAuthToken } from 'src/utils/http'
import { projectsService } from 'src/services/projects'
import { projectImagesService } from 'src/services/project-images'
import { projectVideosService } from 'src/services/project-videos'
import { categoriesService } from 'src/services/categories'
import type { Project, Category, ProjectImage } from 'src/components/models'

interface Props {
  modelValue: boolean
  project: Project | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'projectUpdated', project: Project): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs
const imageInput = ref<HTMLInputElement>()
const videoInput = ref<HTMLInputElement>()
const videoInputEmpty = ref<HTMLInputElement>()
const saving = ref(false)
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// Form data
const formData = ref({
  title: '',
  description: '',
  goalCents: 0,
  deadline: '',
  categoryId: '',
  subscriptionPriceCents: 0
})

const currentImages = ref<ProjectImage[]>([])
const currentVideoUrl = ref<string | undefined>(undefined)

// Pending media changes (apply on save)
const pendingNewImageFile = ref<File | null>(null)
const pendingNewImagePreviewUrl = ref<string | null>(null)
const pendingRemoveImage = ref(false)

const pendingNewVideoFile = ref<File | null>(null)
const pendingNewVideoPreviewUrl = ref<string | null>(null)
const pendingRemoveVideo = ref(false)

// Auth
const { getToken } = useAuth()

// ===== Helpers compartilhados para reduzir duplicação =====
// Labels amigáveis para campos vindos do backend
const friendlyFieldLabels: Record<string, string> = {
  subscriptionPriceCents: 'Preço da Assinatura',
  subscriptionInterval: 'Intervalo da Assinatura',
  goalCents: 'Meta',
  deadline: 'Data Limite',
  categoryId: 'Categoria',
  title: 'Título',
  description: 'Descrição'
}

async function ensureAuthToken(): Promise<void> {
  const token = await getToken.value?.()
  if (token) {
    setAuthToken(token)
  }
}

function formatFieldErrors(fieldErrors: Record<string, string[]>): string {
  if (fieldErrors.subscriptionPriceCents && fieldErrors.subscriptionPriceCents.length > 0) {
    return fieldErrors.subscriptionPriceCents[0]
  }
  const joined = Object.entries(fieldErrors)
    .map(([field, errors]) => `${friendlyFieldLabels[field] ?? field}: ${errors.join(', ')}`)
    .join('; ')
  return joined
    ? `Algumas informações precisam de atenção: ${joined}`
    : 'Algumas informações precisam de atenção. Verifique os campos e tente novamente.'
}

function extractAxiosErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: {
          message?: string
          details?: unknown
          fieldErrors?: Record<string, string[]>
        }
      }
    }
    const data = axiosError.response?.data
    if (data?.fieldErrors) {
      return formatFieldErrors(data.fieldErrors)
    }
    if (data?.details && typeof data.details === 'object' && 'fieldErrors' in (data.details as { fieldErrors?: Record<string, string[]> })) {
      const details = data.details as { fieldErrors: Record<string, string[]> }
      return formatFieldErrors(details.fieldErrors)
    }
    if (data?.message) return data.message
  }
  return fallback
}

// ===== Helpers de moeda (pt-BR) =====
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseBRLToCents(input: string): number {
  // remove espaços, remove separadores de milhar ".", troca vírgula por ponto
  const cleaned = (input || '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const n = Number(cleaned)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

// Computed para o input da Meta: string <-> cents
const goalAmountInput = computed<string>({
  get() {
    return formData.value.goalCents > 0
      ? formatBRL(formData.value.goalCents / 100)
      : ''
  },
  set(val: string) {
    formData.value.goalCents = parseBRLToCents(val)
  }
})

function normalizeGoalAmount() {
  if (formData.value.goalCents > 0) {
    goalAmountInput.value = formatBRL(formData.value.goalCents / 100)
  } else {
    goalAmountInput.value = ''
  }
}

// Computed para o input do preço de assinatura
const subscriptionPriceInput = computed<string>({
  get() {
    return (formData.value.subscriptionPriceCents ?? 0) > 0
      ? formatBRL(((formData.value.subscriptionPriceCents ?? 0) / 100))
      : ''
  },
  set(val: string) {
    formData.value.subscriptionPriceCents = parseBRLToCents(val)
  }
})

function normalizeSubscriptionPrice() {
  if ((formData.value.subscriptionPriceCents ?? 0) > 0) {
    subscriptionPriceInput.value = formatBRL(((formData.value.subscriptionPriceCents ?? 0) / 100))
  } else {
    subscriptionPriceInput.value = ''
  }
}

// ===== Computeds =====
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().slice(0, 16)
})

// Campanha de assinatura (recorrente) não usa meta de arrecadação
const isSubscription = computed(() => !!props.project?.subscriptionEnabled)

const isFormValid = computed(() => {
  const hasTitle = formData.value.title.trim().length > 0
  const hasValidDeadline = !!formData.value.deadline && new Date(formData.value.deadline) > new Date()
  const hasCategory = !!formData.value.categoryId && formData.value.categoryId.trim().length > 0
  const hasGoalWhenRequired = isSubscription.value ? true : formData.value.goalCents >= 500
  const hasSubscriptionPriceWhenRequired = isSubscription.value ? (formData.value.subscriptionPriceCents ?? 0) >= 500 : true

  const valid = hasTitle && hasValidDeadline && hasCategory && hasGoalWhenRequired && hasSubscriptionPriceWhenRequired
  
  // Debug logs
  if (!valid) {
    // noop: removed debug log
  }
  
  return valid
})

const formatLastUpdate = computed(() => {
  if (!props.project) return ''
  return new Date(props.project.updatedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const imageSectionTitle = computed(() => currentVideoUrl.value ? 'Capa do Vídeo' : 'Imagem da Campanha')

// ===== Methods =====
async function loadCategories() {
  loadingCategories.value = true
  try {
    categories.value = await categoriesService.getAll()
  } catch {
    // noop: removed debug log
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar categorias',
      icon: 'error'
    })
  } finally {
    loadingCategories.value = false
  }
}

function initializeForm() {
  if (!props.project) return
  
  formData.value = {
    title: props.project.title,
    description: props.project.description || '',
    goalCents: props.project.goalCents,
    deadline: new Date(props.project.deadline).toISOString().slice(0, 16),
    categoryId: props.project.categoryId || '',
    subscriptionPriceCents: props.project.subscriptionPriceCents
  }

  // Carregar imagens existentes
  currentImages.value = props.project.images || []
  currentVideoUrl.value = props.project.videoUrl

  // Reset pending media changes
  pendingNewImageFile.value = null
  pendingNewImagePreviewUrl.value = null
  pendingRemoveImage.value = false
  pendingNewVideoFile.value = null
  pendingNewVideoPreviewUrl.value = null
  pendingRemoveVideo.value = false

  // Garantir que buscamos as imagens atuais do backend ao abrir
  void refreshProjectImages()

  // normaliza exibição da meta já na abertura
  normalizeGoalAmount()
  // normaliza exibição do preço de assinatura
  normalizeSubscriptionPrice()
}

function triggerImageUpload() {
  imageInput.value?.click()
}

function triggerVideoUpload() {
  if (videoInput.value) {
    videoInput.value.click()
    return
  }
  videoInputEmpty.value?.click()
}

async function refreshProjectImages() {
  if (!props.project) return
  try {
    const resp = await projectImagesService.getProjectImages(props.project.id)
    currentImages.value = resp.images

    // Fallback: usar imageUrl legado como capa quando não houver imagens na API
    if ((!currentImages.value || currentImages.value.length === 0) && props.project.imageUrl) {
      currentImages.value = [{
        id: 'legacy-cover',
        projectId: props.project.id,
        url: props.project.imageUrl,
        mimeType: 'image/*',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as ProjectImage]
    }
  } catch {
    // noop
  }
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files || files.length === 0) return
  
  // Limitar a apenas 1 arquivo
  const file = files[0]
  
  // Validar arquivo
  if (file.size > 5 * 1024 * 1024) { // 5MB
    Notify.create({
      type: 'negative',
      message: 'A imagem deve ter no máximo 5MB'
    })
    return
  }
  
  if (!file.type.startsWith('image/')) {
    Notify.create({
      type: 'negative',
      message: 'O arquivo selecionado não é uma imagem válida'
    })
    return
  }
  
  if (!props.project) {
    Notify.create({
      type: 'negative',
      message: 'Projeto não encontrado'
    })
    return
  }
  
  // Queue change locally (apply on save)
  pendingNewImageFile.value = file
  pendingRemoveImage.value = false
  if (pendingNewImagePreviewUrl.value) URL.revokeObjectURL(pendingNewImagePreviewUrl.value)
  pendingNewImagePreviewUrl.value = URL.createObjectURL(file)
  if (imageInput.value) imageInput.value.value = ''
  Notify.create({ type: 'info', message: 'Imagem selecionada. Clique em "Salvar Alterações" para aplicar.' })
}

function handleVideoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  const file = files[0]

  // Validações
  if (!file.type.startsWith('video/')) {
    Notify.create({ type: 'negative', message: 'Selecione um arquivo de vídeo válido' })
    return
  }
  if (file.size > 100 * 1024 * 1024) {
    Notify.create({ type: 'negative', message: 'O vídeo deve ter no máximo 100MB' })
    return
  }
  if (!props.project) {
    Notify.create({ type: 'negative', message: 'Projeto não encontrado' })
    return
  }

  // Queue change locally (apply on save)
  pendingNewVideoFile.value = file
  pendingRemoveVideo.value = false
  if (pendingNewVideoPreviewUrl.value) URL.revokeObjectURL(pendingNewVideoPreviewUrl.value)
  pendingNewVideoPreviewUrl.value = URL.createObjectURL(file)
  if (videoInput.value) videoInput.value.value = ''
  if (videoInputEmpty.value) videoInputEmpty.value.value = ''
  Notify.create({ type: 'info', message: 'Vídeo selecionado. Clique em "Salvar Alterações" para aplicar.' })
}

async function removeExistingImages() {
  if (!props.project) return
  
  // Configurar token
  await ensureAuthToken()
  
  for (const image of currentImages.value) {
    try {
      await projectImagesService.deleteImage(props.project.id, image.id)
    } catch {
      // noop: removed debug log
    }
  }
}

function removeImage() {
  // Queue removal (apply on save)
  pendingRemoveImage.value = true
  pendingNewImageFile.value = null
  if (pendingNewImagePreviewUrl.value) {
    URL.revokeObjectURL(pendingNewImagePreviewUrl.value)
    pendingNewImagePreviewUrl.value = null
  }
  Notify.create({ type: 'info', message: 'A imagem será removida ao salvar.' })
}

function removeVideo() {
  // Queue removal (apply on save)
  pendingRemoveVideo.value = true
  pendingNewVideoFile.value = null
  if (pendingNewVideoPreviewUrl.value) {
    URL.revokeObjectURL(pendingNewVideoPreviewUrl.value)
    pendingNewVideoPreviewUrl.value = null
  }
  Notify.create({ type: 'info', message: 'O vídeo será removido ao salvar.' })
}

function cancelPendingVideoChange() {
  pendingRemoveVideo.value = false
  if (pendingNewVideoPreviewUrl.value) {
    URL.revokeObjectURL(pendingNewVideoPreviewUrl.value)
    pendingNewVideoPreviewUrl.value = null
  }
  pendingNewVideoFile.value = null
}

function cancelPendingImageChange() {
  pendingRemoveImage.value = false
  if (pendingNewImagePreviewUrl.value) {
    URL.revokeObjectURL(pendingNewImagePreviewUrl.value)
    pendingNewImagePreviewUrl.value = null
  }
  pendingNewImageFile.value = null
}

async function handleSubmit() {
  if (!props.project || !isFormValid.value) {
    // noop: removed debug log
    return
  }
  
  saving.value = true
  
  const updateData = {
    title: formData.value.title.trim(),
    description: formData.value.description && formData.value.description.trim().length >= 10 
      ? formData.value.description.trim() 
      : undefined,
    goalCents: isSubscription.value ? undefined : formData.value.goalCents,
    // preço de assinatura quando for campanha recorrente
    subscriptionPriceCents: isSubscription.value ? (formData.value.subscriptionPriceCents ?? 0) : undefined,
    // converte o valor do input local (sem timezone) para ISO UTC corretamente
    deadline: formData.value.deadline
      ? new Date(formData.value.deadline).toISOString()
      : undefined,
    categoryId: formData.value.categoryId && formData.value.categoryId.trim() 
      ? formData.value.categoryId.trim() 
      : undefined
  }
  
  // noop: removed debug log
  
  try {
    // Configurar token
    await ensureAuthToken()

    // ----- Apply media changes (Video) -----
    let latestVideoUrl: string | undefined = currentVideoUrl.value
    if (pendingNewVideoFile.value) {
      try {
        const resp = await projectVideosService.uploadVideo(props.project.id, pendingNewVideoFile.value)
        latestVideoUrl = resp.videoUrl
      } catch (err) {
        const message = extractAxiosErrorMessage(err, 'Erro ao enviar o vídeo')
        throw new Error(message)
      }
    } else if (pendingRemoveVideo.value && currentVideoUrl.value) {
      try {
        await projectVideosService.deleteVideo(props.project.id)
        latestVideoUrl = undefined
      } catch (err) {
        const message = extractAxiosErrorMessage(err, 'Erro ao remover o vídeo')
        throw new Error(message)
      }
    }

    // ----- Apply media changes (Image/Cover) -----
    if (pendingNewImageFile.value) {
      if (currentImages.value.length > 0) {
        await removeExistingImages()
      }
      try {
        const response = await projectImagesService.uploadImages(props.project.id, [pendingNewImageFile.value])
        currentImages.value = response.images
      } catch (err) {
        const message = extractAxiosErrorMessage(err, 'Erro ao fazer upload da imagem')
        throw new Error(message)
      }
    } else if (pendingRemoveImage.value && currentImages.value.length > 0) {
      await removeExistingImages()
      currentImages.value = []
    }
    
    const updatedProject = await projectsService.update(props.project.id, updateData)
    // noop: removed debug log
    
    // Buscar as imagens atualizadas para incluir no projeto
    try {
      const imagesResponse = await projectImagesService.getProjectImages(props.project.id)
      const projectWithImages = {
        ...updatedProject,
        videoUrl: latestVideoUrl,
        images: imagesResponse.images
      }
      // noop: removed debug log
      
      emit('projectUpdated', projectWithImages)
    } catch {
      // noop: removed debug log
      emit('projectUpdated', { ...updatedProject, videoUrl: latestVideoUrl })
    }
    
    Notify.create({
      type: 'positive',
      message: 'Campanha atualizada com sucesso!',
      icon: 'check_circle'
    })
    
    closeDialog()
    
  } catch (error: unknown) {
    // noop: removed debug log
    const errorMessage = extractAxiosErrorMessage(error, 'Erro ao atualizar a campanha. Tente novamente.')
    Notify.create({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
      timeout: 5000
    })
  } finally {
    saving.value = false
  }
}

function getImageUrl(url: string): string {
  // Se é uma URL relativa, adicionar o base URL do backend
  if (url.startsWith('/uploads/')) {
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? '' // Em produção, usar URL relativa
      : 'http://localhost:3333' // Em desenvolvimento
    return `${backendUrl}${url}`
  }
  return url
}

function closeDialog() {
  isOpen.value = false
}

// ===== Watchers =====
watch(() => props.project, (newProject) => {
  if (newProject) {
    void nextTick(() => {
      initializeForm()
    })
  }
}, { immediate: true })

watch(isOpen, (newValue) => {
  if (newValue && props.project) {
    initializeForm()
  }
})

// Load categories on component mount
onMounted(() => {
  void loadCategories()
})
</script>

<style scoped lang="scss">
.edit-project-dialog {
  width: 100%;
  max-width: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.dialog-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  padding: 24px 32px;
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .header-text {
    .dialog-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    
    .dialog-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.9375rem;
    }
  }
  
  .close-btn {
    color: #64748b;
    
    &:hover {
      background: rgba(100, 116, 139, 0.1);
      color: #475569;
    }
  }
}

/* CONTENT */
.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-border);
}

/* IMAGE UPLOAD */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}


.current-image {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  
  .preview-image {
    border-radius: 12px;
  }
  .native-preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 1;
    }
  }
  
  .remove-image-btn {
    background: rgba(255, 255, 255, 0.9);
    color: #ef4444;
  }
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  background: var(--color-surface-muted);
  
  .placeholder-text {
    color: #64748b;
    margin: 8px 0 0 0;
    font-size: 0.9375rem;
  }
}

.image-actions {
  display: flex;
  gap: 12px;
  
  .upload-btn {
    font-weight: 600;
  }
}

.video-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-actions {
  display: flex;
  gap: 12px;
}

/* FORM FIELDS */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &.full-width {
    grid-column: 1 / -1;
  }
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  .q-field__control {
    border-radius: 8px;
  }
}

.currency-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* STATUS INFO */
.status-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  
  .status-text {
    color: #1e40af;
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

/* ACTIONS */
.dialog-actions {
  border-top: 1px solid rgba(229, 231, 235, 0.3);
  padding: 24px 32px;
  background: #fafbfc;
}

.actions-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

.action-info {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .info-text {
    color: #64748b;
    font-size: 0.8125rem;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  
  @media (max-width: 640px) {
    justify-content: stretch;
    
    .q-btn {
      flex: 1;
    }
  }
}

.cancel-btn {
  color: #64748b;
  
  &:hover {
    background: rgba(100, 116, 139, 0.1);
  }
}

.save-btn {
  font-weight: 600;
  padding: 8px 24px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .dialog-header {
    padding: 20px 16px;
    
    .header-info {
      gap: 12px;
    }
    
    .dialog-title {
      font-size: 1.25rem;
    }
  }
  
  .dialog-content {
    padding: 24px 16px;
  }
  
  .dialog-actions {
    padding: 20px 16px;
  }
}
</style>
