<template>
  <q-dialog 
    v-model="isOpen" 
    persistent 
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="edit-project-dialog">
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
            <!-- Project Image -->
            <div class="form-section">
              <h3 class="section-title">
                <q-icon name="image" class="q-mr-sm" />
                Imagem da Campanha
              </h3>
              
              <div class="image-upload-section">
                <!-- Current Image -->
                <div v-if="currentImages.length > 0" class="current-image">
                  <q-img 
                    :src="getImageUrl(currentImages[0].url)" 
                    ratio="16/9" 
                    fit="cover"
                    class="preview-image"
                  />
                  <div class="image-overlay">
                    <q-btn 
                      flat 
                      round 
                      icon="delete" 
                      color="negative"
                      @click="removeImage(currentImages[0].id)"
                      class="remove-image-btn"
                    />
                  </div>
                </div>
                
                <!-- Placeholder when no image -->
                <div v-else class="image-placeholder">
                  <q-icon name="add_photo_alternate" size="3rem" color="grey-5" />
                  <p class="placeholder-text">Nenhuma imagem selecionada</p>
                </div>
                
                <!-- Upload Actions -->
                <div class="image-actions">
                  <q-btn 
                    outline 
                    color="primary" 
                    icon="upload"
                    :label="currentImages.length > 0 ? 'Alterar Imagem' : 'Adicionar Imagem'"
                    @click="triggerImageUpload"
                    :loading="uploadingImages"
                    :disable="uploadingImages"
                    class="upload-btn"
                  >
                    <template #loading>
                      <q-spinner-hourglass class="on-left" />
                      Enviando...
                    </template>
                  </q-btn>
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
                <div class="form-field">
                  <label class="field-label">Meta de Arrecadação *</label>
                  <q-input
                    v-model="goalAmountInput"
                    outlined
                    dense
                    placeholder="0,00"
                    :rules="[val => parseBRLToCents(String(val)) > 0 || 'Meta deve ser maior que zero']"
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
            <q-icon name="edit" color="grey-6" />
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
const saving = ref(false)
const categories = ref<Category[]>([])
const loadingCategories = ref(false)

// Form data
const formData = ref({
  title: '',
  description: '',
  goalCents: 0,
  deadline: '',
  categoryId: ''
})

const currentImages = ref<ProjectImage[]>([])
const uploadingImages = ref(false)

// Auth
const { getToken } = useAuth()

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

const isFormValid = computed(() => {
  const valid = formData.value.title.trim().length > 0 &&
         formData.value.goalCents > 0 &&
         formData.value.deadline &&
         formData.value.categoryId &&
         formData.value.categoryId.trim().length > 0 &&
         new Date(formData.value.deadline) > new Date()
  
  // Debug logs
  if (!valid) {
    console.log('❌ Form validation failed:', {
      title: formData.value.title.trim().length > 0,
      goalCents: formData.value.goalCents > 0,
      deadline: !!formData.value.deadline,
      categoryId: !!formData.value.categoryId,
      deadlineFuture: formData.value.deadline ? new Date(formData.value.deadline) > new Date() : false
    })
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

// ===== Methods =====
async function loadCategories() {
  loadingCategories.value = true
  try {
    categories.value = await categoriesService.getAll()
  } catch (error) {
    console.error('Error loading categories:', error)
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
    categoryId: props.project.categoryId || ''
  }

  // Carregar imagens existentes
  currentImages.value = props.project.images || []

  // normaliza exibição da meta já na abertura
  normalizeGoalAmount()
}

function triggerImageUpload() {
  imageInput.value?.click()
}

async function handleImageUpload(event: Event) {
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
  
  uploadingImages.value = true
  
  try {
    console.log('📤 Uploading image:', file.name)
    
    // Configurar token
    const token = await getToken.value?.()
    if (token) {
      setAuthToken(token)
    }
    
    // Se já existe uma imagem, remover a antiga primeiro
    if (currentImages.value.length > 0) {
      await removeExistingImages()
    }
    
    const response = await projectImagesService.uploadImages(
      props.project.id, 
      [file]
    )
    
    console.log('✅ Image uploaded:', response.images)
    
    // Substituir a imagem atual (sempre apenas 1)
    currentImages.value = response.images
    
    Notify.create({
      type: 'positive',
      message: 'Imagem carregada com sucesso!'
    })
    
  } catch (error: unknown) {
    console.error('❌ Upload error:', error)
    
    let errorMessage = 'Erro ao fazer upload da imagem'
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }
    
    Notify.create({
      type: 'negative',
      message: errorMessage
    })
  } finally {
    uploadingImages.value = false
    // Limpar input
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }
}

async function removeExistingImages() {
  if (!props.project) return
  
  // Configurar token
  const token = await getToken.value?.()
  if (token) {
    setAuthToken(token)
  }
  
  for (const image of currentImages.value) {
    try {
      await projectImagesService.deleteImage(props.project.id, image.id)
    } catch (error) {
      console.warn('⚠️ Could not remove existing image:', error)
    }
  }
}

async function removeImage(imageId: string) {
  if (!props.project) return
  
  try {
    console.log('🗑️ Removing image:', imageId)
    
    // Configurar token
    const token = await getToken.value?.()
    if (token) {
      setAuthToken(token)
    }
    
    await projectImagesService.deleteImage(props.project.id, imageId)
    
    // Limpar a lista (sempre apenas 1 imagem)
    currentImages.value = []
    
    Notify.create({
      type: 'positive',
      message: 'Imagem removida com sucesso!'
    })
    
  } catch (error: unknown) {
    console.error('❌ Remove image error:', error)
    
    let errorMessage = 'Erro ao remover a imagem'
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      }
    }
    
    Notify.create({
      type: 'negative',
      message: errorMessage
    })
  }
}

async function handleSubmit() {
  if (!props.project || !isFormValid.value) {
    console.warn('⚠️ Form validation failed or project not available')
    return
  }
  
  saving.value = true
  
  const updateData = {
    title: formData.value.title.trim(),
    description: formData.value.description && formData.value.description.trim().length >= 10 
      ? formData.value.description.trim() 
      : undefined,
    goalCents: formData.value.goalCents,
    // converte o valor do input local (sem timezone) para ISO UTC corretamente
    deadline: formData.value.deadline
      ? new Date(formData.value.deadline).toISOString()
      : undefined,
    categoryId: formData.value.categoryId && formData.value.categoryId.trim() 
      ? formData.value.categoryId.trim() 
      : undefined
  }
  
  console.log('📤 Sending update data:', updateData)
  console.log('📤 Project ID:', props.project.id)
  
  try {
    // Configurar token
    const token = await getToken.value?.()
    if (token) {
      setAuthToken(token)
    }
    
    const updatedProject = await projectsService.update(props.project.id, updateData)
    console.log('✅ Update successful:', updatedProject)
    
    // Buscar as imagens atualizadas para incluir no projeto
    try {
      const imagesResponse = await projectImagesService.getProjectImages(props.project.id)
      const projectWithImages = {
        ...updatedProject,
        images: imagesResponse.images
      }
      console.log('✅ Project with updated images:', projectWithImages)
      
      emit('projectUpdated', projectWithImages)
    } catch (imageError) {
      console.warn('⚠️ Could not fetch updated images, using project without images:', imageError)
      emit('projectUpdated', updatedProject)
    }
    
    Notify.create({
      type: 'positive',
      message: 'Campanha atualizada com sucesso!',
      icon: 'check_circle'
    })
    
    closeDialog()
    
  } catch (error: unknown) {
    console.error('❌ Update error:', error)
    
    let errorMessage = 'Erro ao atualizar a campanha. Tente novamente.'
    
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
      
      console.error('❌ Axios error details:', axiosError.response)
      
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      } else if (axiosError.response?.data?.details) {
        errorMessage = `Erro de validação: ${JSON.stringify(axiosError.response.data.details)}`
      } else if (axiosError.response?.data?.fieldErrors) {
        const fieldErrors = Object.entries(axiosError.response.data.fieldErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('; ')
        errorMessage = `Erro de validação: ${fieldErrors}`
      }
    }
    
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
  border-bottom: 2px solid #e2e8f0;
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
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  
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
